import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const pool = new pg.Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'perricos',
});

const migration = `
  CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    username TEXT,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS username TEXT;
  SELECT setval(
    'usuarios_id_seq',
    GREATEST((SELECT last_value FROM usuarios_id_seq), COALESCE((SELECT MAX(id) FROM usuarios), 999), 999),
    true
  );
  ALTER TABLE ventas ADD COLUMN IF NOT EXISTS usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL;
  ALTER TABLE ventas ADD COLUMN IF NOT EXISTS presentacion_producto TEXT;
  ALTER TABLE ventas ADD COLUMN IF NOT EXISTS descripcion_producto TEXT;
  CREATE INDEX IF NOT EXISTS idx_ventas_usuario_fecha ON ventas (usuario_id, fecha);
  CREATE TABLE IF NOT EXISTS ofertas (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    imagen TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ofertas_rango_fechas CHECK (fecha_fin >= fecha_inicio)
  );
`;

try {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(migration);
    await client.query('COMMIT');
    console.log('Migración lista: relación usuario-ventas y tabla de ofertas.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
} catch (error) {
  console.error('Error en migración:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
