/**
 * Inicialización de la base de datos.
 * Crea la base "perricos" si no existe, ejecuta schema.sql y seed.sql,
 * y crea el administrador inicial (o lo actualiza) con la contraseña del .env.
 *
 * Uso:  npm run db:init
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_NAME = process.env.PGDATABASE || 'perricos';
const connectConfig = {
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
};

async function ensureDatabase() {
  const client = new pg.Client({ ...connectConfig, database: 'postgres' });
  await client.connect();
  const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME]);
  if (rowCount === 0) {
    // Los nombres de BD no aceptan parámetros: validamos y escapamos.
    const safe = DB_NAME.replace(/[^a-zA-Z0-9_]/g, '');
    await client.query(`CREATE DATABASE "${safe}"`);
    console.log(`✔ Base de datos "${safe}" creada.`);
  } else {
    console.log(`● Base de datos "${DB_NAME}" ya existe.`);
  }
  await client.end();
}

async function runSqlFile(client, rel) {
  const sql = fs.readFileSync(path.join(__dirname, rel), 'utf-8');
  await client.query(sql);
  console.log(`✔ Ejecutado ${rel}`);
}

export async function initDb() {
  await ensureDatabase();
  const client = new pg.Client({ ...connectConfig, database: DB_NAME });
  await client.connect();
  await runSqlFile(client, 'schema.sql');
  await runSqlFile(client, 'seed.sql');

  // Crear / actualizar administrador
  const email = (process.env.ADMIN_EMAIL || 'admin@perricos.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const nombre = process.env.ADMIN_NOMBRE || 'Administrador';
  const hash = await bcrypt.hash(password, 10);
  await client.query(
    `INSERT INTO admins (email, password_hash, nombre)
     VALUES ($1, $2, $3)
     ON CONFLICT (email)
     DO UPDATE SET password_hash = EXCLUDED.password_hash, nombre = EXCLUDED.nombre`,
    [email, hash, nombre]
  );
  console.log(`✔ Administrador listo → ${email} (contraseña: ${password})`);
  await client.end();
  return { email, password };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initDb()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('✖ Error al inicializar:', e.message);
      process.exit(1);
    });
}
