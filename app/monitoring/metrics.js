const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

const appointmentCounter = new client.Counter({
  name: 'appointments_total',
  help: 'Total number of appointments created',
  registers: [register],
});

function metricsMiddleware(req, res, next) {
  const start = process.hrtime();
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds + nanoseconds / 1e9;

    httpRequestCounter.inc({ method: req.method, path: req.route ? req.route.path : req.path, status: res.statusCode });
    httpRequestDuration.observe({ method: req.method, path: req.route ? req.route.path : req.path }, duration);

    if (req.method === 'POST' && req.path === '/api/appointments' && res.statusCode === 201) {
      appointmentCounter.inc();
    }
  });
  next();
}

async function metricsEndpoint(req, res) {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}

module.exports = { metricsMiddleware, metricsEndpoint };
