
import express from 'express';
import { query } from '../db.js';
import { verificarToken } from '../middleware/auth.js';

const router = express.Router();

// Register a user (Public)
router.post('/', async (req, res) => {
  const { nombre, apellido, username } = req.body;
  if (!nombre || !apellido || !username) return res.status(400).json({ error: 'Nombre, apellido y nombre de usuario son requeridos' });
  
  try {
    const result = await query(
      'INSERT INTO usuarios (nombre, apellido, username) VALUES ($1, $2, $3) RETURNING *',
      [nombre, apellido, username]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login with ID (Public)
router.post('/login', async (req, res) => {
  const { id_usuario } = req.body;
  if (!id_usuario) return res.status(400).json({ error: 'El ID de usuario es requerido' });
  
  try {
    const result = await query('SELECT * FROM usuarios WHERE id = $1', [id_usuario]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'ID de usuario no encontrado' });
    
    const user = result.rows[0];
    res.json({ 
      message: 'Bienvenido', 
      user: user 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ranking público: top 3 clientes por monto comprado desde el inicio de la semana (lunes).
router.get('/top', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT u.id, u.nombre, u.apellido, u.username,
              COUNT(v.id)::int AS numero_compras,
              COALESCE(SUM(v.total), 0)::numeric AS total_gastado
       FROM usuarios u
       JOIN ventas v ON v.usuario_id = u.id
       WHERE v.fecha >= date_trunc('week', CURRENT_TIMESTAMP)
       GROUP BY u.id, u.nombre, u.apellido, u.username
       ORDER BY SUM(v.total) DESC, COUNT(v.id) DESC, u.id ASC
       LIMIT 3`
    );
    res.json(rows.map((u) => ({ ...u, total_gastado: Number(u.total_gastado) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Compras históricas del usuario, agregadas por producto.
router.get('/:id/compras', verificarToken, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) return res.status(400).json({ error: 'ID de usuario inválido' });
    const usuario = await query('SELECT id FROM usuarios WHERE id = $1', [userId]);
    if (!usuario.rowCount) return res.status(404).json({ error: 'Usuario no encontrado' });
    const { rows } = await query(
      `SELECT v.producto_id, v.nombre_producto, v.tipo_venta,
              COALESCE(v.presentacion_producto, p.presentacion, '') AS presentacion_producto,
              COALESCE(v.descripcion_producto, p.descripcion, '') AS descripcion_producto,
              SUM(v.cantidad)::numeric AS cantidad_total,
              SUM(v.total)::numeric AS total_producto,
              COUNT(*)::int AS numero_compras
       FROM ventas v
       LEFT JOIN productos p ON p.id = v.producto_id
       WHERE v.usuario_id = $1
       GROUP BY v.producto_id, v.nombre_producto, v.tipo_venta,
                COALESCE(v.presentacion_producto, p.presentacion, ''),
                COALESCE(v.descripcion_producto, p.descripcion, '')
       ORDER BY v.nombre_producto ASC, presentacion_producto ASC`,
      [userId]
    );
    res.json(rows.map((item) => ({
      ...item,
      cantidad_total: Number(item.cantidad_total),
      total_producto: Number(item.total_producto),
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (Admin only)
router.get('/', verificarToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM usuarios ORDER BY fecha_registro DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user (Admin only)
router.put('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, username } = req.body;
  try {
    const result = await query(
      'UPDATE usuarios SET nombre = $1, apellido = $2, username = $3 WHERE id = $4 RETURNING *',
      [nombre, apellido, username, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user (Admin only)
router.delete('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) return res.status(400).json({ error: 'ID de usuario inválido' });

  try {
    const result = await query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
