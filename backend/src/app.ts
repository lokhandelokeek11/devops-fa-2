import cors from 'cors';
import express, { type Request } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { metricsHandler, metricsMiddleware } from './middleware/metrics';
import { notFoundHandler } from './middleware/notFound';
import adminRoutes from './routes/adminRoutes';
import healthRoutes from './routes/healthRoutes';
import requestRoutes from './routes/requestRoutes';

const app = express();

const allowedOrigins = env.frontendUrl
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(metricsMiddleware);
app.use(
  morgan(
    (tokens, req, res) =>
      JSON.stringify({
        timestamp: new Date().toISOString(),
        method: tokens.method(req, res),
        route: (req as Request).originalUrl,
        status: Number(tokens.status(req, res) ?? 0),
        responseTimeMs: Number(tokens['response-time'](req, res) ?? 0),
      }),
    {
      skip: (req) => req.url?.startsWith('/metrics') ?? false,
    },
  ),
);

app.get('/metrics', (req, res, next) => {
  metricsHandler(req, res).catch(next);
});
app.use('/api', healthRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
