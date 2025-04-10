import createHttpError from 'http-errors';
import fs from 'node:fs';

import swaggerUI from 'swagger-ui-express';

import { SWAGGER_PATH } from '../constants/index.js';

// ✅ Middleware-Функція для завантаження swagger.json (документація API) та налаштування swaggerUI (бібліотека для відображення інтерфейсу документації API)
// -> swaggerDoc - об'єкт документації API (розпарсенний з swagger.json)
// -> повертаємо ...swaggerUI.serve, swaggerUI.setup(swaggerDoc):
// -> swaggerUI.serve - масив функцій, які використовуються для відображення документації API
// -> swaggerUI.setup(swaggerDoc) - функція, яка налаштовує інтерфейс документації API
// -> якщо swagger.json не знайдено - повертаємо помилку
export const swaggerDocs = () => {
  try {
    const swaggerDoc = JSON.parse(fs.readFileSync(SWAGGER_PATH).toString());
    return [...swaggerUI.serve, swaggerUI.setup(swaggerDoc)];
  } catch {
    return (req, res, next) =>
      next(createHttpError(500, "Can't load swagger docs"));
  }
};