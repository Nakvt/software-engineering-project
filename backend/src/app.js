const express = require('express');
const cors = require('cors');
const poiRoutes = require('./routes/poi.routes');
const trackingRoutes = require('./routes/tracking.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const adminPoiRoutes = require('./routes/admin-poi.routes');
const adminAnalyticsRoutes = require('./routes/admin-analytics.routes');
const sessionsRoutes = require('./routes/sessions.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/api/v1/pois', poiRoutes);
app.use('/api/v1/tracking', trackingRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/admin/pois', adminPoiRoutes);
app.use('/api/v1/admin/analytics', adminAnalyticsRoutes);
app.use('/api/v1/sessions', sessionsRoutes);

app.use((_request, response) => {
  response.status(404).json({
    success: false,
    data: null,
    error: 'Not found',
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

module.exports = app;
