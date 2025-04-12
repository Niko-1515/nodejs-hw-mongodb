import { ContactsCollection } from '../db/models/contacts.js';

// Отримуємо валідні значення enum для contactType
const VALID_CONTACT_TYPES =
  ContactsCollection.schema.path('contactType').enumValues || [];

// Парсимо contactType з параметра type або contactType
const parseContactType = (typeValue) => {
  if (typeof typeValue !== 'string') return undefined;
  return VALID_CONTACT_TYPES.includes(typeValue) ? typeValue : undefined;
};

// Парсимо булеве значення для isFavourite
const parseBoolean = (value) => {
  if (typeof value !== 'string') return undefined;
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  return undefined;
};

// Головна функція парсингу фільтрів
export const parseFilterParams = (req_query) => {
  const { type, contactType, isFavourite } = req_query;

  const parsedContactType = parseContactType(type || contactType);
  const parsedIsFavourite = parseBoolean(isFavourite);

  return {
    contactType: parsedContactType,
    isFavourite: parsedIsFavourite,
  };
};
