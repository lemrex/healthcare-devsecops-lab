const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const { logger } = require('./logger');
const { metricsMiddleware, metricsEndpoint } = require('./monitoring/metrics');
const patientsRouter = require('./routes/patients');
const appointmentsRouter = require('./routes/appointments');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging and metrics
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: duration,
    });
  });
  next();
});
app.use(metricsMiddleware);

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/patients', patientsRouter);
app.use('/api/appointments', appointmentsRouter);

// Health check — used by Kubernetes liveness and readiness probes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'meditrack-api',
    version: process.env.APP_VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Prometheus metrics endpoint
app.get('/metrics', metricsEndpoint);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler — does not leak internals to the client
app.use((err, req, res, _next) => {
  logger.error('unhandled_error', { message: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info('server_start', { port: PORT, env: process.env.NODE_ENV || 'development' });
  });
}

module.exports = app;
