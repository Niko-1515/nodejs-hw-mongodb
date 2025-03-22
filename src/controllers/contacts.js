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

// ✅ Контроллер-обробник для отримання всіх контактів
// ✅ Витягує:
// 🍳 параметри пагінації (page і perPage) --> використовуючи утиліту parsePaginationParams для валідації
// 🍳 параметри сортування (sortBy і sortOrder) --> використовуючи утиліту parseSortParams для валідації
// 🍳 параметри фільтру (filter) --> використовуючи утиліту parseFilterParams для валідації
// ✅ Викликає сервіс-логіку getAllContacts
// 🚀 Повертає:
// 🍳 статус 200, повідомлення про успішне отримання контактів
// 🍳 і contacts --> об'єкт з масивом контактів та інформацією про пагінацію (метадані)
export const getAllContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const contacts = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });

  res.status(200).json({
    status: 200,
    message: `Successfully found contacts in the amount of ${contacts.data.length} pcs!`,
    data: contacts,
  });
};

// ✅ Контроллер-обробник для отримання контакту за id
export const getContactByIdController = async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id: ${contactId}!`,
    data: contact,
  });
};

// ✅ Контроллер-обробник для створення нового контакту
export const createNewContactController = async (req, res) => {
  // ✅ Старий варіант валідації --> до підключення валідатора Joi
  // if (!req.body.name || !req.body.phoneNumber || !req.body.contactType) {
  //   const missingFields = [];

  //   if (!req.body.name) {
  //     missingFields.push('name');
  //   }
  //   if (!req.body.phoneNumber) {
  //     missingFields.push('phoneNumber');
  //   }
  //   if (!req.body.contactType) {
  //     missingFields.push('contactType');
  //   }

  //   throw createHttpError(
  //     400,
  //     `Missing required fields: ${missingFields.join(', ')}`,
  //   );
  // }

  const newContact = await createNewContact(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a new contact!',
    data: newContact,
  });
};

// ✅ Контроллер-обробник для видалення контакту
export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const deletedContact = await deleteContact(contactId);

  if (!deletedContact) {
    throw createHttpError(404, 'Contact not found');
  }

  // ✅ Альтернативний варіант обробки помилки
  // if (!deletedContact) {
  //   next(createHttpError(404, 'Contact not found'));
  //   return;
  // }

  res.status(204).send();
};

// ✅ Контроллер-обробник для оновлення контакту (PATCH)
export const patchContactController = async (req, res, next) => {
  const { contactId } = req.params; // Отримуємо id контакту з параметрів запиту
  // Використовуємо сервісну функцію patchUpdateContact, передаємо id контакту і тіло запиту
  const result = await patchUpdateContact(contactId, req.body);

  // Перевірка на відсутність контакту
  // Якщо контакт не знайдено (null), викликаємо помилку
  if (!result) {
    throw createHttpError(404, 'Contact not found');
  }

  // Відправляємо відповідь з даними контакту
  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: result,
  });
};

// ✅ Контроллер-обробник для оновлення контакту (PUT)
export const putContactController = async (req, res, next) => {
  const { contactId } = req.params;

  // ✅ Старий варіант валідації --> до підключення валідатора Joi
  // const existingContact = await getContactById(contactId);

  // if (!existingContact) {
  //   if (!req.body.name || !req.body.phoneNumber || !req.body.contactType) {
  //     const missingFields = [];

  //     if (!req.body.name) missingFields.push('name');
  //     if (!req.body.phoneNumber) missingFields.push('phoneNumber');
  //     if (!req.body.contactType) missingFields.push('contactType');

  //     throw createHttpError(
  //       400,
  //       `Missing required fields for upsert: ${missingFields.join(', ')}`,
  //     );
  //   }
  // }

  const result = await putUpdateContact(contactId, req.body, { upsert: true });
  // Використовуємо сервісну функцію putUpdateContact, передаємо id контакту і тіло запиту
  // { upsert: true } для створення контакту, якщо такого немає

  if (!result) {
    // Якщо виникла помилка при створенні контакту (null), викликаємо помилку
    throw createHttpError(404, 'Contact not found');
  }

  // Перевіряємо - контакт був створений чи відредагований
  // isNew - true, якщо контакт був створений, false - якщо контакт був відредагований
  const statusCode = result.isNew ? 201 : 200;

  // Відправляємо відповідь з даними контакту
  res.status(statusCode).json({
    status: statusCode,
    message: 'Successfully upserted a contact!',
    data: result.contact,
  });
};