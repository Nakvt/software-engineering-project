const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

// Cấu hình SSL linh hoạt dành cho Neon Cloud Database
const sslOption = process.env.DB_HOST && process.env.DB_HOST.includes('neon.tech') 
  ? { rejectUnauthorized: false } 
  : (databaseUrl && databaseUrl.includes('neon.tech') ? { rejectUnauthorized: false } : false);

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: sslOption,
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'tour_guide_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: sslOption,
    });

module.exports = pool;