// ❗❗❗ Файл є точкою входу в додаток, де запускаються підключення до MongoDB і сервер Express ❗❗❗
// ❗❗❗ Це єдиний файл, який запускається з командного рядка або з npm start ❗❗❗

// Імпортуємо функцію setupServer із файлу server.js
// Ця функція налаштовує та запускає Express-сервер із маршрутами та middleware
import { setupServer } from './server.js';

// Імпортуємо функцію initMongoConnection із файлу initMongoConnection.js
// Ця функція встановлює з'єднання з базою даних MongoDB через бібліотеку Mongoose
import { initMongoConnection } from './db/initMongoConnection.js';

// Створюємо асинхронну функцію bootstrap для ініціалізації додатку
// Спочатку підключаємося до MongoDB, потім запускаємо сервер
const bootstrap = async () => {
  await initMongoConnection(); // Чекаємо успішного підключення до бази перед запуском сервера
  setupServer(); // Запускаємо Express-сервер після підключення до MongoDB
};

// Викликаємо функцію bootstrap для старту додатку
// Це єдина точка запуску всієї програми
bootstrap();