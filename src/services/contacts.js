import { ContactsCollection } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 1, // Альтернативний варіант --> sortOrder = SORT_ORDER.ASC
  filter = {},
  userId,
}) => {
  const limit = perPage; // limit — обмежує кількість повернутих контактів
  const skip = (page - 1) * perPage; // skip — пропускає записи попередніх сторінок

  const contactsQuery = ContactsCollection.find({ userId: userId });

  if (filter.contactType) {
    // Фільтр за типом контакту (наприклад, "personal", "work", "home")
    contactsQuery.where('contactType').equals(filter.contactType);
  }

  if (filter.isFavourite !== undefined) {
    // Фільтр за улюбленим контактом (наприклад, true, false)
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }

  const [contactsCount, contacts] = await Promise.all([
    ContactsCollection.find().merge(contactsQuery).countDocuments(),
    contactsQuery
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder }) // Сортує за полем sortBy (динамічно визначається поле за яким сортується з req.query) у порядку sortOrder (1 або -1)
      .exec(),
  ]);

  const paginationData = calculatePaginationData(contactsCount, perPage, page);

  return {
    data: contacts, // масив з контактами
    ...paginationData, // метадані пагінації
  };
};

// ✅ Старий варіант getContactById -> без пошуку за userId (по id користувача який створив контакт)
// export const getContactById = async (contactId) => {
//   const contact = await ContactsCollection.findById(contactId);
//   return contact;
// };
export const getContactById = async (contactId, userId) => {
  const contact = await ContactsCollection.findOne({
    _id: contactId,
    userId: userId, // Додаємо userId із req.user (посилання на id користувача), який створив контакт
  });
  return contact;
};

export const createNewContact = async (payload) => {
  const newContact = await ContactsCollection.create(payload);
  return newContact;
};

export const deleteContact = async (contactId, userId) => {
  const deletedContact = await ContactsCollection.findOneAndDelete({
    _id: contactId,
    userId: userId, // Додаємо userId із req.user (посилання на id користувача), який створив контакт
  });
  return deletedContact;
};

export const patchUpdateContact = async (
  contactId,
  payload,
  userId,
  options = {},
) => {
  const updatedContact = await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId: userId },
    { $set: payload }, // $set для часткового оновлення документа
    { new: true, ...options },
  );
  if (!updatedContact) {
    return null;
  }
  return updatedContact;
};

export const putUpdateContact = async (
  contactId,
  payload,
  userId,
  options = {},
) => {
  const updatedContact = await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId: userId },
    payload,
    { new: true, includeResultMetadata: true, ...options },
  );
  if (!updatedContact || !updatedContact.value) {
    return null;
  }
  return {
    contact: updatedContact.value,
    isNew: Boolean(updatedContact?.lastErrorObject?.upserted),
  };
};

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
