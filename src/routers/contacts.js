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
import { upload } from '../middlewares/multer.js';

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

// ✅ Важливо! ❗ Порядок middleware: jsonParser → upload.single('photo') → validateBody → ctrlWrapper
router.post(
  '/',
  jsonParser,
  upload.single('photo'),
  validateBody(createContactSchema),
  ctrlWrapper(createNewContactController),
);

// ✅ Важливо! ❗ Порядок middleware: jsonParser → isValidId → upload.single('photo') → validateBody → ctrlWrapper
router.put(
  '/:contactId',
  jsonParser,
  isValidId,
  upload.single('photo'),
  validateBody(createContactSchema),
  ctrlWrapper(putContactController),
);

// ✅ Важливо! ❗ Порядок middleware: jsonParser → isValidId → upload.single('photo') → validateBody → ctrlWrapper
router.patch(
  '/:contactId',
  jsonParser,
  isValidId,
  upload.single('photo'),
  validateBody(updateContactSchema),
  ctrlWrapper(patchContactController),
);

export default router;

// upload.single('photo') — це middleware від multer, яке:
// Розбирає запит multipart/form-data.
// Шукає поле photo у тілі запиту.
// Зберігає файл на диск (за налаштуваннями storage).
// Додає об'єкт із даними файлу в req.file для подальшого використання в контролері.