import { newDb } from 'pg-mem';
import { closeDatabase, ensureSchema, getDatabase, setDatabase } from '../src/config/db';

const memory = newDb();
const { Pool } = memory.adapters.createPg();

beforeAll(async () => {
  setDatabase(new Pool());
  await ensureSchema();
});

afterEach(async () => {
  await getDatabase().query('DELETE FROM requests');
});

afterAll(async () => {
  await closeDatabase();
});
