const db = require('../config/db');

class RefreshTokenRepository {
  async saveToken(adminId, token, expiresAt) {
    const query = `
      INSERT INTO admin_refresh_tokens (admin_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await db.query(query, [adminId, token, expiresAt]);
    return rows[0];
  }

  async findToken(token) {
    const query = 'SELECT * FROM admin_refresh_tokens WHERE token = $1';
    const { rows } = await db.query(query, [token]);
    return rows[0] || null;
  }

  async deleteToken(token) {
    const query = 'DELETE FROM admin_refresh_tokens WHERE token = $1';
    await db.query(query, [token]);
  }

  async deleteAllForAdmin(adminId) {
    const query = 'DELETE FROM admin_refresh_tokens WHERE admin_id = $1';
    await db.query(query, [adminId]);
  }
}

module.exports = new RefreshTokenRepository();