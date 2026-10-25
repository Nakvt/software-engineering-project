const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
const pool = databaseUrl
  ? (() => {
      const connectionUrl = new URL(databaseUrl);
      for (const parameter of [
        'ssl',
        'sslmode',
        'sslcert',
        'sslkey',
        'sslrootcert',
        'sslnegotiation',
        'uselibpqcompat',
      ]) {
        connectionUrl.searchParams.delete(parameter);
      }

      return new Pool({
        connectionString: connectionUrl.toString(),
        ssl: { rejectUnauthorized: true },
      });
    })()
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'tour_guide_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    });

module.exports = pool;
