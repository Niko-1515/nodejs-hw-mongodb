// Імпорт Router з express
// Express Router - об'єкт, який використовується для групування роутів
import { Router } from 'express';

import express from 'express';

// Імпорт контролерів
import {
  createNewContactController,
  deleteContactController,
  getAllContactsController,
  getContactByIdController,
  patchContactController,
  putContactController,
} from '../controllers/contacts.js';

// Імпорт ctrlWrapper - утиліта для огортання контролерів
// Для обробки помилок (try...catch) і захищення від падіння сервера (unhandled promise rejection)
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

// Створення екземпляру Router
const router = Router();

// Парсер для JSON-даних, "express.json" --> парсить тіло запитів у форматі JSON і додає результат як об'єкт до "req.body"
const jsonParser = express.json({
  // Вказуємо, що ми очікуємо JSON-дані або JSON:API
  type: ['application/json', 'application/vnd.api+json'],
  limit: '100kb', // обмеження на розмір тіла запиту
});

// Роути для різних видів запитів
// GET i DELETE --> не потребують jsonParser
router.get('/contacts', ctrlWrapper(getAllContactsController));
router.get('/contacts/:contactId', ctrlWrapper(getContactByIdController));
router.delete('/contacts/:contactId', ctrlWrapper(deleteContactController));

// POST, PUT i PATCH --> потребують jsonParser
router.post('/contacts', jsonParser, ctrlWrapper(createNewContactController));
router.put(
  '/contacts/:contactId',
  jsonParser,
  ctrlWrapper(putContactController),
);
router.patch(
  '/contacts/:contactId',
  jsonParser,
  ctrlWrapper(patchContactController),
);

// Експорт екземпляру Router
export default router;