// ❗❗❗ Файл для підключення до MongoDB із використанням Mongoose ❗❗❗

// Імпортуємо бібліотеку mongoose для роботи з MongoDB
import mongoose from 'mongoose';

// Імпортуємо функцію getEnvVar із файлу utils/getEnvVar.js
// Вона отримує значення змінних середовища із файлу .env
// Логує успішне підключення до бази даних або видає помилку
import { getEnvVar } from '../utils/getEnvVar.js';

// Асинхронна функція initMongoConnection для ініціалізації з'єднання з MongoDB
export const initMongoConnection = async () => {
  try {
    // Отримуємо дані для підключення з змінних середовища
    const user = getEnvVar('MONGODB_USER'); // Ім'я користувача бази даних
    const password = getEnvVar('MONGODB_PASSWORD'); // Пароль користувача
    const url = getEnvVar('MONGODB_URL'); // URL кластера MongoDB 
    const db = getEnvVar('MONGODB_DB'); // Ім'я бази даних (наприклад, "contacts")
    const options = getEnvVar('MONGODB_OPTIONS'); // Параметри з'єднання з сервером (+appName)

    // Формуємо рядок підключення до MongoDB у форматі mongodb+srv
    // Використовуємо шаблонний рядок для з'єднання всіх частин
    // (retryWrites=true&w=majority) — це для стійкості й консистентності записів у MongoDB Atlas
    const connectionString = `mongodb+srv://${user}:${password}@${url}/${db}?${options}`;

     // Встановлюємо з'єднання з базою даних через mongoose.connect
     await mongoose.connect(connectionString);
     console.log('Mongo connection successfully established!'); // Повідомлення про успішне підключення
   } catch (error) {
     // Обробляємо помилки підключення (наприклад, неправильний пароль чи відсутність мережі)
     console.error('Error while setting up mongo connection', error);
     throw error; // Перекидаємо помилку далі, щоб зупинити додаток
   }
 };

