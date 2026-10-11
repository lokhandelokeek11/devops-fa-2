import { Pool, type QueryResult, type QueryResultRow } from 'pg';
import { env } from './env';
import { logger } from '../utils/logger';

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    category VARCHAR(40) NOT NULL,
    location VARCHAR(120) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    resolution_notes VARCHAR(2000) NOT NULL DEFAULT '',
    submitted_by VARCHAR(80) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  'CREATE INDEX IF NOT EXISTS idx_requests_status_priority ON requests (status, priority)',
  'CREATE INDEX IF NOT EXISTS idx_requests_category ON requests (category)',
  'CREATE INDEX IF NOT EXISTS idx_requests_submitted_by ON requests (submitted_by)',
  'CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests (created_at DESC)',
];

export interface Database {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<QueryResult<T>>;
  end(): Promise<void>;
}

let database: Database | undefined;

export function setDatabase(next: Database): void {
  database = next;
}

export function getDatabase(): Database {
  if (!database) {
    throw new Error('Database is not connected');
  }
  return database;
}

export async function ensureSchema(): Promise<void> {
  for (const statement of schemaStatements) {
    await getDatabase().query(statement);
  }
}

export async function connectDatabase(): Promise<void> {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required. Use the Postgres connection string from Supabase.');
  }

  const pool = new Pool({
    connectionString: env.databaseUrl,
    ssl: env.databaseSsl ? { rejectUnauthorized: false } : undefined,
  });

  await pool.query('SELECT 1');
  setDatabase(pool);
  await ensureSchema();
  logger.info('Connected to Supabase Postgres');
}

export async function closeDatabase(): Promise<void> {
  if (!database) {
    return;
  }
  const current = database;
  database = undefined;
  await current.end();
}
