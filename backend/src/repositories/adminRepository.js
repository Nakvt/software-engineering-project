const db = require('../config/db');

class AdminRepository {
  async findByUsername(username) {
    const query = 'SELECT * FROM admins WHERE username = $1 AND is_active = true';
    const { rows } = await db.query(query, [username]);
    return rows[0] || null;
  }

  async findById(id) {
    const query = 'SELECT id, username, email, full_name, role, is_active FROM admins WHERE id = $1';
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }
}

module.exports = new AdminRepository();
