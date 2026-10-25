const authService = require('../services/authService');

class AuthController {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          data: null,
          error: 'Vui lòng nhập tên đăng nhập và mật khẩu',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await authService.login(username, password);
      return res.status(200).json({
        success: true,
        data: result,
        error: null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const invalidCredentials = error && error.code === 'INVALID_CREDENTIALS';
      return res.status(invalidCredentials ? 401 : 500).json({
        success: false,
        data: null,
        error: invalidCredentials ? 'Mật khẩu hoặc tên đăng nhập không đúng' : 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      return res.status(200).json({
        success: true,
        data: result,
        error: null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const invalidRefreshToken = error && error.code === 'INVALID_REFRESH_TOKEN';
      return res.status(invalidRefreshToken ? 401 : 500).json({
        success: false,
        data: null,
        error: invalidRefreshToken ? 'Refresh Token không hợp lệ hoặc đã hết hạn' : 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      return res.status(200).json({
        success: true,
        data: { message: 'Đăng xuất thành công' },
        error: null,
        timestamp: new Date().toISOString(),
      });
    } catch {
      return res.status(500).json({
        success: false,
        data: null,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

module.exports = new AuthController();