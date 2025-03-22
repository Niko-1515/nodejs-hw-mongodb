import { ContactsCollection } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

// ✅ Сервіс-логіка для отримання всіх контактів
export const getAllContacts = async ({
  page = 1, // сторінка --> використовуючи утиліту parsePaginationParams
  perPage = 10, // кількість контактів на сторінці --> використовуючи утиліту parsePaginationParams
  sortBy = 'name', // Поле сортування --> використовуючи утиліту parseSortParams
  sortOrder = 1, // Порядок сортування --> використовуючи утиліту parseSortParams
  // Альтернативний варіант --> sortOrder = SORT_ORDER.ASC
  filter = {}, // Фільтр --> використовуючи утиліту parseFilterParams
}) => {
  const limit = perPage; // limit — обмежує кількість повернутих контактів
  const skip = (page - 1) * perPage; // skip — пропускає записи попередніх сторінок

  // Створюємо запит для отримання контактів (не відправка -> тільки створення)
  const contactsQuery = ContactsCollection.find();

  // Якщо існує фільтр (з ключем "contactType"), додаємо його до запиту
  if (filter.contactType) {
    // Фільтр за типом контакту (наприклад, "personal", "work", "home")
    contactsQuery.where('contactType').equals(filter.contactType);
  }

  // Якщо існує фільтр (з ключем "isFavourite") і !== undefined, додаємо його до запиту
  if (filter.isFavourite !== undefined) {
    // Фільтр за улюбленим контактом (наприклад, true, false)
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }

  // Promise.all() використовується для виконання паралельних запитів
  // В результаті отримаємо:
  // countConttacts --> число контактів, які відповідають фільтру
  // contacts --> масив контактів, які відповідають фільтру
  const [contactsCount, contacts] = await Promise.all([
    ContactsCollection.find().merge(contactsQuery).countDocuments(),
    contactsQuery
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder }) // Сортує за полем sortBy у порядку sortOrder (1 або -1)
      .exec(),
  ]);

  // paginationData --> об'єкт з інформацією про пагінацію (метадані)
  const paginationData = calculatePaginationData(contactsCount, perPage, page);

  // Повертаємо об'єкт з масивом контактів та інформацією про пагінацію
  return {
    data: contacts,
    ...paginationData,
  };
};

// ✅ Сервіс-логіка для отримання контакту за id
export const getContactById = async (contactId) => {
  const contact = await ContactsCollection.findById(contactId);
  return contact;
};

// ✅ Сервіс-логіка для створення контакту
export const createNewContact = async (payload) => {
  const newContact = await ContactsCollection.create(payload);
  return newContact;
};

// ✅ Сервіс-логіка для видалення контакту
export const deleteContact = async (contactId) => {
  const deletedContact = await ContactsCollection.findOneAndDelete({
    _id: contactId,
  });
  return deletedContact;
};

// ✅ Сервіс-логіка для оновлення контакту (частково)
// Використовуємо метод findOneAndUpdate() для часткового оновлення документа
// Приймає id контакту, об'єкт контакту з новими даними (з req.body) і об'єкт опцій -> повертає об'єкт оновленого контакту
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

// ✅ Сервіс-логіка для оновлення контакту (повністю)
// Використовуємо метод findOneAndUpdate() для повного оновлення документа
// Приймає id контакту, об'єкт контакту з новими даними (з req.body) і об'єкт опцій -> повертає об'єкт оновленого контакту
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