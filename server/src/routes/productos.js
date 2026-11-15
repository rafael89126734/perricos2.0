import { Router } from 'express';
import { query } from '../db.js';
import { verificarToken } from '../middleware/auth.js';

const router = Router();

// Helper para serializar una fila de producto con el nombre de categoría
function serializar(p) {
  return {
    id: p.id,
    nombre: p.nombre,
    categoria_id: p.categoria_id,
    categoria: p.categoria_nombre || '',
    presentacion: p.presentacion,
    descripcion: p.descripcion,
    beneficios: p.beneficios,
    precio: Number(p.precio),
    costo: Number(p.costo),
    stock: Number(p.stock),
    tipo_venta: p.tipo_venta,
    activo: p.activo,
    imagen: p.imagen,
    created_at: p.created_at,
  };
}

// GET /api/productos  (público) — filtros: ?categoria=id&s=texto&incluirInactivos=1
router.get('/', async (req, res) => {
  try {
    const { categoria, s, incluirInactivos, soloInactivos } = req.query;
    const conds = [];
    const params = [];
    if (!incluirInactivos && !soloInactivos) {
      conds.push('p.activo = TRUE');
    }
    if (soloInactivos === '1') {
      conds.push('p.activo = FALSE');
    }
    if (categoria) {
      params.push(Number(categoria));
      conds.push(`p.categoria_id = $${params.length}`);
    }
    if (s) {
      params.push(`%${s}%`);
      conds.push(`(p.nombre ILIKE $${params.length} OR p.presentacion ILIKE $${params.length} OR p.descripcion ILIKE $${params.length})`);
    }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT p.*, c.nombre AS categoria_nombre
       FROM productos p LEFT JOIN categorias c ON c.id = p.categoria_id
       ${where} ORDER BY p.nombre, p.presentacion`,
      params
    );
    res.json(rows.map(serializar));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/productos/:id  (público)
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await query(
      `SELECT p.*, c.nombre AS categoria_nombre
       FROM productos p LEFT JOIN categorias c ON c.id = p.categoria_id
       WHERE p.id = $1`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' });
    res.json(serializar(rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/productos  (admin)
router.post('/', verificarToken, async (req, res) => {
  try {
    const b = req.body || {};
    const nombre = (b.nombre || '').trim();
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const { rows } = await query(
      `INSERT INTO productos
        (nombre, categoria_id, presentacion, descripcion, beneficios,
         precio, costo, stock, tipo_venta, activo, imagen)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        nombre,
        b.categoria_id ? Number(b.categoria_id) : null,
        b.presentacion || '',
        b.descripcion || '',
        b.beneficios || '',
        Number(b.precio || 0),
        Number(b.costo || 0),
        Number(b.stock || 0),
        b.tipo_venta === 'gramos' ? 'gramos' : 'pieza',
        b.activo !== false,
        b.imagen || '',
      ]
    );
    res.status(201).json(serializar(rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/productos/:id  (admin)
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const b = req.body || {};
    const nombre = (b.nombre || '').trim();
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const { rows } = await query(
      `UPDATE productos SET
        nombre=$1, categoria_id=$2, presentacion=$3, descripcion=$4, beneficios=$5,
        precio=$6, costo=$7, stock=$8, tipo_venta=$9, activo=$10, imagen=$11
       WHERE id=$12 RETURNING *`,
      [
        nombre,
        b.categoria_id ? Number(b.categoria_id) : null,
        b.presentacion || '',
        b.descripcion || '',
        b.beneficios || '',
        Number(b.precio || 0),
        Number(b.costo || 0),
        Number(b.stock || 0),
        b.tipo_venta === 'gramos' ? 'gramos' : 'pieza',
        b.activo !== false,
        b.imagen || '',
        id,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' });
    res.json(serializar(rows[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/productos/:id  (admin)
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rowCount } = await query('DELETE FROM productos WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
