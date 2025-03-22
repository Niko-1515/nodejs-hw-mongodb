import Joi from 'joi';

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
});

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