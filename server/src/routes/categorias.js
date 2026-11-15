import { Router } from 'express';
import { query } from '../db.js';
import { verificarToken } from '../middleware/auth.js';

const router = Router();

// GET /api/categorias  (público) — incluye conteo de productos activos
router.get('/', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT c.id, c.nombre,
              COUNT(p.id) FILTER (WHERE p.activo) AS total_productos
       FROM categorias c
       LEFT JOIN productos p ON p.categoria_id = c.id
       GROUP BY c.id, c.nombre
       ORDER BY c.nombre`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/categorias  (admin)
router.post('/', verificarToken, async (req, res) => {
  try {
    const nombre = (req.body?.nombre || '').trim();
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const { rows } = await query(
      'INSERT INTO categorias (nombre) VALUES ($1) RETURNING *',
      [nombre]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Esa categoría ya existe' });
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/categorias/:id  (admin)
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const nombre = (req.body?.nombre || '').trim();
    if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
    const { rows } = await query(
      'UPDATE categorias SET nombre=$1 WHERE id=$2 RETURNING *',
      [nombre, id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'No encontrada' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/categorias/:id  (admin) — los productos quedan sin categoría
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await query('UPDATE productos SET categoria_id = NULL WHERE categoria_id = $1', [id]);
    await query('DELETE FROM categorias WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
