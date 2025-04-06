import cloudinary from 'cloudinary';
import fs from 'node:fs/promises';

import { getEnvVar } from './getEnvVar.js';
import { CLOUDINARY } from '../constants/index.js';

// ✅ Налаштування Cloudinary
// конфігурація виконується один раз при завантаженні модуля й застосовується до всіх викликів Cloudinary у проєкті
// cloudinary.v2.config -> метод SDK
// змінні оточення для конфігурації з файла .env
cloudinary.v2.config({
  secure: true, // Усі URL будуть із https://
  cloud_name: getEnvVar(CLOUDINARY.CLOUD_NAME),
  api_key: getEnvVar(CLOUDINARY.API_KEY),
  api_secret: getEnvVar(CLOUDINARY.API_SECRET),
});

// ✅ Функція для завантаження файлу на Cloudinary
// Приймає файл (від multer із полями path, filename тощо) -> передає його до Cloudinary і повертає посилання (secure_url -> URL зображення) на цей файл у Cloudinary
export const saveFileToCloudinary = async (file) => {
  // cloudinary.v2.uploader.upload -> метод SDK для завантаження файлу на Cloudinary
  // file.path -> шлях до тимчасового файлу в temp
  const response = await cloudinary.v2.uploader.upload(file.path);
  await fs.unlink(file.path); // Видаляє файл із файлової системи
  return response.secure_url; // response -> об'єкт із даними від Cloudinary (містить secure_url, public_id тощо)
};