import { model, Schema } from 'mongoose';

// ✅ Схема для моделі "sessions"
// ✅ Поле "userId" зберігатиме значення _id (ідентифікатор юзера) типу ObjectId iз моделі UsersCollection
const sessionSchema = new Schema(
  {
    // userId (через використання Schema.Types.ObjectId) --> посилання на користувача (залогіненого юзера) з колекції "users" --> тобто поле "userId" зберігатиме значення _id типу ObjectId iз моделі UsersCollection
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users', // посилання на конкретний документ у колекції users
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    accessTokenValidUntil: {
      type: Date,
      required: true,
    },
    refreshTokenValidUntil: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const SessionsCollection = model('sessions', sessionSchema);