const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const adminPoiRoutes = require('./routes/admin-poi.routes');
const adminAnalyticsRoutes = require('./routes/admin-analytics.routes');
const authMiddleware = require('./middlewares/authMiddleware');
const requireAdmin = require('./middlewares/requireAdmin');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin/pois', authMiddleware, requireAdmin, adminPoiRoutes);
app.use('/api/v1/admin/analytics', authMiddleware, requireAdmin, adminAnalyticsRoutes);

app.use((error, _request, response, _next) => {
  void _next;
  console.error(error);
  return response.status(500).json({
    success: false,
    data: null,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;
