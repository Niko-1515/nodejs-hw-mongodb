export const ctrlWrapper = (controller) => {
    return async (req, res, next) => {
      try {
        await controller(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  };
  
  // Утиліта ctrlWrapper -> огортає контролери
  // Забезпечує обробку помилок і захищає від падіння сервера при виникненні помилок в контролерах
  // Падіння відбувалось раніше через відсутність обробки асинхронних помилок в маршрутах (unhandled promise rejection)