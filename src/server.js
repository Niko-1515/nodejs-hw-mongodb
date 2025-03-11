// Імпорт бібліотек
import express from 'express'; // Express - для створення сервера та обробки HTTP-запитів (GET, POST тощо)
import pino from 'pino-http'; // Pino - для логування запитів до сервера в зрозумілому форматі з налаштуваннями
import cors from 'cors'; // Cors - для дозволу запитів із різних доменів (Cross-Origin Resource Sharing)

// Імпорт функцій
import { getEnvVar } from './utils/getEnvVar.js'; // Функція для отримання змінних середовища
import contactsRouter from './routers/contacts.js'; // Роутер для контактів
import rootRouter from './routers/rootRouter.js'; // Роутер для root route
import { errorHandler } from './middlewares/errorHandler.js'; // Middleware для обробки помилок
import { notFoundHandler } from './middlewares/notFoundHandler.js'; // Middleware для обробки неіснуючих маршрутів

// Визначаємо порт, на якому працюватиме сервер
// Використовуємо функцію getEnvVar для отримання значення зі змінної середовища PORT
// Якщо змінна не вказана (undefined), за замовчуванням використовуємо порт 3000
// Альтернатива для parseInt() --> Number()
const PORT = parseInt(getEnvVar('PORT', 3000));

// Експортуємо функцію setupServer, яка налаштовує та запускає сервер Express
// Функція створює сервер, налаштовує middleware, визначає маршрути та запускає його
export const setupServer = () => {
  const app = express(); // Ініціалізуємо сервер Express, створюючи об'єкт додатку для обробки запитів

  // ✅ Налаштовуємо "глобальні" middleware для обробки вхідних даних
  // express.json --> ❗ перенесено в src/routers/contacts.js

  app.use(cors()); // Дозволяє крос-доменні запити (CORS) з будь-якого джерела (без обмежень за замовчуванням)

  // Налаштовуємо логування всіх запитів за допомогою Pino
  app.use(
    pino({
      transport: {
        target: 'pino-pretty', // Використовуємо форматований вивід логів у консоль
        options: {
          colorize: true, // Додаємо кольори до логів у консолі для кращої читабельності
          translateTime: 'yyyy-mm-dd HH:MM:ss', // Налаштування формату часу
        },
      },
    }),
  );

  // Підключамо роутер для root route та контактів
  app.use(rootRouter);
  app.use(contactsRouter);

  // Старі роути - видалені  і перенесені в src/routers/contacts.js
  // app.get('/contacts', async (req, res) => {
  //   const contacts = await getAllContacts();

  //   res.status(200).json({
  //     status: 200,
  //     message: `Successfully found contacts in the amount of ${contacts.length} pcs!`,
  //     data: contacts,
  //   });
  // });

  // app.get('/contacts/:contactId', async (req, res) => {
  //   const { contactId } = req.params;
  //   const contact = await getContactById(contactId);

  //   if (!contact) {
  //     res.status(404).json({
  //       message: 'Contact not found',
  //     });
  //     return;
  //   }

  //   res.status(200).json({
  //     status: 200,
  //     message: `Successfully found contact with id: ${contactId}!`,
  //     data: contact,
  //   });
  // });

  app.use('*', notFoundHandler); // Middleware для обробки неіснуючих маршрутів

  // Старий Middleware для обробки помилок 404
  // app.use('*', (req, res, next) => {
  //   res.status(404).json({ message: 'Page Not found' });
  // });

  app.use(errorHandler); // Middleware для обробки помилок

  // Старий Middleware для обробки помилок 500
  // app.use((err, req, res, next) => {
  //   res.status(500).json({
  //     message: 'Something went wrong',
  //     error: err.message,
  //   });
  // });

  app.listen(PORT, () => {
    // Запускаємо сервер на вказаному порті
    console.log(`Server is running on port ${PORT}`);
  });
};