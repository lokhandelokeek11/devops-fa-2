import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? 'development';
const databaseUrl = process.env.DATABASE_URL ?? '';

function usesSsl(connectionString: string): boolean {
  if (process.env.DATABASE_SSL === 'false') {
    return false;
  }
  if (process.env.DATABASE_SSL === 'true') {
    return true;
  }
  return connectionString.includes('supabase.co') || connectionString.includes('supabase.com');
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv,
  databaseUrl,
  databaseSsl: usesSsl(databaseUrl),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  isProduction: nodeEnv === 'production',
};

export function assertRuntimeConfig(): void {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required. Use the Postgres connection string from Supabase.');
  }

  if (!Number.isFinite(env.port) || env.port <= 0) {
    throw new Error('PORT must be a positive number');
  }
}
