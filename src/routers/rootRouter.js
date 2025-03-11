// Імпорт Router з express
// Express Router - об'єкт, який використовується для групування роутів
import { Router } from 'express';

// Імпорт контролерів
import {
  getRootController,
  postRootController,
} from '../controllers/rootController.js';

// Імпорт ctrlWrapper - утиліта для огортання контролерів
// Для обробки помилок (try...catch) і захищення від падіння сервера (unhandled promise rejection)
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

// Створення екземпляру Router
const router = Router();

// Роути для запитів на root route
router.get('/', ctrlWrapper(getRootController));
router.post('/', ctrlWrapper(postRootController));

// Експорт екземпляру Router
export default router;