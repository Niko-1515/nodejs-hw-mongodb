// Імпортуємо необхідні бібліотеки
import express from 'express'; // Express - для створення сервера та обробки HTTP-запитів (GET, POST тощо)
import pino from 'pino-http'; // Pino - для логування запитів до сервера в зрозумілому форматі з налаштуваннями
import cors from 'cors'; // Cors - для дозволу запитів із різних доменів (Cross-Origin Resource Sharing)

// Імпорт функцій для роботи з контактами
// getEnvVar - утиліта для безпечного отримання змінних середовища з файлу .env або системних налаштувань
// getAllContacts - асинхронна функція для отримання всіх контактів із бази даних MongoDB
// getContactById - асинхронна функція для пошуку контакту за його ідентифікатором у базі даних MongoDB
import { getEnvVar } from './utils/getEnvVar.js';
import { getAllContacts, getContactById } from './services/contacts.js';

// Визначаємо порт, на якому працюватиме сервер
// Використовуємо функцію getEnvVar для отримання значення зі змінної середовища PORT
// Якщо змінна не вказана (undefined), за замовчуванням використовуємо порт 3000
const PORT = Number(getEnvVar('PORT', 3000));

// Експортуємо функцію setupServer, яка налаштовує та запускає сервер Express
// Функція створює сервер, налаштовує middleware, визначає маршрути (/, /contacts, /contacts/:contactId) та запускає його
export const setupServer = () => {
  const app = express(); // Ініціалізуємо сервер Express, створюючи об'єкт додатку для обробки запитів

  // Налаштовуємо "глобальні" middleware для обробки вхідних даних
  app.use(express.json()); // Парсить тіло запитів у форматі JSON (наприклад, із POST чи PUT) і додає результат як об'єкт до "req.body"
  app.use(cors()); // Дозволяє крос-доменні запити (CORS) з будь-якого джерела (без обмежень за замовчуванням)

  // Налаштовуємо логування всіх запитів за допомогою Pino
  app.use(
    pino({
      transport: {
        target: 'pino-pretty', // Використовуємо форматований вивід логів у консоль
        options: {
          colorize: true, // Додаємо кольори до логів у консолі для кращої читабельності
          translateTime: 'yyyy-mm-dd HH:MM:ss', // Формат часу в логах (рік-місяць-день година:хвилини:секунди)
        },
      },
    }),
  );

  // Обробник GET-запиту для кореневого маршруту "/"
  // Повертає базову інформацію про успішний запит
  app.get('/', (req, res) => {
    res.send({
      status: 200, // Код статусу: успішне виконання запиту
      message: 'GET request for root route successfully accepted!', // Повідомлення про обробку GET-запиту
      timestamp: new Date().toISOString(), // Поточний час у форматі ISO (наприклад, 2025-02-27T12:00:00Z)
    });
  });

  // Обробник POST-запиту для кореневого маршруту "/"
  // Підтверджує отримання POST-запиту без додаткової логіки
  app.post('/', (req, res) => {
    res.send({
      status: 200, // Код статусу: успішне виконання запиту
      message: 'POST request for root route successfully accepted!', // Повідомлення про обробку POST-запиту
      timestamp: new Date().toISOString(), // Поточний час у форматі ISO
    });
  });

  // Обробник GET-запиту для маршруту "/contacts" - повертає список усіх контактів
  // Використовує асинхронну функцію для звернення до MongoDB
  app.get('/contacts', async (req, res) => {
    const contacts = await getAllContacts(); // Отримуємо масив контактів із бази даних (асинхронно)

    res.status(200).json({
      status: 200, // Код статусу: успішне виконання запиту
      message: `Successfully found contacts in the amount of ${contacts.length} pcs!`, // Повідомлення з кількістю знайдених контактів
      data: contacts, // Дані: масив об'єктів контактів із MongoDB
    });
  });

  // Обробник GET-запиту для маршруту "/contacts/:contactId" - повертає контакт за ID
  // Використовує параметри URL та асинхронний запит до бази даних
  app.get('/contacts/:contactId', async (req, res) => {
    const { contactId } = req.params; // Отримуємо параметр contactId із URL (наприклад, /contacts/123 -> contactId = "123")
    const contact = await getContactById(contactId); // Шукаємо контакт у базі за ID (асинхронно, повертає об'єкт або null)

    // Перевіряємо, чи знайдено контакт за вказаним ID (буде null, якщо не знайдено)
    if (!contact) {
      res.status(404).json({
        message: 'Contact not found', // Помилка 404: контакт із таким ID відсутній у базі
      });
      return; // Завершуємо обробку запиту, щоб не виконувати код нижче
    }

    // Якщо контакт знайдено, повертаємо його у відповідь
    res.status(200).json({
      status: 200, // Код статусу: успішне виконання запиту
      message: `Successfully found contact with id: ${contactId}!`, // Повідомлення з ID знайденого контакту
      data: contact, // Дані: об'єкт контакту з MongoDB
    });
  });

  // Middleware для обробки неіснуючих маршрутів (404)
  // Викликається для будь-якого запиту, який не відповідає визначеним маршрутам
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Page Not found' }); // Повертаємо помилку 404 для невідомих шляхів
  });

  // Обробник помилок (middleware для перехоплення помилок)
  // Викликається, якщо в будь-якому обробнику виникає помилка (наприклад, проблема з базою даних)
  app.use((err, req, res, next) => {
    res.status(500).json({
      message: 'Something went wrong', // Загальне повідомлення про внутрішню помилку сервера
      error: err.message, // Деталі помилки для дебагінгу (наприклад, "Database connection failed")
    });
  });

  // Запускаємо сервер на вказаному порту
  // Метод listen асинхронно запускає сервер і виводить повідомлення після успішного старту
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); // Повідомлення у консоль про успішний запуск сервера
  });
};