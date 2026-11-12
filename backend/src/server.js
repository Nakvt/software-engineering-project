require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 API server đang chạy và duy trì tại http://localhost:${PORT}`);
});

// 🟢 GIỮ EVENT LOOP KHÔNG BỊ TRỐNG ĐỂ TRÁNH CLEAN EXIT
setInterval(() => {}, 1000000);

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});