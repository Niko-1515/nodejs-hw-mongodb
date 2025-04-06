import mongoose from 'mongoose';

import { getEnvVar } from '../utils/getEnvVar.js';

// ✅ Функція для ініціалізації з'єднання з базою даних
export const initMongoConnection = async () => {
  try {
    const user = getEnvVar('MONGODB_USER');
    const password = getEnvVar('MONGODB_PASSWORD');
    const url = getEnvVar('MONGODB_URL');
    const db = getEnvVar('MONGODB_DB');

    const connectionString = `mongodb+srv://${user}:${password}@${url}/${db}?retryWrites=true&w=majority`;

    await mongoose.connect(connectionString);

    console.log('Mongo connection successfully established!');
  } catch (error) {
    console.error('Error while setting up mongo connection', error);
    throw error;
  }
};
