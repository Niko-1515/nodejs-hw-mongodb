// ❗❗❗ Файл із функціями для роботи з колекцією контактів ❗❗❗

// Імпортуємо модель ContactsCollection із файлу моделей
// Використовуємо її для запитів до колекції "contacts" у MongoDB
import { ContactsCollection } from '../db/models/contacts.js';

// Експортуємо асинхронну функцію для отримання всіх контактів
// Метод find() повертає масив усіх документів у колекції
export const getAllContacts = async () => {
  const contacts = await ContactsCollection.find(); // Виконуємо запит до MongoDB без фільтрів
  return contacts; // Повертаємо масив контактів
};

// Експортуємо асинхронну функцію для пошуку контакту за ID
// Метод findById шукає один документ за його _id
export const getContactById = async (contactId) => {
  const contact = await ContactsCollection.findById(contactId); // Шукаємо контакт за унікальним _id
  return contact; // Повертаємо об'єкт контакту або null, якщо не знайдено
};