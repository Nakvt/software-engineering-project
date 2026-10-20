module.exports = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'your_default_access_secret_key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_default_refresh_secret_key',
  accessExpiresIn: '15m', // Access token sống 15 phút
  refreshExpiresIn: '7d', // Refresh token sống 7 ngày
};