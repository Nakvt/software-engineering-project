const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

module.exports = app;

const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

app.use('/api/v1/auth', authRoutes);

// Đặt middleware bảo vệ trước các route admin CMS
app.use('/api/v1/admin', authMiddleware, adminRoutes);

