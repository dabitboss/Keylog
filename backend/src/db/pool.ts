import { Pool } from 'pg';
import { env } from '../config/env';

export const pool = new Pool({
  connectionString: env.dbUrl,
});

export async function checkConnection(): Promise<void> {
  await pool.query('SELECT 1');
}
