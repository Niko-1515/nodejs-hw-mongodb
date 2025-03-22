// Імпорт з express
import express, { Router } from 'express';

// Імпорт контроллерів
import {
  createNewContactController,
  deleteContactController,
  getAllContactsController,
  getContactByIdController,
  patchContactController,
  putContactController,
} from '../controllers/contacts.js';

// Імпорт утиліт і middleware
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';

// Імпорт валідаційних схем
import {
  createContactSchema,
  updateContactSchema,
} from '../validation/contacts.js';

// Створення екземпляру Router
const router = Router();

// Парсер для JSON-даних, "express.json" --> парсить тіло запитів у форматі JSON і додає результат як об'єкт до "req.body"
const jsonParser = express.json({
  // Вказуємо, що ми очікуємо JSON-дані або JSON:API
  type: ['application/json', 'application/vnd.api+json'],
  limit: '100kb', // обмеження на розмір тіла запиту
});

// ✅ Роути для різних типів запитів
router.get('/contacts', ctrlWrapper(getAllContactsController));

// ✅ Важливо! ❗ Порядок middleware: isValidId → ctrlWrapper
router.get(
  '/contacts/:contactId',
  isValidId,
  ctrlWrapper(getContactByIdController),
);
router.delete(
  '/contacts/:contactId',
  isValidId,
  ctrlWrapper(deleteContactController),
);

// ✅ Важливо! ❗ Порядок middleware: jsonParser → validateBody → ctrlWrapper
router.post(
  '/contacts',
  jsonParser,
  validateBody(createContactSchema),
  ctrlWrapper(createNewContactController),
);
router.put(
  '/contacts/:contactId',
  jsonParser,
  isValidId,
  validateBody(createContactSchema),
  ctrlWrapper(putContactController),
);
router.patch(
  '/contacts/:contactId',
  jsonParser,
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(patchContactController),
);

export default router;