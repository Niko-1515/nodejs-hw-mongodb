// ❗❗❗ Утиліта для роботи зі змінними середовища ❗❗❗
// ❗❗❗ Вона використовується для отримання значень змінних середовища із файлу .env ❗❗❗
// ✅ Використовуємо її в файлах:
// - src/server.js для отримання значення PORT
// - src/db/initMongoConnection.js для підключення до MongoDB

// Імпортуємо бібліотеку dotenv для завантаження змінних середовища із файлу .env
import dotenv from 'dotenv';

// Викликаємо метод config() бібліотеки dotenv, який завантажує змінні середовища з файлу .env у process.env
dotenv.config();

// Експортуємо функцію getEnvVar для безпечного отримання змінних середовища
// Параметри: name — назва змінної, defaultValue — значення за замовчуванням (опціонально)
export function getEnvVar(name, defaultValue) {
  const value = process.env[name]; // Отримуємо значення змінної з process.env

  if (value) {
    return value; // Якщо змінна існує, повертаємо її значення
  }

  if (defaultValue !== undefined) {
    // Перевіряємо, чи передано defaultValue (може бути 0 чи "")
    return defaultValue; // Якщо змінної немає, але є значення за замовчуванням, повертаємо його
  }

  // Якщо змінної немає і defaultValue не вказано, викидаємо помилку
  throw new Error(`Missing: process.env['${name}']`);
}