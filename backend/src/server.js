require('dotenv').config();

const pool = require('./config/db');
const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, async () => {
  console.log(`API server dang chay tai http://localhost:${port}`);

  try {
    await pool.query('SELECT NOW()');
    console.log('Ket noi database thanh cong!');
  } catch (error) {
    console.error('Ket noi database that bai:', error.message);
  }
});