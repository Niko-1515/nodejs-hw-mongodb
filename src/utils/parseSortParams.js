import { SORT_ORDER } from '../constants/index.js';
import { ContactsCollection } from '../db/models/contacts.js';

// ✅ Функція для парсингу параметру порядку сортування
const parseSortOrder = (sortOrder) => {
  // Якщо sortOrder — число (1 або -1), повертаємо його напряму
  if (sortOrder === 1 || sortOrder === -1) {
    return sortOrder;
  }

  // Якщо sortOrder — рядок ("asc" або "desc"), конвертуємо в число
  const isKnownSortOrder = Object.values(SORT_ORDER).includes(sortOrder);
  return isKnownSortOrder ? (sortOrder === SORT_ORDER.ASC ? 1 : -1) : 1;
  // ❗ альтернативний варіант --> return isKnownSortOrder ? sortOrder : SORT_ORDER.ASC; якщо використовувати "asc"/"desc", а не 1/-1
  // ✅ 1/-1 --> більш сумісний з Mongoose
};

// ✅ Функція для парсингу параметру поля сортування
const parseSortBy = (sortBy) => {
  const keysOfContacts = Object.keys(ContactsCollection.schema.paths);
  return keysOfContacts.includes(sortBy) ? sortBy : 'name';
};

// ✅ Функція-парсер параметрів сортування з запиту клієнта (req.query)
export const parseSortParams = (query) => {
  const { sortBy, sortOrder } = query;

  const parsedSortOrder = parseSortOrder(sortOrder);
  const parsedSortBy = parseSortBy(sortBy);

  return {
    sortOrder: parsedSortOrder,
    sortBy: parsedSortBy,
  };
};