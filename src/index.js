import { setupServer } from './server.js';
import { initMongoConnection } from './db/initMongoConnection.js';

import { createDirIfNotExists } from './utils/createDirIfNotExists.js';
import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from './constants/index.js';

// ✅ Функція для запуску сервера
// Підключається база (initMongoConnection) -> створюються папки (createDirIfNotExists) -> запускається сервер (setupServer)
const bootstrap = async () => {
  await initMongoConnection();
  await createDirIfNotExists(TEMP_UPLOAD_DIR); // створюємо директорію для завантаження файлів 'temp'
  await createDirIfNotExists(UPLOAD_DIR); // створюємо директорію для завантаження файлів 'uploads'
  setupServer();
};

void bootstrap(); // void — запускає функцію, не чекаючи результату
// void просто означає, що ми не обробляємо результат bootstrap(), але самі операції всередині async виконуються послідовно завдяки await.
// Тобто сервер запускається лише після завершення всіх await