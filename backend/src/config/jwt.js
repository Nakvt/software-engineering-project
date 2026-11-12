const accessSecret = process.env.JWT_ACCESS_SECRET || 'default_access_secret_key_2026';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key_2026';

module.exports = {
  accessSecret,
  refreshSecret,
  accessExpiresIn: '15m',
  refreshExpiresIn: '7d',
};