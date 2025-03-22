import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import { getEnvVar } from './utils/getEnvVar.js';
import contactsRouter from './routers/contacts.js';
import rootRouter from './routers/rootRouter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

// Визначаємо порт, на якому працюватиме сервер
// Використовуємо функцію getEnvVar для отримання значення зі змінної середовища PORT
// Якщо змінна не вказана (undefined), за замовчуванням використовуємо порт 3000
// Альтернатива для parseInt() --> Number()
const PORT = parseInt(getEnvVar('PORT', 3000));

// Експортуємо функцію setupServer, яка налаштовує та запускає сервер Express
// Функція створює сервер, налаштовує middleware, визначає маршрути та запускає його
export const setupServer = () => {
  const app = express(); // Ініціалізуємо сервер Express, створюючи об'єкт додатку для обробки запитів

  // ❗ app.use(express.json()); --> перенесено в src/routers/contacts.js

  app.use(cors()); // Дозволяє крос-доменні запити (CORS) з будь-якого джерела (без обмежень за замовчуванням)

  // Налаштовуємо логування всіх запитів за допомогою Pino
  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss', // Налаштування формату часу
        },
      },
    }),
  );

  // Підключамо роутер для root route та контактів
  app.use(rootRouter);
  app.use(contactsRouter);

  // Middleware для обробки неіснуючих маршрутів
  app.use('*', notFoundHandler);

  // Middleware для обробки помилок
  app.use(errorHandler);

  // Запускаємо сервер на вказаному порті
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};