import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '..', '.env') });

const connection = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: process.env.PGDATABASE || 'perricos',
      ...(process.env.PGSSLMODE === 'require' ? { ssl: { rejectUnauthorized: false } } : {}),
    };

if (!process.env.ADMIN_PASSWORD) throw new Error('Configura ADMIN_PASSWORD antes de preparar la base hospedada.');
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) throw new Error('Configura JWT_SECRET en producción.');

const pool = new pg.Pool(connection);
try {
  const schema = fs.readFileSync(path.join(here, 'schema.sql'), 'utf8');
  await pool.query(schema);

  const email = (process.env.ADMIN_EMAIL || 'admin@perricos.com').trim().toLowerCase();
  const nombre = process.env.ADMIN_NOMBRE || 'Administrador';
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await pool.query(
    `INSERT INTO admins (email, password_hash, nombre)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO NOTHING`,
    [email, hash, nombre]
  );
  console.log('Esquema hospedado listo; se verificó la cuenta administradora.');
} finally {
  await pool.end();
}
