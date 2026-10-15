require('dotenv').config();

const pool = require('./config/db');

async function testDatabase() {
  try {
    const result = await pool.query('SELECT NOW()');

    console.log('Ket noi database thanh cong!');
    console.log('Thoi gian database:', result.rows[0].now);
  } catch (error) {
    console.error('Ket noi database that bai:', error.message);
  } finally {
    await pool.end();
  }
}

testDatabase();