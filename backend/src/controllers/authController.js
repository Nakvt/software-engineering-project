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
      return res.status(401).json({
        success: false,
        data: null,
        error: error.message,
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
      return res.status(401).json({
        success: false,
        data: null,
        error: error.message,
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
    } catch (error) {
      return res.status(500).json({
        success: false,
        data: null,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

module.exports = new AuthController();