import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { generarToken, verificarToken } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }
    const { rows } = await query('SELECT * FROM admins WHERE lower(email) = lower($1)', [email]);
    const admin = rows[0];
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const token = generarToken(admin);
    res.json({
      token,
      admin: { id: admin.id, email: admin.email, nombre: admin.nombre, foto: admin.foto },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/auth/me  (admin autenticado)
router.get('/me', verificarToken, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, email, nombre, foto FROM admins WHERE id = $1',
      [req.admin.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/auth/me  (actualizar email / nombre / foto / contraseña)
router.put('/me', verificarToken, async (req, res) => {
  try {
    const { email, nombre, foto, password } = req.body || {};
    const adminId = req.admin.id;
    const cur = (await query('SELECT * FROM admins WHERE id = $1', [adminId])).rows[0];
    const nuevoEmail = email?.trim() || cur.email;
    const nuevoNombre = nombre?.trim() || cur.nombre;
    const nuevaFoto = foto !== undefined ? foto : cur.foto;

    let hash = cur.password_hash;
    if (password && password.trim()) {
      hash = await bcrypt.hash(password, 10);
    }
    await query(
      'UPDATE admins SET email=$1, nombre=$2, foto=$3, password_hash=$4 WHERE id=$5',
      [nuevoEmail, nuevoNombre, nuevaFoto, hash, adminId]
    );
    res.json({ ok: true, email: nuevoEmail, nombre: nuevoNombre, foto: nuevaFoto });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
