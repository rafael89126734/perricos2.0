import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import categoriaRoutes from './routes/categorias.js';
import productoRoutes from './routes/productos.js';
import ventaRoutes from './routes/ventas.js';
import usuarioRoutes from './routes/usuarios.js';
import ofertaRoutes from './routes/ofertas.js';
import sugerenciaRoutes from './routes/sugerencias.js';
import analiticaRoutes from './routes/analiticas.js';
import { verificarToken } from './middleware/auth.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '8mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// ---- Subida de imágenes (admin) ----
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/image\/(jpe?g|png|webp|gif)/.test(file.mimetype)) return cb(null, true);
    cb(new Error('Solo se permiten imágenes (jpg, png, webp, gif)'));
  },
});

// Subida de imágenes: Supabase Storage en producción; carpeta local en desarrollo.
app.post('/api/upload', verificarToken, upload.single('imagen'), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });

  const ext = (path.extname(req.file.originalname) || '.jpg').toLowerCase();
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const storageUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const storageKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  const cloudConfigured = Boolean(storageUrl && storageKey && bucket);
  const cloudPartiallyConfigured = Boolean(storageUrl || storageKey || bucket) && !cloudConfigured;

  if (cloudPartiallyConfigured) {
    return res.status(500).json({ error: 'Falta configurar el almacenamiento persistente de imágenes.' });
  }

  try {
    if (cloudConfigured) {
      const target = `${storageUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeURIComponent(filename)}`;
      const response = await fetch(target, {
        method: 'POST',
        headers: {
          apikey: storageKey,
          Authorization: `Bearer ${storageKey}`,
          'Content-Type': req.file.mimetype,
          'Cache-Control': 'max-age=31536000',
          'x-upsert': 'false',
        },
        body: req.file.buffer,
      });
      if (!response.ok) {
        console.error('Supabase Storage upload failed:', response.status);
        return res.status(502).json({ error: 'No se pudo guardar la imagen en el almacenamiento.' });
      }
      return res.json({ url: `${storageUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeURIComponent(filename)}` });
    }

    fs.writeFileSync(path.join(UPLOADS_DIR, filename), req.file.buffer);
    const base = `${req.protocol}://${req.get('host')}`;
    return res.json({ url: `${base}/uploads/${filename}` });
  } catch (err) {
    return next(err);
  }
});

// ---- Rutas de la API ----
app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/sugerencias', sugerenciaRoutes);
app.use('/api/analiticas', analiticaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/ofertas', ofertaRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true, servicio: 'Perricos API' }));

// ---- Servir el frontend en producción (build) ----
const CLIENTE_DIST = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(CLIENTE_DIST)) {
  app.use(express.static(CLIENTE_DIST));
  app.get('*', (_req, res) => res.sendFile(path.join(CLIENTE_DIST, 'index.html')));
}

// ---- Manejo central de errores ----
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
});

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`🐾 PERRICOS API corriendo en http://localhost:${PORT}`);
});
