import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';

// ✅ Middleware для перевірки аутентифікації (використовується при логінізації)
export const authenticate = async (req, res, next) => {
  // const authHeader = req.headers.authorization -> 🍳 як альтернатива???
  // Витягуємо заголовок авторизації -> використовуємо метод get()
  // authHeader -> має бути рядком типу Bearer <token>
  const authHeader = req.get('Authorization');

  // Перевірка на наявність заголовка -> якщо немає, повертаємо помилку
  if (!authHeader) {
    return next(createHttpError(401, 'Please provide Authorization header'));
  }

  // Парсимо заголовок авторизації -> витягуємо bearer та токен (деструктуризація масиву) методом split('пробіл')
  const [bearer, token] = authHeader.split(' ');

  // Перевірка на наявність bearer та токена в заголовку -> якщо хоча б одного немає -> повертаємо помилку
  if (bearer !== 'Bearer' || !token) {
    return next(
      createHttpError(401, 'Auth header should be in format Bearer <token>'),
    );
  }

  // Асинхронний запит до колекції SessionsCollection для пошуку сесії користувача -> пошук за accessToken
  const currentSession = await SessionsCollection.findOne({
    accessToken: token,
  });

  // Перевірка на наявність актуальноїсесії користувача -> якщо немає -> повертаємо помилку
  if (!currentSession) {
    return next(createHttpError(401, 'Session not found or invalid token'));
  }

  // isAccessTokenExpired -> різниця між поточною датой та терміном дії accessToken
  const isAccessTokenExpired =
    new Date() > new Date(currentSession.accessTokenValidUntil);

  // Перевірка чи закінчився термін дії accessToken -> якщо закінчився -> повертаємо помилку
  if (isAccessTokenExpired) {
    return next(createHttpError(401, 'Access token is expired'));
  }

  // Асинхронний запит до колекції UsersCollection для пошуку користувача -> пошук за _id
  // currentUser -> об'єкт користувача з полями відповідно до схеми (name, email, password)
  const currentUser = await UsersCollection.findById(currentSession.userId);

  // Перевірка на наявність користувача -> якщо немає -> повертаємо помилку
  if (!currentUser) {
    return next(createHttpError(401, 'User not found'));
  }

  // додаємо властивість user до об'єкту запиту req -> присвоюємо значення currentUser
  req.user = currentUser;
  next();
};