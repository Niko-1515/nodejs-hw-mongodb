import createHttpError from 'http-errors';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import { UsersCollection } from '../db/models/user.js';
import { SessionsCollection } from '../db/models/session.js';

import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';

// ✅ Асинхронна функція-сервіс:
// перевірка чи є користувач з такою емейл-адресою в базі --> якщо є --> викидає помилку
// якщо ні --> реєструє нового користувача --> повертає зареєстрованого користувача
// hashedPassword --> хешований пароль (формується за допомогою bcrypt) --> бере payload.password з req.body і хеширує його
// 10 --> кількість раундів хешування
export const registerUser = async (payload) => {
  const existingUser = await UsersCollection.findOne({ email: payload.email });
  if (existingUser) {
    throw createHttpError(409, 'This email is already in use');
  }

  // метод bcrypt.hash --> хеширує пароль
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  // ❗ можна просто перевизначити payload.password не створюючи hashedPassword

  // Для дебагу --> виводить в консоль пароль, який ввів користувач і хешований пароль
  if (process.env.NODE_ENV === 'development') {
    console.log('payload.password:', payload.password);
    console.log('hashedPassword:', hashedPassword);
  }

  // метод create() використовується для створення нового документу в колекції UsersCollection
  // payload --> об'єкт, який містить дані нового користувача (без паролю)
  // payload.password --> пароль нового користувача (хешований) --> додається до об'єкта payload
  const newUser = await UsersCollection.create({
    ...payload,
    password: hashedPassword,
  });

  return newUser;
};

// ✅ Асинхронна функція-сервіс для входу користувача
// payload --> об'єкт, який містить дані користувача (email і пароль)

export const loginUser = async (payload) => {
  // existingUser --> об'єкт користувача, який повертає метод findOne({ email: payload.email }) або null, якщо користувача не знайдено
  const existingUser = await UsersCollection.findOne({ email: payload.email });

  // якщо користувача (ідентифікуємо по email) не знайдено (existingUser === null) --> викидає помилку
  if (!existingUser) {
    throw createHttpError(401, 'Email or password is wrong');
  }

  // isPasswordEqual --> булева змінна (true або false), яка вказує, чи паролі (який ввів користувач і хешований з бази) співпадають
  // метод bcrypt.compare --> використовується для порівняння хешованих паролів (який ввів користувач і хешований з бази)
  const isPasswordEqual = await bcrypt.compare(
    payload.password,
    existingUser.password,
  );

  // якщо паролі не співпадають (isPasswordEqual === false) --> викидає помилку
  if (!isPasswordEqual) {
    throw createHttpError(401, 'Email or password is wrong');
  }

  // асинхронний запит до колекції SessionsCollection для видалення попередньої сесії користувача з відповідним _id (видалення старої сесії)
  await SessionsCollection.deleteOne({ userId: existingUser._id });

  // генерація токенів (за допомогою randomBytes)
  // accessToken --> токен доступу
  // refreshToken --> токен оновлення (для accessToken)
  // 30 --> кількість байтів, які будуть згенеровані
  // base64 --> кодування в base64
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  // асинхронний запит до колекції SessionsCollection для створення нової сесії користувача
  // existingUser._id --> _id користувача, який залогінився (тобто -> ця сесія належить користувачу з таким _id у users)
  // accessToken --> токен доступу на 15 хвилин
  // refreshToken --> токен оновлення (для accessToken) на 30 днів
  return await SessionsCollection.create({
    userId: existingUser._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  });
};

// ✅ Асинхронна функція-сервіс для виходу користувача
// sessionId --> _id актуальної сесії (документу в колекції Sessions) користувача --> витягується з cookies (req.cookies) в контролері logoutUserController
export const logoutUser = async (sessionId, refreshToken) => {
  // якщо _id актуальної сесії користувача не валідний (якщо не є ObjectId) --> викидає помилку
  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    throw createHttpError(400, 'Invalid session ID');
  }
  // асинхронний запит до колекції SessionsCollection для пошуку і видалення попередньої сесії користувача з відповідними _id і refreshToken
  const session = await SessionsCollection.findOneAndDelete({
    _id: sessionId,
    refreshToken: refreshToken,
  });

  // Якщо сесії немає --> викидаємо помилку
  if (!session) {
    throw createHttpError(401, 'Session not found or invalid token');
  }

  // повертаємо сесію
  return session;
};

// ✅ Функція для генерації нових токенів (accessToken і refreshToken)
const createNewSession = () => {
  // генерація токенів (за допомогою randomBytes)
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  // повертаємо об'єкт з accessToken і refreshToken
  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

// ✅ Асинхронна функція-сервіс для оновлення сесії користувача (refresh)
export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  // робимо запит на знаходження попередньої сесії користувача з відповідним _id і refreshToken
  const currentSession = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken: refreshToken,
  });

  // якщо сесії немає (currentSession === null) --> викидаємо помилку
  if (!currentSession) {
    throw createHttpError(401, 'Session not found or invalid token');
  }

  // перевіряємо чи закінчився термін дії refreshToken
  const isSessionTokenExpired =
    new Date() > new Date(currentSession.refreshTokenValidUntil);

  // якщо закінчився термін дії refreshToken --> викидаємо помилку
  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token is expired');
  }

  // створюємо нову сесію (за допомогою createNewSession)
  const newSession = createNewSession();

  // видаляємо попередню сесію користувача (з відповідним _id і refreshToken)
  await SessionsCollection.deleteOne({
    _id: sessionId,
    refreshToken: refreshToken,
  });

  // Створюємо нову сесію користувача і повертаємо їі
  // Повертаємо об'єкт:
  // userId -> userId попередньої сесії користувача і всі поля нової сесіі (accessToken, refreshToken, accessTokenValidUntil, refreshTokenValidUntil)
  return await SessionsCollection.create({
    userId: currentSession.userId,
    ...newSession,
  });
};
