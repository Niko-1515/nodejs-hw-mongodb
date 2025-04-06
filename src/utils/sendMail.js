// ✅ Утиліта для надсилання листів
// ✅ Використовуємо в src/services/auth.js

import nodemailer from 'nodemailer';

import { SMTP } from '../constants/index.js';
import { getEnvVar } from './getEnvVar.js';

// ✅ Налаштування SMTP
// створюємо об'єкт transporter із налаштуваннями SMTP (хост, порт, авторизація -> все беремо з .env через getEnvVar)
// ❗ transporter створюється один раз при завантаженні модуля й перевикористовується для всіх листів
const transporter = nodemailer.createTransport({
  host: getEnvVar(SMTP.SMTP_HOST),
  port: Number(getEnvVar(SMTP.SMTP_PORT)),
  auth: {
    user: getEnvVar(SMTP.SMTP_USER),
    pass: getEnvVar(SMTP.SMTP_PASSWORD),
  },
});

// ✅ Функція-сервіс для надсилання листів
// Приймає об'єкт options (з полями from, to, subject, html) -> використовується в сервісі requestResetToken
// transporter.sendMail відправляє лист через SMTP-сервер Brevo й повертає результат (sendMail - метод з nodemailer)
// sendMail -> повертає об'єкт із messageId (індентифікатором листа)
export const sendEmail = async (options) => {
  const result = await transporter.sendMail(options);
  return result;
};