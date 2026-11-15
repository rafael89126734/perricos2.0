import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'perricos_secreto_super_seguro_cambia_esto');
if (!SECRET) throw new Error('JWT_SECRET debe configurarse en producción.');

export function generarToken(admin) {
  return jwt.sign(
    { id: admin.id, email: admin.email, nombre: admin.nombre },
    SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '12h' }
  );
}

export function verificarToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  try {
    req.admin = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o expirada' });
  }
}
