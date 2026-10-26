const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (!accessSecret || !refreshSecret) {
  throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be configured');
}

module.exports = {
  accessSecret,
  refreshSecret,
  accessExpiresIn: '15m', // Access token sống 15 phút
  refreshExpiresIn: '7d', // Refresh token sống 7 ngày
};