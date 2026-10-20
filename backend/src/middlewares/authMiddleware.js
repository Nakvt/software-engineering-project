const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      error: 'Không tìm thấy access token xác thực',
      timestamp: new Date().toISOString(),
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.accessSecret);
    req.user = decoded; // Gán thông tin user đã decode vào request
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      error: 'Access Token không hợp lệ hoặc đã hết hạn',
      timestamp: new Date().toISOString(),
    });
  }
};