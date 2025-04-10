// ✅ Роутери для реєстрації, логіну і виходу користувача
import express, { Router } from 'express';
import {
  loginUserSchema,
  loginWithGoogleOAuthSchema,
  registerUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from '../validation/auth.js';
import {
  getGoogleOAuthUrlController,
  loginUserController,
  loginWithGoogleController,
  logoutUserController,
  refreshUserSessionController,
  registerUserController,
  requestResetEmailController,
  resetPasswordController,
} from '../controllers/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';

const router = Router();

// ❗ Парсер JSON для req.body --> обов'язково прописувати у всіх файлах роутерів
const jsonParser = express.json({
  // Вказуємо, що ми очікуємо JSON-дані або JSON:API
  type: ['application/json', 'application/vnd.api+json'],
  limit: '100kb', // обмеження на розмір тіла запиту
});

// ✅ Роут для реєстрації користувача
// path: '/auth/register' --> jsonParser --> валідація тіла запиту (через схему registerUserSchema) --> контролер реєстрації (registerUserController)
router.post(
  '/register',
  jsonParser,
  validateBody(registerUserSchema),
  ctrlWrapper(registerUserController),
);

// ✅ Роут для входу користувача
// path: '/auth/login' --> jsonParser --> валідація тіла запиту (через схему loginUserSchema) --> контролер входу (loginUserController)
router.post(
  '/login',
  jsonParser,
  validateBody(loginUserSchema),
  ctrlWrapper(loginUserController),
);

// ✅ Роут для виходу користувача
// path: '/auth/logout' --> контролер виходу (logoutUserController)
router.post('/logout', ctrlWrapper(logoutUserController));

// ✅ Роут для оновлення сесії користувача (refresh)
// path: '/auth/refresh' --> контролер оновлення сесії (refreshUserSessionController)
router.post('/refresh', ctrlWrapper(refreshUserSessionController));

// ✅ Роут для запиту на надсилання листа на відновлення пароля
// path: '/auth/request-reset-email' --> jsonParser --> валідація тіла запиту (через схему requestResetEmailSchema) --> контролер запиту (requestResetEmailController)
router.post(
  '/send-reset-email',
  jsonParser,
  validateBody(requestResetEmailSchema),
  ctrlWrapper(requestResetEmailController),
);

// ✅ Роут для створення (відновлення) нового пароля - після запиту на надсилання листа на відновлення пароля
// path: '/reset-password' --> jsonParser --> валідація тіла запиту (через схему resetPasswordSchema) --> контролер відновлення пароля (resetPasswordController)
router.post(
  '/reset-pwd',
  jsonParser,
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPasswordController),
);

// ✅ Роут для отримання URL-адреси Google OAuth
// path: '/get-oauth-url' -> контролер (getGoogleOAuthUrlController) повертає URL (з clientId, redirectUri, scope, responseType=code)
router.get('/get-oauth-url', ctrlWrapper(getGoogleOAuthUrlController));

// ✅ POST-роут для входу через Google акаунт
// path: '/confirm-oauth' --> jsonParser --> валідація тіла запиту (через схему loginWithGoogleOAuthSchema) --> контролер входу (loginWithGoogleController)
router.post(
  '/confirm-oauth',
  jsonParser,
  validateBody(loginWithGoogleOAuthSchema),
  ctrlWrapper(loginWithGoogleController),
);

export default router;