import app from './app';
import { assertRuntimeConfig, env } from './config/env';
import { closeDatabase, connectDatabase } from './config/db';
import { logger } from './utils/logger';

async function connectWithRetry(): Promise<void> {
  const attempts = 5;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await connectDatabase();
      return;
    } catch (error) {
      await closeDatabase().catch(() => undefined);
      if (attempt === attempts) {
        throw error;
      }
      logger.warn('Database is not ready, retrying', { attempt });
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
  throw new Error('Database connection failed');
}

async function start(): Promise<void> {
  assertRuntimeConfig();
  await connectWithRetry();

  const server = app.listen(env.port, () => {
    logger.info('Server started', { port: env.port, nodeEnv: env.nodeEnv });
  });

  const shutdown = (signal: string): void => {
    logger.info('Shutting down', { signal });
    server.close(() => {
      void closeDatabase().finally(() => process.exit(0));
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Startup failed';
  logger.error(message);
  void closeDatabase().finally(() => process.exit(1));
});
