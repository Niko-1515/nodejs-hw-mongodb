import { model, Schema } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Операція для видалення пароля з об'єкта відповіді користувачу
// Використовує метод toJSON --> він додається до схеми
// toJSON --> викликається автоматично коли об'єкт перетворюється на JSON (наприклад, при res.json() у контролері)
// this.toObject() --> Перетворює Mongoose-документ у звичайний об'єкт.
// delete obj.password --> Видаляє поле password із цього об'єкта.
// Повертає --> об'єкт без password
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const UsersCollection = model('users', userSchema);