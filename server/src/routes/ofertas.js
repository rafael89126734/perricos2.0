import { Router } from 'express';
import { query } from '../db.js';
import { verificarToken } from '../middleware/auth.js';

const router = Router();

// Oferta pública únicamente durante el periodo definido.
router.get('/', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, nombre, fecha_inicio, fecha_fin, imagen
       FROM ofertas
       WHERE CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
       ORDER BY fecha_inicio ASC, id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Administración de ofertas.
router.get('/admin', verificarToken, async (_req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, nombre, fecha_inicio, fecha_fin, imagen FROM ofertas ORDER BY fecha_inicio DESC, id DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verificarToken, async (req, res) => {
  const { nombre, fecha_inicio, fecha_fin, imagen } = req.body || {};
  if (!nombre?.trim() || !fecha_inicio || !fecha_fin || !imagen) {
    return res.status(400).json({ error: 'Nombre, fechas e imagen son obligatorios' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_inicio) || !/^\d{4}-\d{2}-\d{2}$/.test(fecha_fin) || fecha_fin < fecha_inicio) {
    return res.status(400).json({ error: 'El rango de fechas no es válido' });
  }
  try {
    const { rows } = await query(
      `INSERT INTO ofertas (nombre, fecha_inicio, fecha_fin, imagen)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, fecha_inicio, fecha_fin, imagen`,
      [nombre.trim(), fecha_inicio, fecha_fin, imagen]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM ofertas WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Oferta no encontrada' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
