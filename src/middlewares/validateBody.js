// ✅ Middleware для валідації тіла запиту за допомогою схеми Joi
// 🍳 validateAsync — асинхронний метод Joi для перевірки req.body
// 🍳 { abortEarly: false } — збирає всі помилки валідації, а не зупиняється на першій

import createHttpError from 'http-errors';

export const validateBody = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body, { abortEarly: false });
      next();
    } catch (err) {
      const error = createHttpError(400, 'Bad Request', {
        errors: err.details.map((error) => error.message),
        // Повний об'єкт помилок доступний через 'err.details' --> ми в коді витягуємо тільки повідомлення (error.message)
      });
      next(error);
    }
  };
};

// ❗❗❗ Альтернатива: throw createHttpError(400, 'Bad Request', { errors: err.details.map((error) => error.message) });
// 🍳 next(error) — стандартний спосіб передачі контрольованої помилки в ланцюжок middleware Express
// 🍳 throw — синхронно кидає помилку в глобальний обробник, але результат схожий у цьому випадку