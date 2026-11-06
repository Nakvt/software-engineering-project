const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Kiểm tra sự tồn tại của Authorization Header và tiền tố "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      error: 'Không tìm thấy access token xác thực',
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Tách lấy chuỗi token
  const token = authHeader.split(' ')[1];

  try {
    // 3. Giải mã token
    const decoded = jwt.verify(token, jwtConfig.accessSecret);
    req.user = decoded;
    next();
  } catch {
    // 💡 GIẢI THÍCH LOGIC:
    // Sửa chữ "token" thành "Token" (viết hoa chữ T) 
    // để khớp 100% từng ký tự với expected string của Unit Test "Access Token không hợp lệ hoặc đã hết hạn".
    return res.status(401).json({
      success: false,
      data: null,
      error: 'Access Token không hợp lệ hoặc đã hết hạn',
      timestamp: new Date().toISOString(),
    });
  }
};