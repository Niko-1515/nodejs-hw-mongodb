// Імпорт HttpError з пакету http-errors
// HttpError - це клас, який використовується для створення помилок HTTP
import { HttpError } from 'http-errors';

// Middleware для обробки помилок
// ❗❗❗ Обов'язково має приймати 4 аргументи
export const errorHandler = (err, _req, res, _next) => {
  // Перевіряємо, чи err є екземпляром класу HttpError
  // Якщо так - відправляємо відповідь з даними помилки
  if (err instanceof HttpError) {
    res.status(err.status).json({
      status: err.status, // Статус відповіді (наприклад, 404, 400, 401 ...)
      message: err.name, // Назва помилки (наприклад, 'Not Found', 'Bad Request', 'Unauthorized' ...)
      data: err.message, // Повідомлення помилки (наприклад, 'Contact not found')
    });
    return;
  }

  // Якщо err не є екземпляром класу HttpError, відправляємо відповідь з кодом 500
  res.status(500).json({
    status: 500,
    message: 'Something went wrong',
    data: err.message, // Повідомлення помилки
  });
};

// Старий варіант Middleware для обробки помилок 500
// export const errorHandler = (err, req, res, next) => {
//     res.status(500).json({
//       message: 'Something went wrong',
//       error: err.message,
//     });
//   };