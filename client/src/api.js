// Cliente HTTP hacia la API. En desarrollo Vite hace proxy de /api al backend (puerto 4000).
const TOKEN_KEY = 'perricos_token';
const ADMIN_KEY = 'perricos_admin';

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function setSession(token, admin) {
  localStorage.setItem(TOKEN_KEY, token);
  if (admin) localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
}
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
}
export function getAdmin() {
  try { return JSON.parse(localStorage.getItem(ADMIN_KEY)); } catch { return null; }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const t = getToken();
    if (t) headers['Authorization'] = `Bearer ${t}`;
  }
  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* respuesta vacía */ }
  if (!res.ok) {
    const err = new Error(data?.error || `Error ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  health: () => request('/api/health', { auth: false }),

  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: { email, password }, auth: false })
      .then((d) => { setSession(d.token, d.admin); return d; }),
  me: () => request('/api/auth/me'),
  updateMe: (payload) => request('/api/auth/me', { method: 'PUT', body: payload }),
  logout: () => clearSession(),

  getCategorias: () => request('/api/categorias', { auth: false }),
  createCategoria: (nombre) => request('/api/categorias', { method: 'POST', body: { nombre } }),
  updateCategoria: (id, nombre) => request('/api/categorias/' + id, { method: 'PUT', body: { nombre } }),
  deleteCategoria: (id) => request('/api/categorias/' + id, { method: 'DELETE' }),

  getProductos: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
    const q = qs.toString();
    return request('/api/productos' + (q ? `?${q}` : ''), { auth: false });
  },
  getProducto: (id) => request('/api/productos/' + id, { auth: false }),
  createProducto: (p) => request('/api/productos', { method: 'POST', body: p }),
  updateProducto: (id, p) => request('/api/productos/' + id, { method: 'PUT', body: p }),
  deleteProducto: (id) => request('/api/productos/' + id, { method: 'DELETE' }),

  getUsuarios: () => request('/api/usuarios'),
  updateUsuario: (id, payload) => request('/api/usuarios/' + id, { method: 'PUT', body: payload }),
  deleteUsuario: (id) => request('/api/usuarios/' + id, { method: 'DELETE' }),
  getHistorialUsuario: (id) => request('/api/usuarios/' + id + '/compras'),
  getTopUsuarios: () => request('/api/usuarios/top', { auth: false }),

  getOfertas: () => request('/api/ofertas', { auth: false }),
  getAdminOfertas: () => request('/api/ofertas/admin'),
  createOferta: (payload) => request('/api/ofertas', { method: 'POST', body: payload }),
  deleteOferta: (id) => request('/api/ofertas/' + id, { method: 'DELETE' }),

  getVentas: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, v); });
    const q = qs.toString();
    return request('/api/ventas' + (q ? `?${q}` : ''));
  },
  registrarVenta: (producto_id, cantidad, id_usuario = null) =>
    request('/api/ventas', { method: 'POST', body: { producto_id, cantidad, id_usuario } }),
  deleteVenta: (id) => request('/api/ventas/' + id, { method: 'DELETE' }),
  resetVentas: () => request('/api/ventas', { method: 'DELETE' }),

  getSugerencias: (s) => request('/api/sugerencias' + (s ? `?s=${encodeURIComponent(s)}` : '')),
  createSugerencia: (data) => request('/api/sugerencias', { method: 'POST', body: data, auth: false }),
  deleteSugerencia: (id) => request('/api/sugerencias/' + id, { method: 'DELETE' }),

  getSerie: (periodo, desde, hasta) => {
    const qs = new URLSearchParams({ periodo });
    if (desde) qs.set('desde', desde);
    if (hasta) qs.set('hasta', hasta);
    return request('/api/analiticas/serie?' + qs.toString());
  },
  getResumen: (desde, hasta) => {
    const qs = new URLSearchParams();
    if (desde) qs.set('desde', desde);
    if (hasta) qs.set('hasta', hasta);
    return request('/api/analiticas/resumen' + (qs.toString() ? '?' + qs : ''));
  },
  getInventario: () => request('/api/analiticas/inventario'),
  getMargen: (desde, hasta) => {
    const qs = new URLSearchParams();
    if (desde) qs.set('desde', desde);
    if (hasta) qs.set('hasta', hasta);
    return request('/api/analiticas/margen' + (qs.toString() ? '?' + qs : ''));
  },

  uploadImagen: async (file) => {
    const fd = new FormData();
    fd.append('imagen', file);
    const t = getToken();
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: t ? { Authorization: `Bearer ${t}` } : {},
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Error al subir imagen');
    return data.url;
  },
  post: (path, body) => request(path.startsWith('/api') ? path : `/api${path}`, { method: 'POST', body, auth: false }),
};

export const fmtMXN = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n || 0));

export const fmtFecha = (f) =>
  new Date(f).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
