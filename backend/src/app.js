const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const adminPoiRoutes = require('./routes/admin-poi.routes');
const adminAnalyticsRoutes = require('./routes/admin-analytics.routes');
const sessionsRoutes = require('./routes/sessions.routes');
const mobileRoutes = require('./routes/mobileRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const requireAdmin = require('./middlewares/requireAdmin');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

// --- Public Routes ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sessions', sessionsRoutes);
app.use('/api/v1', mobileRoutes);

// --- Protected Admin Routes ---
app.use('/api/v1/admin', authMiddleware, requireAdmin);
app.use('/api/v1/admin/pois', adminPoiRoutes);
app.use('/api/v1/admin/analytics', adminAnalyticsRoutes);
app.use('/api/v1/admin/tours', require('./routes/tour.route'));

// Global Error Handler Middleware
// eslint-disable-next-line no-unused-vars
app.use((error, _request, response, _next) => {
  console.error('❌ GLOBAL SERVER ERROR:', error);
  return response.status(500).json({
    success: false,
    data: null,
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;