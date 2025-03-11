// ❗❗❗ Імпортуємо модель ContactsCollection
// Використовуємо її для запитів до колекції "contacts" у MongoDB
import { ContactsCollection } from '../db/models/contacts.js';

// Асинхронна функція для отримання всіх контактів
// Використовуємо метод find() для отримання всіх документів в колекції
// Повертає масив контактів
export const getAllContacts = async () => {
  const contacts = await ContactsCollection.find();
  return contacts;
};

// Асинхронна функція для отримання контакту за id
// Використовуємо метод findById() для отримання документа за id
// Приймає id контакту -> повертає об'єкт контакту
export const getContactById = async (contactId) => {
  const contact = await ContactsCollection.findById(contactId);
  return contact;
};

// Асинхронна функція для створення нового контакту
// Використовуємо метод create() для створення нового документа в колекції
// Приймає об'єкт контакту (з req.body) -> повертає об'єкт контакту
export const createNewContact = async (payload) => {
  const newContact = await ContactsCollection.create(payload);
  return newContact;
};

// Асинхронна функція для видалення контакту за id
// Використовуємо метод findOneAndDelete() для видалення документа за id
// Приймає id контакту -> повертає об'єкт видаленого контакту
export const deleteContact = async (contactId) => {
  const deletedContact = await ContactsCollection.findOneAndDelete({
    _id: contactId, // _id: contactId - фільтр для пошуку документа за id
  });
  return deletedContact;
};

// Асинхронна функція для оновлення контакту PATCH
// Використовуємо метод findOneAndUpdate() для часткового оновлення документа
// Приймає id контакту, об'єкт контакту (з req.body) і об'єкт опцій -> повертає об'єкт оновленого контакту
export const patchUpdateContact = async (contactId, payload, options = {}) => {
  const updatedContact = await ContactsCollection.findOneAndUpdate(
    { _id: contactId }, // _id: contactId - фільтр для пошуку документа за id
    { $set: payload }, // $set для часткового оновлення документа
    { new: true, ...options }, // new: true - повертає оновлениий документ, ...options - опції
  );
  // Якщо контакт не знайдено (null), повертаємо null
  if (!updatedContact) {
    return null;
  }
  return updatedContact;
};

// Асинхронна функція для оновлення контакту PUT
// Використовуємо метод findOneAndUpdate() для повного оновлення документа
// Приймає id контакту, об'єкт контакту (з req.body) і об'єкт опцій -> повертає об'єкт оновленого контакту
export const putUpdateContact = async (contactId, payload, options = {}) => {
  const updatedContact = await ContactsCollection.findOneAndUpdate(
    { _id: contactId }, // _id: contactId - фільтр для пошуку документа за id
    payload, // Повне оновлення документа
    { new: true, includeResultMetadata: true, ...options }, // new: true - повертає оновлениий документ, ...options - опції
    // includeResultMetadata: true - повертає метадані документа
    // Ми використовуємо метадані для визначення, чи контакт був створениий або оновлений
  );
  // Перевіряємо, чи є результат операції (updatedContact - це результат із метаданими) і оновлений/створений документ (updatedContact.value).
  if (!updatedContact || !updatedContact.value) {
    return null;
  }
  return {
    contact: updatedContact.value, // Повертаємо об'єкт контакту
    isNew: Boolean(updatedContact?.lastErrorObject?.upserted), // Повертаємо, чи контакт був створений
    // updatedContact?.lastErrorObject?.upserted - синтаксис означає "якщо updatedContact не є null, то використовуємо lastErrorObject, якщо lastErrorObject не є null, то використовуємо upserted"
  };
};

// ❗❗❗ ДУЖЕ ВАЖЛИВО!
// ✅ метод findOneAndUpdate -> ПОВЕРТАЄ:
// - Без 'includeResultMetadata: true' -> повертає сам документ (оновлений чи старий, залежно від { new: true/false }) або null, якщо документа немає.
// - Із 'includeResultMetadata: true' (як в нашому випадку) -> повертає об'єкт із метаданими, який має структуру:
// {
//    value: <документ>, // Оновлений документ або null
//    lastErrorObject: { upserted: <id>, n: <кількість> }, // Метадані операції
//    ok: 1 // Статус операції
// }
// Тобто updatedContact — це не просто документ, а об'єкт із полями .value, .lastErrorObject, тощо.

// ❗❗❗ Альтернативний варіант putUpdateContact, якщо потрібно замінити весь документ на новий
// ✅ В цьому варіанті ми використовуємо метод findOneAndReplace, який замінює весь документ на новий (непередані поля в body -> будуть видалені з документа)
// ----------------------------------------------------------
// export const putUpdateContact = async (contactId, payload, options = {}) => {
//   const existingContact = await ContactsCollection.findById(contactId);
//   const updatedContact = await ContactsCollection.findOneAndReplace(
//     { _id: contactId },
//     { _id: contactId, ...payload },
//     { new: true, ...options },
//   );
//   if (!updatedContact) {
//     return null;
//   }
//   return {
//     contact: updatedContact,
//     isNew: options.upsert && !existingContact,
//   };
// };