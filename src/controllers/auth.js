import { THIRTY_DAYS } from '../constants/index.js';
import {
  loginUser,
  logoutUser,
  refreshUsersSession,
  registerUser,
} from '../services/auth.js';

// ✅ Контролер для реєстрації користувача
// Викликає асинхронну функцію-сервіс registerUser --> передає req.body
// Реєструє нового користувача --> повертає статус 201, повідомлення і об'єкт зареєстрованого користувача (❗ без паролю)
export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  // Варіант Видалення пароля з об'єкта користувача
  // ✅ Актуальна реєстрації в моделі src/db/models/user.js
  // ✅ const { password, ...userData } = user.toObject();

  // user --> об'єкт, який повертає метод UsersCollection.create(payload) з сервісу src/services/auth.js
  // У Mongoose --> це не звичайний JavaScript-об'єкт, а спеціальний об'єкт типу Document
  // user.toObject() --> перетворює Mongoose-документ у звичайний JavaScript-об'єкт

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a new user!',
    data: user,
  });
};

// ✅ Контролер для входу користувача
// session --> об'єкт, який повертає метод UsersCollection.login(payload) з сервісу src/services/auth.js
// Викликає асинхронну функцію-сервіс loginUser --> передає req.body
export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  // ✅ Встановлюємо cookie --> для refreshToken
  // httpOnly --> вказує, що cookie доступний тільки для HTTP-запитів
  // expires --> вказує, скільки часу cookie буде діяти
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
    // secure: true, // cookies надсилаються тільки через HTTPS
    // sameSite: 'none', // дозволяє крос-доменні запити (якщо потрібен фронтенд на іншому домені)
  });

  // ✅ Встановлюємо cookie --> для sessionId
  // ❗ додаємо toString() --> для явного перетворення session._id у рядок перед передачею в res.cookie()
  // ❗ Це потрібно щоб sessionId в файлі cookie і _id в базі даних збігалися
  res.cookie('sessionId', session._id.toString(), {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
    // secure: true,
    // sameSite: 'none',
  });

  // відповідь --> повертає статус 200, повідомлення і об'єкт з accessToken
  res.status(200).json({
    status: 200,
    message: 'Successfully logged in a user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

// ✅ Контролер для вихіду користувача
export const logoutUserController = async (req, res) => {
  // Отримуємо sessionId і refreshToken з cookies (деструктуризація)
  const { sessionId, refreshToken } = req.cookies;

  // Перевіряємо sessionId і refreshToken в cookies
  if (sessionId && refreshToken) {
    // Асинхронний запит до колекції SessionsCollection для видалення попередньої сесії користувача з відповідним _id
    await logoutUser(sessionId, refreshToken);
  }
  // Видаляємо sessionId і refreshToken з cookies
  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  // відповідь --> повертає тількистатус 204 без повідомлення
  res.status(204).send();
};

// ✅ Функція для встановлення нової сесії -> використовуємо в контролері refreshUserSessionController
// Приймає: 'res' --> об'єкт відповіді і 'session' --> об'єкт, який повертає сервіс refreshUsersSession
const setupNewSession = (res, session) => {
  // ✅ Встановлюємо cookie --> для refreshToken
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });

  // ✅ Встановлюємо cookie --> для sessionId
  // ❗ додаємо toString() --> для явного перетворення session._id у "чистий" рядок перед передачею в res.cookie()
  res.cookie('sessionId', session._id.toString(), {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
};

// ✅ Контролер для обновлення сесії (refresh)
export const refreshUserSessionController = async (req, res) => {
  // Асинхронний запит до сервісу refreshUsersSession
  // Передаємо sessionId і refreshToken з cookies
  const newSession = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  // Встановлюємо нову сесію
  // Приймаємо 'res' --> об'єкт відповіді і 'newSession' --> об'єкт, який повертає сервіс refreshUsersSession
  setupNewSession(res, newSession);

  // відповідь --> повертає статус 200, повідомлення і об'єкт з accessToken
  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: newSession.accessToken,
    },
  });
};