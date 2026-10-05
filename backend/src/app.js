const express = require('express');
const cors = require('cors');
const poiRoutes = require('./routes/poi.routes');
const trackingRoutes = require('./routes/tracking.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const adminPoiRoutes = require('./routes/admin-poi.routes');
const adminAnalyticsRoutes = require('./routes/admin-analytics.routes');

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

module.exports = app;
