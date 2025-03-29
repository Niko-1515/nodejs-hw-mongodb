// ❗❗❗ Функція-парсер параметрів (page i perPage) --> перевірка на string i не NaN
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
export const parsePaginationParams = (query) => {
  const { page, perPage } = query;

  const parsedPage = Math.max(1, parseNumber(page, 1));
  const parsedPerPage = Math.max(1, parseNumber(perPage, 10));

  return {
    page: parsedPage,
    perPage: parsedPerPage,
  };
};