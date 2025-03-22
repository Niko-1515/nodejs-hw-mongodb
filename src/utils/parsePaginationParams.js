// ❗❗❗ Функція-парсер параметрів (page i perPage) --> перевірка на string i не NaN
// ✅ Приймає:
// number --> в нашому випадку це будуть page і perPage
// defaultValue --> значення за замовчуванням будуть 1 і 10
// ✅ Перевіряє:
// Чи є number рядком (typeof number === 'string') --> якщо ні, повертає defaultValue
// Чи є number числом (Number.isNaN(parseInt(number))) --> якщо ні, повертає defaultValue
// Якщо всі перевірки проишли успішно --> повертає parsedNumber (завжди число)
const parseNumber = (number, defaultValue) => {
    const isString = typeof number === 'string';
    if (!isString) {
      return defaultValue;
    }
    const parsedNumber = parseInt(number);
    if (Number.isNaN(parsedNumber)) {
      return defaultValue;
    }
    return parsedNumber;
  };
  
  // ❗❗❗ Функція-парсер параметрів пагінації з запиту клієнта (req.query)
  // ✅ Приймає --> req.query
  // ✅ Повертає --> об'єкт з page і perPage
  // ❗ parsedPage --> це валідний номер сторінки (мінімум 1)
  // ❗ parsedPerPage --> це валідна кількість елементів на сторінці (мінімум 1)
  // ✅ page і perPage будуть переданими числами (з req.query) або defaultValue
  export const parsePaginationParams = (query) => {
    const { page, perPage } = query;
  
    const parsedPage = Math.max(1, parseNumber(page, 1));
    const parsedPerPage = Math.max(1, parseNumber(perPage, 10));
  
    return {
      page: parsedPage,
      perPage: parsedPerPage,
    };
  };