import createHttpError from 'http-errors';

import {
  createNewContact,
  deleteContact,
  getAllContacts,
  getContactById,
  patchUpdateContact,
  putUpdateContact,
} from '../services/contacts.js';

import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

// ✅ Контроллер-обробник для отримання всіх контактів
export const getAllContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  console.log('sortOrder from query:', sortOrder, 'typeof:', typeof sortOrder);
  console.log('req.query:', req.query);
  const filter = parseFilterParams(req.query);
  const userId = req.user._id; // Додаємо userId із req.user (посилання на id користувача), який створив контакт

  // Викликаємо функцію-сервіс для отримання контактів
  const contacts = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
    userId, // Додаємо userId із req.user (посилання на id користувача), який створив контакт
  });

  res.status(200).json({
    status: 200,
    message: `Successfully found contacts! Page ${contacts.page} of ${contacts.totalPages}, shown ${contacts.data.length} pcs of ${contacts.totalItems} contacts`,
    data: contacts,
  });
};

// ✅ Контроллер-обробник для отримання контакту за id
export const getContactByIdController = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id; // Додаємо userId із req.user (посилання на id користувача), який створив контакт

  const contact = await getContactById(contactId, userId);

  if (!contact) {
    throw createHttpError(
      404,
      'Contact not found or you do not have permission',
    );
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id: ${contactId}!`,
    data: contact,
  });
};

// ✅ Контроллер-обробник для створення нового контакту
export const createNewContactController = async (req, res) => {
  const photo = req.file; // отримуємо об'єкт файлу (зображення) -> 'multer' парсить запит 'multipart/form-data', знаходить поле photo і додає його дані в 'req.file'

  let photoUrl = null; // змінна для зберігання URL фото

  // перевіряємо чи був завантажений файл -> якщо так -> перевіряємо значення змінної 'ENABLE_CLOUDINARY' -> якщо 'true' -> викликаємо 'saveFileToCloudinary' (зберігаємо зображення в Cloudinary) -> якщо 'false' -> викликаємо 'saveFileToUploadDir' (зберігаємо зображення в локально в папці 'uploads')
  if (photo) {
    if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  const newContact = await createNewContact({
    ...req.body,
    userId: req.user._id, // Додаємо userId із req.user (посилання на id користувача), який створив контакт до req.body
    photo: photoUrl, // Додаємо поле photo до req.body (посилання на фото контакту) -> URL зображення
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully created a new contact!',
    data: newContact,
  });
};

// ✅ Контроллер-обробник для видалення контакту
export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;

  const userId = req.user._id; // Додаємо userId із req.user (посилання на id користувача), який створив контакт

  const deletedContact = await deleteContact(contactId, userId);

  if (!deletedContact) {
    throw createHttpError(
      404,
      'Contact not found or you do not have permission',
    );
  }

  res.status(204).send();
};

// ✅ Контроллер-обробник для оновлення контакту
export const patchContactController = async (req, res, next) => {
  const { contactId } = req.params;

  const photo = req.file; // отримуємо об'єкт файлу (зображення) -> 'multer' парсить запит 'multipart/form-data', знаходить поле photo і додає його дані в 'req.file' -> якщо photo не завантажено -> 'req.file' буде 'undefined'

  let photoUrl = null;

  // перевіряємо чи був завантажений файл -> якщо так -> перевіряємо значення змінної 'ENABLE_CLOUDINARY' -> якщо 'true' -> викликаємо 'saveFileToCloudinary' (зберігаємо зображення в Cloudinary) -> якщо 'false' -> викликаємо 'saveFileToUploadDir' (зберігаємо зображення в локально в папці 'uploads')
  if (photo) {
    if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  const userId = req.user._id; // Додаємо userId із req.user (посилання на id користувача), який створив контакт

  // Формуємо об'єкт оновлення контакту (з req.body) !!!БЕЗ photo за замовчуванням
  const patchedData = { ...req.body };

  // якщо фото було завантажено (photoUrl це URL) -> додаємо властивість photo і присвоюємо URL фото до об'єкта оновлення контакту (щоб не було в БД 'photo: null' -> якщо фото не було завантажено то поле photo не додається)
  if (photoUrl) {
    patchedData.photo = photoUrl;
  }

  // Оновлюємо контакт -> з patchedData
  const result = await patchUpdateContact(contactId, patchedData, userId);

  if (!result) {
    throw createHttpError(
      404,
      'Contact not found or you do not have permission',
    );
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: result,
  });
};

// ✅ Контроллер-обробник для оновлення контакту
export const putContactController = async (req, res, next) => {
  const { contactId } = req.params;

  const photo = req.file; // отримуємо об'єкт файлу (зображення) -> 'multer' парсить запит 'multipart/form-data', знаходить поле photo і додає його дані в 'req.file'

  let photoUrl = null;

  // перевіряємо чи був завантажений файл -> якщо так -> перевіряємо значення змінної 'ENABLE_CLOUDINARY' -> якщо 'true' -> викликаємо 'saveFileToCloudinary' (зберігаємо зображення в Cloudinary) -> якщо 'false' -> викликаємо 'saveFileToUploadDir' (зберігаємо зображення в локально в папці 'uploads')
  if (photo) {
    if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  const userId = req.user._id; // Додаємо userId із req.user (посилання на id користувача), який створив контакт

  // Формуємо об'єкт оновлення контакту (з req.body) !!!БЕЗ photo за замовчуванням
  const putedData = { ...req.body };

  // якщо фото було завантажено (photoUrl це URL) -> додаємо властивість photo і присвоюємо URL фото до об'єкта оновлення контакту (щоб не було в БД 'photo: null' -> якщо фото не було завантажено то поле photo не додається)
  if (photoUrl) {
    putedData.photo = photoUrl;
  }

  const result = await putUpdateContact(contactId, putedData, userId, {
    upsert: true,
  });

  if (!result) {
    throw createHttpError(
      404,
      'Contact not found or you do not have permission',
    );
  }
  const statusCode = result.isNew ? 201 : 200;

  res.status(statusCode).json({
    status: statusCode,
    message: 'Successfully upserted a contact!',
    data: result.contact,
  });
};