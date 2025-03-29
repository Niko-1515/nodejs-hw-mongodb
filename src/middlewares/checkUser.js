import createHttpError from 'http-errors';
import { ContactsCollection } from '../db/models/contacts.js';

// ✅ Middleware для перевірки прав користувача
// -> витягує з об'єкта запиту req властивість user
// -> якщо user не існує -> повертає помилку
// -> витягує з параметрів запиту (req.params) властивість contactId
// -> якщо contactId існує -> шукає в БД контакт з таким _id (id контакту) та userId (id користувача)
// -> якщо контакт не знайдено -> повертає помилку
// -> якщо контакт знайдено -> переходить до наступного middleware
export const checkUser = async (req, res, next) => {
  const { user } = req;

  if (!user) {
    return next(createHttpError(401, 'Not authenticated'));
  }

  const { contactId } = req.params;

  if (contactId) {
    const contact = await ContactsCollection.findOne({
      _id: contactId,
      userId: user._id,
    });

    if (!contact) {
      return next(
        createHttpError(
          403,
          'You do not have permission to access this contact',
        ),
      );
    }
  }
  next();
};