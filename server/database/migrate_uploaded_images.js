import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '..', '.env') });
const storageUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
const storageKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET;
if (!storageUrl || !storageKey || !bucket) throw new Error('Configura SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY y SUPABASE_STORAGE_BUCKET localmente.');

const pool = new pg.Pool({
  host: process.env.PGHOST || 'localhost', port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'postgres', password: process.env.PGPASSWORD || '',
  database: process.env.PGDATABASE || 'perricos',
});
const uploadsDir = path.resolve(here, '..', 'uploads');
const contentTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };

async function migrateImage(imageUrl) {
  let pathname;
  try { pathname = new URL(imageUrl).pathname; } catch { pathname = imageUrl; }
  const match = pathname.match(/\/uploads\/([^/?#]+)/);
  if (!match) return null;
  const filename = path.basename(decodeURIComponent(match[1]));
  const localPath = path.join(uploadsDir, filename);
  if (!fs.existsSync(localPath)) throw new Error(`No se encontró el archivo local de imagen: ${filename}`);
  const ext = path.extname(filename).toLowerCase();
  const objectPath = `legacy/${encodeURIComponent(filename)}`;
  const response = await fetch(`${storageUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${objectPath}`, {
    method: 'POST',
    headers: {
      apikey: storageKey,
      Authorization: `Bearer ${storageKey}`,
      'Content-Type': contentTypes[ext] || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: fs.readFileSync(localPath),
  });
  if (!response.ok) throw new Error(`Supabase Storage no aceptó ${filename} (HTTP ${response.status}).`);
  return `${storageUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${objectPath}`;
}

try {
  let updated = 0;
  for (const table of ['productos', 'ofertas']) {
    const { rows } = await pool.query(`SELECT id, imagen FROM ${table} WHERE imagen LIKE '%/uploads/%'`);
    for (const row of rows) {
      const cloudUrl = await migrateImage(row.imagen);
      if (cloudUrl) {
        await pool.query(`UPDATE ${table} SET imagen = $1 WHERE id = $2`, [cloudUrl, row.id]);
        updated += 1;
      }
    }
  }
  console.log(`Migradas ${updated} imágenes locales; las demás URLs permanecen intactas.`);
} finally {
  await pool.end();
}
