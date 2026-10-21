function errorHandler(error, _request, response, _next) {
  if (response.headersSent) {
    return;
  }

  const status =
    Number.isInteger(error.status) && error.status >= 400 && error.status < 600
      ? error.status
      : 500;

  // Không trả chi tiết lỗi nội bộ cho client để tránh lộ thông tin cấu hình hoặc database.
  const message = status >= 500 ? 'Internal server error' : error.message;

  console.error('Lỗi xử lý request:', error);

  response.status(status).json({
    success: false,
    data: null,
    error: message,
    timestamp: new Date().toISOString(),
  });
}

module.exports = errorHandler;
