import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getEnvVar } from './utils/getEnvVar.js';
// import contactsRouter from './routers/contacts.js';
// import rootRouter from './routers/rootRouter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import router from './routers/index.js';

const PORT = parseInt(getEnvVar('PORT', 3000));

export const setupServer = () => {
  const app = express();

  // ❗ app.use(express.json()); --> перенесено в src/routers/contacts.js

  app.use(cors());

  app.use(cookieParser()); // парсер cookies

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