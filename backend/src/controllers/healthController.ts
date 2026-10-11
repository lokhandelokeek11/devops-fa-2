import { getDatabase } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';

export const liveCheck = asyncHandler(async (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'smart-campus-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export const healthCheck = asyncHandler(async (_req, res) => {
  let database: 'connected' | 'disconnected' = 'disconnected';

  try {
    await getDatabase().query('SELECT 1');
    database = 'connected';
  } catch {
    database = 'disconnected';
  }

  const healthy = database === 'connected';
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    service: 'smart-campus-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database,
  });
});
