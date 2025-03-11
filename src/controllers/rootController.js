// ❗ Контролери для тестових запитів на root route
export const getRootController = async (_req, res) => {
    res.status(200).json({
      status: 200,
      message: 'GET request for root route successfully accepted (hw3-crud)!',
      timestamp: new Date().toISOString(), // Додаємо поточний час запиту
    });
  };
  
  export const postRootController = async (_req, res) => {
    res.status(200).json({
      status: 200,
      message: 'POST request for root route successfully accepted!',
      timestamp: new Date().toISOString(), // Додаємо поточний час запиту
    });
  };