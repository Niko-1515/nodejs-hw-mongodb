// ❗ Контролери для тестових запитів на root route
export const getRootController = async (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'GET request for root route successfully accepted (hw7-swagger)!',
    timestamp: new Date().toISOString(),
  });
};

export const postRootController = async (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'POST request for root route successfully accepted!',
    timestamp: new Date().toISOString(),
  });
};
