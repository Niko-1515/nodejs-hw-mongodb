// ❗❗❗ файл із визначенням схеми та моделі для колекції контактів у MongoDB ❗❗❗

// Імпортуємо функцію model та клас Schema з бібліотеки mongoose
// Schema визначає структуру документів, model створює модель для роботи з колекцією
import { model, Schema } from 'mongoose';

// Створюємо СXЕМУ для колекції "".
// Схема містить наступні поля:
// ✅ "name" - обов'язкове текстове поле,
// ✅ "phoneNumber" - обов'язкове текстове поле,
// ✅ "email" - необов'язкове текстове поле, (може бути null)
// ✅ "isFavourite" - необов'язкове булеве поле, значення за замовчуванням false,
// ✅ "contactType" - обов'язкове текстове поле, варіанти значень: work, home, personal, значення за замовчуванням "personal".
const contactsSchema = new Schema(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String },
    isFavourite: { type: Boolean, default: false },
    contactType: {
      type: String,
      enum: ['work', 'home', 'personal'],
      required: true,
      default: 'personal',
    },
  },
  {
    timestamps: true, // Автоматично додає поля createdAt та updatedAt до кожного документа
    versionKey: false, // Вимикає поле __v для версійності документа
  },
);

// Експортуємо модель ContactsCollection для роботи з колекцією "contacts"
// Модель пов'язує схему з колекцією в базі даних і дозволяє виконувати запити
export const ContactsCollection = model('contacts', contactsSchema);