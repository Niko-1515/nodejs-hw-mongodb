import { THIRTY_DAYS } from '../constants/index.js';
import {
  loginOrSignupWithGoogle,
  loginUser,
  logoutUser,
  refreshUsersSession,
  registerUser,
  requestResetToken,
  resetPassword,
} from '../services/auth.js';
import { generateGoogleOAuthUrl } from '../utils/googleOAuth2.js';

// ✅ Контролер для реєстрації користувача
// Викликає асинхронну функцію-сервіс registerUser --> передає req.body
// Реєструє нового користувача --> повертає статус 201, повідомлення і об'єкт зареєстрованого користувача (❗ без паролю)
export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a new user!',
    data: user,
  });
};

// ✅ Контролер для входу користувача
// session --> об'єкт, який повертає метод UsersCollection.login(payload) з сервісу src/services/auth.js
// Викликає асинхронну функцію-сервіс loginUser --> передає req.body
export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  // ✅ Встановлюємо cookie --> для refreshToken
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });

  // ✅ Встановлюємо cookie --> для sessionId
  res.cookie('sessionId', session._id.toString(), {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken: session.accessToken,
    },
  });
};

// ✅ Контролер для виходу користувача
export const logoutUserController = async (req, res) => {
  // Отримуємо sessionId і refreshToken з cookies (деструктуризація)
  const { sessionId, refreshToken } = req.cookies;

  // Перевіряємо sessionId і refreshToken в cookies
  if (sessionId && refreshToken) {
    await logoutUser(sessionId, refreshToken);
  }
  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

// ✅ Функція для встановлення нової сесії -> використовуємо в контролері refreshUserSessionController
// Приймає: 'res' --> об'єкт відповіді і 'session' --> об'єкт, який повертає сервіс refreshUsersSession
const setupNewSession = (res, session) => {
  // ✅ Встановлюємо cookie --> для refreshToken
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });

  // ✅ Встановлюємо cookie --> для sessionId
  // ❗ додаємо toString() --> для явного перетворення session._id у "чистий" рядок перед передачею в res.cookie()
  res.cookie('sessionId', session._id.toString(), {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAYS),
  });
};

// ✅ Контролер для обновлення сесії (refresh)
export const refreshUserSessionController = async (req, res) => {
  // Асинхронний запит до сервісу refreshUsersSession
  // Передаємо sessionId і refreshToken з cookies
  const newSession = await refreshUsersSession({
    sessionId: req.cookies.sessionId,
    refreshToken: req.cookies.refreshToken,
  });

  // Встановлюємо нову сесію
  setupNewSession(res, newSession);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: newSession.accessToken,
    },
  });
};

// ✅ Контролер відновлення пароля (запит на відновлення пароля по пошті)
export const requestResetEmailController = async (req, res) => {
  await requestResetToken(req.body.email);

  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent!',
    data: {},
  });
};

// ✅ Контролер встановлення нового пароля (коли користувач перейшов за посиланням з листа на відновлення пароля)
export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);

  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset!',
    data: {},
  });
};

// ✅ Контролер входу користувача через Google аккаунт -> для отримання URL-адреси Google OAuth (в url - client_id, redirect_uri, scope, response_type). Викликає generateAuthUrl і повертає JSON із URL для фронтенду
export const getGoogleOAuthUrlController = async (req, res) => {
  const url = generateGoogleOAuthUrl();

  res.status(200).json({
    status: 200,
    message: 'Successfully get Google OAuth url!',
    data: {
      url: url,
    },
  });
};

// ✅ Контролер входу користувача через Google аккаунт
// Приймає: req.body.code — авторизаційний код із фронтенду (POST /confirm-oauth)
// Повертає: accessToken і встановлює cookies через setupNewSession
export const loginWithGoogleController = async (req, res) => {
  const session = await loginOrSignupWithGoogle(req.body.code);

  // Встановлюємо нову сесію -> відправляємо cookie
  setupNewSession(res, session);

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in via Google OAuth!',
    data: {
      accessToken: session.accessToken,
    },
  });
};