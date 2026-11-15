import { Router } from 'express';
import pool, { query } from '../db.js';
import { verificarToken } from '../middleware/auth.js';

const router = Router();

// GET /api/ventas  (admin) — con filtros opcionales ?desde=YYYY-MM-DD&hasta=...&producto_id=
router.get('/', verificarToken, async (req, res) => {
  try {
    const { desde, hasta, producto_id } = req.query;
    const conds = [];
    const params = [];
    if (desde) { params.push(desde); conds.push(`v.fecha::date >= $${params.length}`); }
    if (hasta) { params.push(hasta); conds.push(`v.fecha::date <= $${params.length}`); }
    if (producto_id) { params.push(Number(producto_id)); conds.push(`v.producto_id = $${params.length}`); }
    const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const { rows } = await query(
      `SELECT v.*, u.username AS usuario_username, u.nombre AS usuario_nombre, u.apellido AS usuario_apellido
       FROM ventas v LEFT JOIN usuarios u ON u.id = v.usuario_id ${where}
       ORDER BY v.fecha DESC`,
      params
    );
    res.json(rows.map(v => ({
      id: v.id,
      producto_id: v.producto_id,
      nombre_producto: v.nombre_producto,
      cantidad: Number(v.cantidad),
      total: Number(v.total),
      tipo_venta: v.tipo_venta,
      usuario_id: v.usuario_id,
      usuario_username: v.usuario_username,
      usuario_nombre: v.usuario_nombre,
      usuario_apellido: v.usuario_apellido,
      fecha: v.fecha,
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/ventas  (admin) — registra venta y descuenta stock en una sola transacción
router.post('/', verificarToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const b = req.body || {};
    const producto_id = Number(b.producto_id);
    let cantidad = Number(b.cantidad);
    const idUsuarioRaw = b.id_usuario;
    const idUsuario = idUsuarioRaw === undefined || idUsuarioRaw === null || String(idUsuarioRaw).trim() === ''
      ? null
      : Number(idUsuarioRaw);
    if (!producto_id || !cantidad || cantidad <= 0) {
      return res.status(400).json({ error: 'Producto y cantidad válida son obligatorios' });
    }
    if (idUsuario !== null && (!Number.isInteger(idUsuario) || idUsuario <= 0)) {
      return res.status(400).json({ error: 'El ID de usuario debe ser un número válido' });
    }

    await client.query('BEGIN');
    if (idUsuario !== null) {
      const usuario = await client.query('SELECT id FROM usuarios WHERE id = $1 FOR SHARE', [idUsuario]);
      if (!usuario.rowCount) throw Object.assign(new Error('No existe un usuario con ese ID'), { status: 404 });
    }

    const prod = (await client.query('SELECT * FROM productos WHERE id=$1 FOR UPDATE', [producto_id])).rows[0];
    if (!prod) throw Object.assign(new Error('Producto no encontrado'), { status: 404 });

    // Para venta por pieza la cantidad se resta directo; para gramos también en gramos.
    if (Number(prod.stock) < cantidad) {
      throw Object.assign(new Error(`Stock insuficiente: solo hay ${Number(prod.stock)} ${prod.tipo_venta === 'gramos' ? 'g' : 'pz'}`), { status: 400 });
    }

    const total = Number((Number(prod.precio) * (prod.tipo_venta === 'gramos' ? cantidad / 1000 : cantidad)).toFixed(2));
    const nuevoStock = Number((Number(prod.stock) - cantidad).toFixed(2));

    await client.query('UPDATE productos SET stock=$1 WHERE id=$2', [nuevoStock, producto_id]);
    const ins = await client.query(
      `INSERT INTO ventas (producto_id, nombre_producto, cantidad, total, tipo_venta, usuario_id, presentacion_producto, descripcion_producto)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [producto_id, prod.nombre, cantidad, total, prod.tipo_venta, idUsuario, prod.presentacion || '', prod.descripcion || '']
    );

    await client.query('COMMIT');
    res.status(201).json({
      ...ins.rows[0],
      cantidad: Number(ins.rows[0].cantidad),
      total: Number(ins.rows[0].total),
      nuevo_stock: nuevoStock,
    });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(e.status || 500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// DELETE /api/ventas  (admin) — borra el historial completo con doble confirmación
router.delete('/', verificarToken, async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM ventas');
    res.json({ ok: true, borradas: rowCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/ventas/:id  (admin) — elimina una venta
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rowCount } = await query('DELETE FROM ventas WHERE id=$1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'No encontrada' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
