import { Router } from 'express';
import { query } from '../db.js';
import { verificarToken } from '../middleware/auth.js';

const router = Router();

// GET /api/sugerencias  (admin) — con texto de búsqueda opcional
router.get('/', verificarToken, async (req, res) => {
  try {
    const { s } = req.query;
    const params = [];
    let where = '';
    if (s) {
      params.push(`%${s}%`);
      where = `WHERE (producto ILIKE $1 OR motivo ILIKE $1)`;
    }
    const { rows } = await query(
      `SELECT * FROM sugerencias ${where} ORDER BY fecha DESC`,
      params
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/sugerencias  (público) — buzón comunitario
router.post('/', async (req, res) => {
  try {
    const b = req.body || {};
    const producto = (b.producto || '').trim();
    if (!producto) return res.status(400).json({ error: 'El nombre del producto es obligatorio' });
    const { rows } = await query(
      'INSERT INTO sugerencias (producto, categoria, motivo) VALUES ($1,$2,$3) RETURNING *',
      [producto, b.categoria || '', b.motivo || '']
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/sugerencias/:id  (admin)
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rowCount } = await query('DELETE FROM sugerencias WHERE id=$1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'No encontrada' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
