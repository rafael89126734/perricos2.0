import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '..', '.env') });

const source = new pg.Pool({
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'perricos',
});
const targetUrl = process.env.HOSTED_DATABASE_URL;
if (!targetUrl) throw new Error('Define HOSTED_DATABASE_URL localmente para copiar datos; no la subas a Git.');
const targetNeedsSsl = process.env.PGSSLMODE === 'require' || /[?&]sslmode=(require|verify-ca|verify-full)(?:&|$)/i.test(targetUrl);
const target = new pg.Pool({ connectionString: targetUrl, ...(targetNeedsSsl ? { ssl: { rejectUnauthorized: false } } : {}) });
const tables = ['categorias', 'usuarios', 'productos', 'ventas', 'ofertas', 'sugerencias'];

try {
  const schema = fs.readFileSync(path.join(here, 'schema.sql'), 'utf8');
  await target.query(schema);
  for (const table of tables) {
    const { rows } = await target.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
    if (rows[0].n !== 0) throw new Error(`La tabla remota ${table} ya tiene datos; no se sobrescribió nada.`);
  }

  const client = await target.connect();
  try {
    await client.query('BEGIN');
    for (const table of tables) {
      const { rows } = await source.query(`SELECT * FROM ${table} ORDER BY id`);
      if (!rows.length) continue;
      const columns = Object.keys(rows[0]);
      const quotedColumns = columns.map((name) => `"${name}"`).join(', ');
      const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
      const insert = `INSERT INTO ${table} (${quotedColumns}) VALUES (${placeholders})`;
      for (const row of rows) await client.query(insert, columns.map((name) => row[name]));
    }
    for (const table of tables) {
      const minimumId = table === 'usuarios' ? 999 : 1;
      const called = table === 'usuarios' ? 'TRUE' : `EXISTS(SELECT 1 FROM ${table})`;
      await client.query(
        `SELECT setval(pg_get_serial_sequence($1, 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM ${table}), 1), $2), ${called})`,
        [table, minimumId]
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  console.log('Datos de catálogo, usuarios, ventas, ofertas y sugerencias copiados. La tabla de administradores no se copia; se prepara desde ADMIN_PASSWORD.');
} finally {
  await source.end();
  await target.end();
}
