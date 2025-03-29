import Joi from 'joi';
import { isValidObjectId } from 'mongoose';

// ✅ Валідатор для створення контакту (використовується для методів POST і PUT)
export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required().messages({
    'string.base': 'Name must be a string',
    'string.min': 'Name must be at least {#limit} characters long',
    'string.max': 'Name must be at most {#limit} characters long',
    'any.required': 'Name is required',
  }),
  phoneNumber: Joi.string()
    .min(3)
    .max(20)
    .pattern(/^\+?[1-9]\d{6,14}$/) // Додано паттерн для перевірки номера телефону
    .required()
    .messages({
      'string.pattern.base':
        'Phone number must be a valid number (e.g., +380501234567)',
      'any.required': 'Phone number is required',
    }),
  email: Joi.string().max(50).email().optional().messages({
    'string.email': 'Email must be a valid email address',
  }),
  contactType: Joi.string()
    .valid('work', 'home', 'personal')
    .required()
    .messages({
      'any.only': "Contact type must be one of: 'work', 'home', 'personal'",
      'any.required': 'Contact type is required',
    }),
  isFavourite: Joi.boolean().optional(),
  // Додаємо поле userId (посилання на користувача)
  userId: Joi.string()
    .custom((value, helpers) => {
      // Перевіряємо, чи є значення _id користувача валідним ObjectId -> якщо ні, виводимо повідомлення
      if (value && !isValidObjectId(value)) {
        return helpers.message('User ID should be a valid MongoDB ObjectId');
      }
      return value; // Повертаємо валідний _id користувача
    })
    .optional(), // optional -> вказує, що поле userId є необов'язковим (його додає сервер при створенні контакту, а не користувач)
});
// 👓 .custom -> метод Joi для створення власної логіки валідації, коли стандартних правил (наприклад, .string(), .required()) недостатньо.
// Приймає функцію з двома аргументами: value -> Значення, яке валідується (у нас userId як рядок) i helpers -> oб'єкт із методами для створення помилок або повернення результату
// Повертає: value -> якщо валідне або помилку через helpers.message

// ✅ Валідатор для оновлення контакту (використовується для методу PATCH)
export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).optional().messages({
    'string.base': 'Name must be a string',
    'string.min': 'Name must be at least {#limit} characters long',
    'string.max': 'Name must be at most {#limit} characters long',
  }),
  phoneNumber: Joi.string()
    .min(3)
    .max(20)
    .pattern(/^\+?[1-9]\d{6,14}$/)
    .optional()
    .messages({
      'string.pattern.base':
        'Phone number must be a valid number (e.g., +380501234567)',
    }),
  email: Joi.string().max(50).email().optional().messages({
    'string.email': 'Email must be a valid email address',
  }),
  contactType: Joi.string()
    .valid('work', 'home', 'personal')
    .optional()
    .messages({
      'any.only': "Contact type must be one of: 'work', 'home', 'personal'",
    }),
  isFavourite: Joi.boolean().optional(),
})
  // "or --> для перевірки наявності хоча б одного поля при PATCH запиті"
  .or('name', 'phoneNumber', 'email', 'contactType', 'isFavourite')
  .messages({
    'object.missing': 'At least one field must be provided for update',
  });