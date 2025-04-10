import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { getEnvVar } from './utils/getEnvVar.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import router from './routers/index.js';
import { UPLOAD_DIR } from './constants/index.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';

const PORT = parseInt(getEnvVar('PORT', 3000));

export const setupServer = () => {
  const app = express();

  // ❗ app.use(express.json()); --> перенесено в src/routers/contacts.js

  app.use(cors());

  app.use(cookieParser()); // парсер cookies

  // Роздача статичних файлів через Express
  // Express перевіряє запит (наприклад, GET /uploads/123_photo.jpg), знаходить файл у UPLOAD_DIR і відправляє його клієнту (браузеру).
  // express.static(UPLOAD_DIR) — вбудована функція Express, яка "віддає" файли з указаної папки (UPLOAD_DIR) як статичний контент. Це означає, що будь-який файл у цій папці стає доступним через URL
  // Ця функція каже Express: "Усі файли в папці UPLOAD_DIR — це статичний контент (зображення, CSS, JS тощо), який можна просто віддати клієнту без додаткової обробки"
  // app.use('/uploads', ...) — монтує цей middleware на шлях /uploads.
  // Якщо клієнт робить запит на будь-який URL, що починається з /uploads (наприклад, GET /uploads/123_photo.jpg), Express шукає файл 123_photo.jpg у папці UPLOAD_DIR і відправляє його клієнту (браузеру)
  // тобто файл можна отримати через http://yourdomain/uploads/123_photo.jpg
  app.use('/uploads', express.static(UPLOAD_DIR));

  app.use('/api-docs', swaggerDocs());

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

  // ❗ всі роути підключені через src/routers/index.js
  // app.use(rootRouter);
  // app.use(contactsRouter);

  app.use(router);

  app.use('*', notFoundHandler);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};