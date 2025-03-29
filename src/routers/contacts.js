import express, { Router } from 'express';
import {
  createNewContactController,
  deleteContactController,
  getAllContactsController,
  getContactByIdController,
  patchContactController,
  putContactController,
} from '../controllers/contacts.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';

import {
  createContactSchema,
  updateContactSchema,
} from '../validation/contacts.js';
import { checkUser } from '../middlewares/checkUser.js';

const router = Router();

// ❗ Парсер JSON для req.body --> обов'язково прописувати у всіх файлах роутерів
const jsonParser = express.json({
  // Вказуємо, що ми очікуємо JSON-дані або JSON:API
  type: ['application/json', 'application/vnd.api+json'],
  limit: '100kb', // обмеження на розмір тіла запиту
});

// ✅ Підключаємо middleware 'authenticate'  -> використовується при логінізації (аутентифікації) до маршрутів '/contacts' -> додає властивість req.user в об'єкт запиту req
router.use(authenticate);

// ✅ Підключаємо middleware 'checkUser' -> наступний крок після middleware 'authenticate' -> використовується при перевірці прав користувача (авторизації) -> перевіряє наявність властивості req.user в об'єкті запиту req + перевіряє приналежність контакта (_id: req.params.contactId) користувачу (userId: req.user._id)
router.use(checkUser);

// прибираємо path "/contacts" --> оскільки створили хаб маршрутів src/routers/index.js (було '/contacts' --> стало '/')
router.get('/', ctrlWrapper(getAllContactsController));

// ✅ Важливо! ❗ Порядок middleware: isValidId → ctrlWrapper
router.get('/:contactId', isValidId, ctrlWrapper(getContactByIdController));
router.delete('/:contactId', isValidId, ctrlWrapper(deleteContactController));

// ✅ Важливо! ❗ Порядок middleware: jsonParser → validateBody → ctrlWrapper
router.post(
  '/',
  jsonParser,
  validateBody(createContactSchema),
  ctrlWrapper(createNewContactController),
);
router.put(
  '/:contactId',
  jsonParser,
  isValidId,
  validateBody(createContactSchema),
  ctrlWrapper(putContactController),
);
router.patch(
  '/:contactId',
  jsonParser,
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(patchContactController),
);

export default router;