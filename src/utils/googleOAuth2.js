import { OAuth2Client } from 'google-auth-library';
import path from 'node:path';
import fs from 'node:fs/promises';
import { getEnvVar } from './getEnvVar.js';
import createHttpError from 'http-errors';

// ✅ Утиліта для створення googleOAuthClient та генерації URL для авторизації через Google OAuth 2.0

// ✅ Шлях до файлу google-oauth.json (файл з налаштуваннями для Google OAuth -> client_id, client_secret, redirect_uri -> з Google Cloud Console)
const PATH_JSON = path.join(process.cwd(), 'google-oauth.json');

// ✅ Читаємо і парсимо файл google-oauth.json для отримання конфігурації
const oAuthConfig = JSON.parse(
  await fs.readFile(PATH_JSON, { encoding: 'utf-8' }),
);

// ✅ Створюємо новий екземпляр OAuth2Client (клас із бібліотеки google-auth-library)
const googleOAuthClient = new OAuth2Client({
  clientId: getEnvVar('GOOGLE_AUTH_CLIENT_ID'),
  clientSecret: getEnvVar('GOOGLE_AUTH_CLIENT_SECRET'),
  redirectUri: oAuthConfig.web.redirect_uris[0], // redirect_uri -> з google-oauth.json -> http://localhost:3000/confirm-google-auth
  // альтернативно -> redirectUri: getEnvVar('GOOGLE_AUTH_REDIRECT_URI'),
});

// ✅ Генерація URL-адреси для авторизації через метод generateAuthUrl.
// Використовує googleOAuthClient із scope:
// - userinfo.email: доступ до email користувача
// - userinfo.profile: доступ до базової інформації профілю (імя, фото тощо)
// scope — це набір дозволів (permissions), які наш додаток запитує у Google
export const generateGoogleOAuthUrl = () => {
  return googleOAuthClient.generateAuthUrl({
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
  });
};

// Повертає -> приклад URL-адреси для авторизації:
// https://accounts.google.com/o/oauth2/auth?client_id=...&redirect_uri=...&scope=...&response_type=code

// ✅ Функція для відправки коду авторизації, отримання і розшифрування id_token -> валідує авторизаційний код і повертає ticket
// googleOAuthClient.getToken(code) -> викликає POST-запит на token_uri (https://oauth2.googleapis.com/token)
// перевіряє наявність id_token у response.tokens
// розшифровує id_token -> через googleOAuthClient.verifyIdToken
// повертає об'єкт ticket (об'єкт типу LoginTicket від google-auth-library)
export const validateCode = async (code) => {
  try {
    // try-catch -> щоб не було 500 помилки при невалідному code
    const response = await googleOAuthClient.getToken(code);
    if (!response.tokens.id_token) {
      throw createHttpError(401, 'Unauthorized');
    }

    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: response.tokens.id_token,
    });

    return ticket;
  } catch {
    throw createHttpError(401, 'Invalid or expired authorization code');
  }
};

// ✅ Функція для отримання імені користувача з об'єкта payload -> отримує повне ім'я користувача з payload
// payload -> об'єкт, який містить дані про користувача, отримані після розшифрування з id_token (given_name, family_name)
// Повертає: "given_name family_name", "given_name" або "Guest"
export const getFullNameFromGoogleTokenPayload = (payload) => {
  let fullName = 'Guest';

  if (payload.given_name && payload.family_name) {
    fullName = `${payload.given_name} ${payload.family_name}`;
  } else if (payload.given_name) {
    fullName = payload.given_name;
  }

  return fullName;
};