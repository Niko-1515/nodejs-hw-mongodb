// ✅ Імпорт констант сортування і моделі контактів
import { SORT_ORDER } from '../constants/index.js';
import { ContactsCollection } from '../db/models/contacts.js';

// ✅ Функція для парсингу параметру порядку сортування
// Перевіряє, чи є заданий порядок сортування валідним
// ✅ Повертає:
// -> 1, якщо порядок сортування "asc" або невалідний (за замовчуванням)
// -> -1, якщо порядок сортування "desc"
const parseSortOrder = (sortOrder) => {
  const isKnownSortOrder = Object.values(SORT_ORDER).includes(sortOrder);
  return isKnownSortOrder ? (sortOrder === SORT_ORDER.ASC ? 1 : -1) : 1;
  // ❗ альтернативний варіант --> return isKnownSortOrder ? sortOrder : SORT_ORDER.ASC; якщо використовувати "asc"/"desc", а не 1/-1
  // ✅ 1/-1 --> більш сумісний з Mongoose
};

/// ✅ Функція для парсингу параметру поля сортування
// ✅ Поля отримані зі схеми ContactsCollection.schema.paths
// Перевіряє, чи є задане поле сортування валідним
// ✅ Повертає:
// - поле сортування, якщо валідне ("name" або інше поле моделі контактів)
// - значенняза замовчуванням "name", якщо поле сортування невалідне
const parseSortBy = (sortBy) => {
  const keysOfContacts = Object.keys(ContactsCollection.schema.paths);
  return keysOfContacts.includes(sortBy) ? sortBy : 'name';
};

// ✅ Функція-парсер параметрів сортування з запиту клієнта (req.query)
// ✅ Приймає --> req.query
// ✅ Повертає --> об'єкт із sortOrder (1 або -1) і sortBy (рядок)
export const parseSortParams = (query) => {
  const { sortBy, sortOrder } = query;

  const parsedSortOrder = parseSortOrder(sortOrder);
  const parsedSortBy = parseSortBy(sortBy);

  return {
    sortOrder: parsedSortOrder,
    sortBy: parsedSortBy,
  };
};