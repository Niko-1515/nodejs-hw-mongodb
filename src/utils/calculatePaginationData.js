// ❗❗❗ Утиліта-калькулятор пагінації для розрахунку метаданих пагінації
// ✅ Приймає:
// -> count (загальна кількість елементів)
// -> perPage (кількість елементів на сторінці)
// -> page (номер сторінки)
// ✅ Повертає --> об'єкт з метаданими пагінації
// -> page --> номер сторінки
// -> perPage --> кількість елементів на сторінці
// -> totalItems --> загальна кількість елементів
// -> totalPages --> загальна кількість сторінок
// -> hasNextPage --> чи є наступна сторінка
// -> hasPreviousPage --> чи є попередня сторінка

export const calculatePaginationData = (count, perPage, page) => {
    const totalPages = Math.ceil(count / perPage);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page !== 1;
  
    return {
      page,
      perPage,
      totalItems: count,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  };