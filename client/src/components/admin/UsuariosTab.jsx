
import React, { useEffect, useState } from 'react';
import { User, Edit3, Save, Trash2, X, ShoppingBag } from 'lucide-react';
import { api, fmtMXN } from '../../api.js';
import { formatCantidadComprada } from '../../utils/purchaseFormat.js';

export default function UsuariosTab() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ nombre: '', apellido: '', username: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');
  const [detalleUsuario, setDetalleUsuario] = useState(null);
  const [comprasUsuario, setComprasUsuario] = useState([]);
  const [cargandoCompras, setCargandoCompras] = useState(false);
  const [errorCompras, setErrorCompras] = useState('');

  const cargar = async () => {
    try {
      const data = await api.getUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error cargando usuarios', err);
      setError(err.message || 'No se pudieron cargar los usuarios.');
    }
  };

  useEffect(() => { cargar(); }, []);

  const iniciarEdicion = (u) => {
    setEditandoId(u.id);
    setForm({ nombre: u.nombre, apellido: u.apellido, username: u.username });
    setError('');
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.updateUsuario(editandoId, form);
      setEditandoId(null);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (usuario) => {
    const confirmado = window.confirm(`¿Eliminar permanentemente a @${usuario.username || usuario.nombre} (ID ${usuario.id})?`);
    if (!confirmado) return;

    setError('');
    try {
      await api.deleteUsuario(usuario.id);
      setUsuarios((actuales) => actuales.filter((u) => u.id !== usuario.id));
      if (editandoId === usuario.id) setEditandoId(null);
      if (detalleUsuario?.id === usuario.id) setDetalleUsuario(null);
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el usuario.');
    }
  };

  const verCompras = async (usuario) => {
    setDetalleUsuario(usuario);
    setComprasUsuario([]);
    setErrorCompras('');
    setCargandoCompras(true);
    try {
      const data = await api.getHistorialUsuario(usuario.id);
      setComprasUsuario(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorCompras(err.message || 'No se pudo cargar el historial de compras.');
    } finally {
      setCargandoCompras(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-[var(--bosque)]">Usuarios Registrados</h2>
          <p className="text-sm text-[var(--tinta-suave)]">{usuarios.length} usuarios en el sistema</p>
        </div>
      </div>

      {editandoId && (
        <form onSubmit={guardar} className="card p-6 bg-white border-2 border-[var(--salvia)] space-y-4">
          <h3 className="font-display text-lg text-[var(--bosque)]">Modificar Usuario #{editandoId}</h3>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">{error}</div>}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label">Nombre</label>
              <input className="input" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} required />
            </div>
            <div>
              <label className="label">Apellido</label>
              <input className="input" value={form.apellido} onChange={(e) => setForm({...form, apellido: e.target.value})} required />
            </div>
            <div>
              <label className="label">Usuario</label>
              <input className="input" value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} required />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditandoId(null)} className="btn-ghost px-4 py-2 text-xs uppercase tracking-widest">Cancelar</button>
            <button type="submit" className="btn-primary px-4 py-2 text-xs uppercase tracking-widest flex items-center gap-2">
              <Save size={14} /> Guardar
            </button>
          </div>
        </form>
      )}

      {!editandoId && error && (
        <div role="alert" className="bg-red-50 text-red-700 p-3 rounded-xl text-sm border border-red-100">{error}</div>
      )}

      <div className="card bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-[var(--marfil-2)] text-left text-[11px] uppercase tracking-[0.14em] text-[var(--tinta-suave)]">
                <th className="px-5 py-4 font-bold">ID</th>
                <th className="px-5 py-4 font-bold">Usuario</th>
                <th className="px-5 py-4 font-bold">Nombre</th>
                <th className="px-5 py-4 font-bold">Apellido</th>
                <th className="px-5 py-4 font-bold">Fecha Registro</th>
                <th className="px-5 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE0]">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--marfil)]/60 transition">
                  <td className="px-5 py-3.5 font-mono text-xs text-[var(--tinta-suave)]">#{u.id}</td>
                  <td className="px-5 py-3.5">
                    <button type="button" onClick={() => verCompras(u)} className="text-left font-semibold text-[var(--bosque)] hover:underline" title="Ver historial de compras">
                      @{u.username || 'sin usuario'}
                      <span className="block text-[10px] font-normal text-[var(--tinta-suave)]">Inspeccionar usuario</span>
                    </button>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-[var(--bosque)]">{u.nombre}</td>
                  <td className="px-5 py-3.5 text-[var(--tinta-suave)]">{u.apellido}</td>
                  <td className="px-5 py-3.5 text-xs text-[var(--tinta-suave)]">{new Date(u.fecha_registro).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => iniciarEdicion(u)} className="p-2 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition" title="Editar usuario" aria-label={`Editar ${u.username || u.nombre}`}>
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => eliminar(u)} className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition" title="Eliminar usuario" aria-label={`Eliminar ${u.username || u.nombre}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[var(--tinta-suave)]">{error || 'No hay usuarios registrados.'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detalleUsuario && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm p-4 flex items-center justify-center" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setDetalleUsuario(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="historial-usuario-titulo" className="card bg-white w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <header className="p-5 md:p-7 border-b border-[#F0EBE0] flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--salvia)] font-bold flex items-center gap-2"><ShoppingBag size={14} /> Historial de compras</p>
                <h3 id="historial-usuario-titulo" className="font-display text-2xl text-[var(--bosque)] mt-2">{detalleUsuario.nombre} {detalleUsuario.apellido}</h3>
                <p className="text-sm text-[var(--tinta-suave)]">@{detalleUsuario.username || 'sin usuario'} · ID {detalleUsuario.id}</p>
              </div>
              <button type="button" onClick={() => setDetalleUsuario(null)} className="p-2 rounded-full hover:bg-[var(--marfil-2)]" aria-label="Cerrar historial"><X size={18} /></button>
            </header>
            <div className="p-5 md:p-7">
              {cargandoCompras ? <p className="py-10 text-center text-sm text-[var(--tinta-suave)]">Cargando compras…</p> : errorCompras ? (
                <div role="alert" className="bg-red-50 text-red-700 p-3 rounded-xl text-sm">{errorCompras}</div>
              ) : comprasUsuario.length === 0 ? (
                <p className="py-10 text-center text-sm text-[var(--tinta-suave)]">Este usuario todavía no tiene compras asociadas.</p>
              ) : (
                <>
                  <div className="rounded-2xl bg-[var(--marfil-2)] p-4 mb-5 flex items-center justify-between gap-3">
                    <span className="text-sm text-[var(--tinta-suave)]">Total de compras registradas</span>
                    <strong className="font-display text-xl text-[var(--bosque)]">{fmtMXN(comprasUsuario.reduce((suma, item) => suma + Number(item.total_producto || 0), 0))}</strong>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-sm">
                      <thead><tr className="text-left text-[10px] uppercase tracking-widest text-[var(--tinta-suave)] border-b border-[#F0EBE0]">
                        <th className="py-3 pr-3">Producto</th><th className="py-3 pr-3">Cantidad total</th><th className="py-3 pr-3">Compras</th><th className="py-3 text-right">Total pagado</th>
                      </tr></thead>
                      <tbody className="divide-y divide-[#F0EBE0]">
                        {comprasUsuario.map((item) => (
                          <tr key={`${item.producto_id ?? 'deleted'}-${item.nombre_producto}-${item.tipo_venta}`}>
                            <td className="py-3 pr-3 font-semibold text-[var(--bosque)]">
                              {item.nombre_producto}
                              {(item.presentacion_producto || item.descripcion_producto) && <span className="block mt-1 text-xs font-normal text-[var(--tinta-suave)]">{[item.presentacion_producto, item.descripcion_producto].filter(Boolean).join(' · ')}</span>}
                            </td>
                            <td className="py-3 pr-3">{formatCantidadComprada(item.cantidad_total, item.tipo_venta, item.presentacion_producto, item.descripcion_producto)}</td>
                            <td className="py-3 pr-3">{item.numero_compras}</td>
                            <td className="py-3 text-right font-semibold">{fmtMXN(item.total_producto)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
