
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new pg.Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'perricos',
});

async function migrate() {
  try {
    // Add username column
    await pool.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS username TEXT');
    
    // Set sequence to start at 1000 for 4-digit IDs
    await pool.query('ALTER SEQUENCE usuarios_id_seq RESTART WITH 1000');
    
    console.log('Database updated: username added and ID sequence restarted at 1000.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}

migrate();
