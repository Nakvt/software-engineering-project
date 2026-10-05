const { Pool } = require('pg');

const requiredEnv = [
  'DB_PASSWORD',
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Thiếu biến môi trường ${key} trong file .env`);
  }
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'tour_guide_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

module.exports = pool;