import { model, Schema } from 'mongoose';

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
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    }, // Додаємо поле userId (посилання на idкористувача) -> зберігатиме посилання на документ у колекції users (id користувача)
    photo: {
      type: String,
      default: null,
    }, // Додаємо поле photo (посилання на фото контакту) -> URL зображення (наприклад, http://yourdomain/uploads/123_photo.jpg)
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const ContactsCollection = model('contacts', contactsSchema);