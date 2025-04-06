import path from 'node:path';

// ✅ Константи для визначення порядку сортування
// "asc" - зростання, "desc" - спадання
export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

// ✅ Константи для визначення тривалості життя токену (в мс):
// Тривалість для Access Token --> 15 хвилин
export const FIFTEEN_MINUTES = 15 * 60 * 1000;

// Тривалість для Refresh Token --> 30 днів
export const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

// ✅ Константи для SMTP (SMTP - Simple Mail Transfer Protocol)
// Будуть використовуватись при відновленні пароля, дані беремо після реєстрації в Brevo (SMTP-сервер Brevo)
export const SMTP = {
  SMTP_HOST: 'SMTP_HOST',
  SMTP_PORT: 'SMTP_PORT',
  SMTP_USER: 'SMTP_USER',
  SMTP_PASSWORD: 'SMTP_PASSWORD',
  SMTP_FROM: 'SMTP_FROM',
};

// ✅ Константа для визначення шляху до шаблонів листів
export const TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates');

// ✅ Константа для визначення шляху до тимчасової папки для файлів, які щойно завантажили
export const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'temp');

// ✅ Константа для визначення шляху до постійної папки для зберігання файлів
export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// ✅ Константи для Cloudinary
export const CLOUDINARY = {
  CLOUD_NAME: 'CLOUDINARY_CLOUD_NAME', // унікальне ім'я аккаунту Cloudinary
  API_KEY: 'CLOUDINARY_API_KEY',
  API_SECRET: 'CLOUDINARY_API_SECRET',
};