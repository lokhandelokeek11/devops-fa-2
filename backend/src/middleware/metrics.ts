import type { NextFunction, Request, Response } from 'express';
import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

export const metricsRegistry = new Registry();

collectDefaultMetrics({ register: metricsRegistry });

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'] as const,
  registers: [metricsRegistry],
});

export const httpRequestDurationSeconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [metricsRegistry],
});

export const httpActiveRequests = new Gauge({
  name: 'http_active_requests',
  help: 'Number of HTTP requests currently being processed',
  registers: [metricsRegistry],
});

new Gauge({
  name: 'app_uptime_seconds',
  help: 'Process uptime in seconds',
  registers: [metricsRegistry],
  collect() {
    this.set(process.uptime());
  },
});

function routeLabel(req: Request): string {
  if (!req.route) {
    return 'unmatched';
  }
  const raw = `${req.baseUrl}${String(req.route.path)}`;
  if (raw.length > 1 && raw.endsWith('/')) {
    return raw.slice(0, -1);
  }
  return raw || 'unmatched';
}

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.path === '/metrics') {
    next();
    return;
  }

  const start = process.hrtime.bigint();
  httpActiveRequests.inc();
  let recorded = false;

  const record = (): void => {
    if (recorded) {
      return;
    }
    recorded = true;
    httpActiveRequests.dec();
    const seconds = Number(process.hrtime.bigint() - start) / 1e9;
    const labels = {
      method: req.method,
      route: routeLabel(req),
      status_code: String(res.statusCode),
    };
    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, seconds);
  };

  res.on('finish', record);
  res.on('close', record);
  next();
}

export async function metricsHandler(_req: Request, res: Response): Promise<void> {
  res.set('Content-Type', metricsRegistry.contentType);
  res.end(await metricsRegistry.metrics());
}
