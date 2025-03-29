// ✅ Middleware для перевірки валідності ID контакту

import { isValidObjectId } from 'mongoose';
import createHttpError from 'http-errors';

export const isValidId = (req, res, next) => {
  const { contactId } = req.params;
  if (!isValidObjectId(contactId)) {
    next(createHttpError(400, 'Invalid contact ID'));
    // ✅ Альтернативний варіант
    // throw createHttpError(400, 'Invalid contact ID');
  }
  next();
};