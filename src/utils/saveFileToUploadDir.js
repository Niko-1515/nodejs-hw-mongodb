import fs from 'node:fs/promises';
import path from 'node:path';

import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from '../constants/index.js';
import { getEnvVar } from './getEnvVar.js';

// ✅ Функція для переміщення файлу з тимчасової папки (TEMP_UPLOAD_DIR) до постійної папки (UPLOAD_DIR)
// fs.rename -> переміщує файл з одного шляху до іншого
export const saveFileToUploadDir = async (file) => {
  await fs.rename(
    path.join(TEMP_UPLOAD_DIR, file.filename),
    path.join(UPLOAD_DIR, file.filename),
  );

  // Повертає URL зображення у форматі http://yourdomain/uploads/123_photo.jpg
  const uploadedPhotoUrl = `${getEnvVar('APP_DOMAIN')}/uploads/${
    file.filename
  }`;
  return uploadedPhotoUrl;
};