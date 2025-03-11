// Імпорт createHttpError з пакету http-errors
// createHttpError - це функція, яка використовується для створення помилок HTTP
import createHttpError from 'http-errors';

// Middleware для обробки неіснуючих маршрутів
// ❗❗❗ Створення помилки обов'язково через next(), а не через throw
export const notFoundHandler = (_req, _res, next) => {
  next(createHttpError(404, 'Route not found'));
};