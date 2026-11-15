import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
const urlRequiresSsl = databaseUrl && /[?&]sslmode=(require|verify-ca|verify-full)(?:&|$)/i.test(databaseUrl);
const useSsl = process.env.PGSSLMODE === 'require' || urlRequiresSsl;
const connection = databaseUrl
  ? { connectionString: databaseUrl, ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}) }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: process.env.PGDATABASE || 'perricos',
      ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    };

const pool = new pg.Pool({
  ...connection,
  max: 10,
  idleTimeoutMillis: 30000,
});

export const query = (text, params) => pool.query(text, params);
export default pool;
