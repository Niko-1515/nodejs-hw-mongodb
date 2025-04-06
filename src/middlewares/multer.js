// ✅ Імпорти: Multer і константа TEMP_UPLOAD_DIR (шлях до тимчасової папки для завантаження файлів)
import multer from 'multer';
import { TEMP_UPLOAD_DIR } from '../constants/index.js';

// ✅ Налаштування Multer
// multer.diskStorage -> створює об'єкт із налаштуваннями зберігання
// destination -> шлях до тимчасової папки для завантаження файлів -> завжди повертає TEMP_UPLOAD_DIR (файли йдуть у temp)
// filename -> назва завантаженого файлу -> бере поточний час (Date.now() у мc) і додає оригінальне ім'я файлу (file.originalname, наприклад, photo.jpg), виходить щось типу 1710709919677_photo.jpg
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, `${uniqueSuffix}_${file.originalname}`);
  },
});

// ✅ Ініціалізуємо multer із цими налаштуваннями
export const upload = multer({ storage });