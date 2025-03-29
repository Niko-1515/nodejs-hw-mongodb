// ✅ Головний хаб маршрутів --> підключає всі маршрути
// ✅ Використовуємо в src/server.js
import { Router } from 'express';

import contactsRouter from './contacts.js';
import authRouter from './auth.js';
import rootRouter from './rootRouter.js';

const router = Router();

router.use('/contacts', contactsRouter);
router.use('/auth', authRouter);
router.use('/', rootRouter);

export default router;