const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const adminRepository = require('../repositories/adminRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');

function invalidCredentialsError() {
  const error = new Error('Mật khẩu hoặc tên đăng nhập không đúng');
  error.code = 'INVALID_CREDENTIALS';
  return error;
}

function invalidRefreshTokenError() {
  const error = new Error('Refresh Token không hợp lệ hoặc đã hết hạn');
  error.code = 'INVALID_REFRESH_TOKEN';
  return error;
}

class AuthService {
  async login(username, password) {
    // 1. Kiểm tra username
    const admin = await adminRepository.findByUsername(username);
    if (!admin) {
      throw invalidCredentialsError();
    }

    // 2. So sánh mật khẩu băm
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    if (!isPasswordValid) {
      throw invalidCredentialsError();
    }

    // 3. Tạo Access Token & Refresh Token
    const payload = { id: admin.id, role: admin.role, username: admin.username };
    const accessToken = jwt.sign(payload, jwtConfig.accessSecret, { expiresIn: jwtConfig.accessExpiresIn });
    const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, { expiresIn: jwtConfig.refreshExpiresIn });

    // 4. Lưu Refresh Token vào Database (thời hạn 7 ngày)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await refreshTokenRepository.saveToken(admin.id, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 phút tính bằng giây
      user: {
        id: admin.id,
        username: admin.username,
        fullName: admin.full_name,
        role: admin.role,
      },
    };
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw invalidRefreshTokenError();
    }

    // 1. Kiểm tra token trong DB
    const savedToken = await refreshTokenRepository.findToken(refreshToken);
    if (!savedToken || new Date(savedToken.expires_at) < new Date()) {
      throw invalidRefreshTokenError();
    }

    // 2. Verify chuỗi JWT
    let payload;
    try {
      payload = jwt.verify(refreshToken, jwtConfig.refreshSecret);
    } catch {
      throw invalidRefreshTokenError();
    }

    // 3. Cấp Access Token mới
    const newAccessToken = jwt.sign(
      { id: payload.id, role: payload.role, username: payload.username },
      jwtConfig.accessSecret,
      { expiresIn: jwtConfig.accessExpiresIn }
    );

    return {
      accessToken: newAccessToken,
      expiresIn: 900,
    };
  }

  async logout(refreshToken) {
    if (refreshToken) {
      await refreshTokenRepository.deleteToken(refreshToken);
    }
  }
}

module.exports = new AuthService();