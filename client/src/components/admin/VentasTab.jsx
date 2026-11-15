import React, { useEffect, useState } from 'react';
import { Receipt, Trash2, AlertOctagon } from 'lucide-react';
import { api, fmtMXN, fmtFecha } from '../../api.js';

const fmtPeso = (g, tipo) => {
  if (tipo !== 'gramos') return `${g} pz`;
  const grams = Number(g || 0);
  const kg = Math.floor(grams / 1000);
  const rem = Math.round(grams % 1000);
  if (kg === 0) return `${rem} g`;
  if (rem === 0) return `${kg} kg`;
  return `${kg} kg ${rem} g`;
};

export default function VentasTab() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [sel, setSel] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [clienteModo, setClienteModo] = useState('usuario');
  const [idUsuario, setIdUsuario] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const cargar = async () => {
    try {
      const [ventasData, productosData] = await Promise.all([
        api.getVentas(),
        api.getProductos({ incluirInactivos: 1 }),
      ]);
      setVentas(Array.isArray(ventasData) ? ventasData : []);
      setProductos(Array.isArray(productosData) ? productosData : []);
      setError('');
    } catch (err) {
      console.error('Error cargando ventas y productos', err);
      setError(`No se pudieron cargar las ventas: ${err.message || 'verifica la conexión y sesión del administrador'}`);
    }
  };
  useEffect(() => { cargar(); }, []);

  const prod = productos.find((p) => String(p.id) === String(sel));

  const registrar = async (e) => {
    e.preventDefault();
    setError(''); setOk('');
    if (!sel || !cantidad) { setError('Elige producto y cantidad'); return; }
    if (clienteModo === 'usuario' && !idUsuario.trim()) { setError('Ingresa el ID del usuario o elige venta sin usuario'); return; }
    try {
      const r = await api.registrarVenta(Number(sel), Number(cantidad), clienteModo === 'usuario' ? idUsuario.trim() : null);
      setOk(`Venta registrada: ${fmtMXN(r.total)}${r.usuario_id ? ` — usuario #${r.usuario_id}` : ' — sin usuario asociado'} — nuevo stock: ${r.nuevo_stock}`);
      setSel(''); setCantidad(''); setIdUsuario(''); setClienteModo('usuario'); cargar();
      setTimeout(() => setOk(''), 5000);
    } catch (err) { setError(err.message); }
  };

  const resetTodo = async () => {
    if (!window.confirm('⚠️ ¿BORRAR TODO el historial de ventas? Esta acción no se puede deshacer.')) return;
    if (!window.confirm('🚨 Última confirmación: se eliminarán todas las ventas registradas.')) return;
    try { await api.resetVentas(); cargar(); } catch (err) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-[var(--bosque)]">Ventas</h2>
          <p className="text-sm text-[var(--tinta-suave)]">{ventas.length} transacciones</p>
        </div>
        <button onClick={resetTodo} className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-full shadow-sm transition">
          <AlertOctagon size={15} /> Reiniciar historial
        </button>
      </div>

      {/* Registrar venta */}
      <form onSubmit={registrar} className="card p-6 md:p-7 bg-white">
        <h3 className="font-display text-xl text-[var(--bosque)] mb-4 flex items-center gap-2">
          <Receipt size={19} /> Registrar venta (descuenta stock automáticamente)
        </h3>
        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>}
        {ok && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-sm font-medium">{ok}</div>}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="label">Producto</label>
            <select className="input" value={sel} onChange={(e) => setSel(e.target.value)} required>
              <option value="">— Elige —</option>
              {productos.filter((p) => p.stock > 0).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {p.presentacion ? `(${p.presentacion})` : ''} — stock {fmtPeso(p.stock, p.tipo_venta)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="label">Cantidad {prod ? `(${prod.tipo_venta === 'gramos' ? 'en gramos' : 'en piezas'})` : ''}</label>
            {prod?.tipo_venta === "gramos" ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-center font-bold text-[var(--tinta-suave)]">Kg</span>
                  <input type="number" min="0" className="input" value={Math.floor(Number(cantidad)/1000) || ""} onChange={(e) => setCantidad((Number(e.target.value||0)*1000) + (Number(cantidad)%1000)) } />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-center font-bold text-[var(--tinta-suave)]">g</span>
                  <input type="number" min="0" max="999" className="input" value={Math.round(Number(cantidad)%1000) || ""} onChange={(e) => setCantidad((Math.floor(Number(cantidad)/1000)*1000) + Number(e.target.value||0)) } />
                </div>
              </div>
            ) : (
              <input type="number" min="0.01" step="any" className="input" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="label">Cliente</label>
            <select className="input" value={clienteModo} onChange={(e) => setClienteModo(e.target.value)}>
              <option value="anonimo">Venta sin ID de usuario</option>
              <option value="usuario">Asociar a usuario registrado</option>
            </select>
            {clienteModo === 'usuario' && (
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]+"
                className="input"
                value={idUsuario}
                onChange={(e) => setIdUsuario(e.target.value)}
                placeholder="ID de usuario"
                aria-label="ID de usuario"
                required
              />
            )}
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full py-3 text-[11px] uppercase tracking-[0.14em]" type="submit">
              Registrar venta
            </button>
          </div>
        </div>
        {prod && (
          <p className="mt-3 text-xs text-[var(--tinta-suave)]">
            Precio: <b>{fmtMXN(prod.precio)}</b> {prod.tipo_venta === 'gramos' ? 'por kg' : 'por pieza'} ·
            Total estimado: <b>{fmtMXN((Number(cantidad || 0)) * (prod.tipo_venta === 'gramos' ? prod.precio / 1000 : prod.precio))}</b>
          </p>
        )}
      </form>

      {/* Historial */}
      <div className="card bg-white overflow-hidden">
        <div className="px-6 py-5 border-b border-[#F0EBE0]">
          <h3 className="font-display text-xl text-[var(--bosque)]">Historial de ventas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="bg-[var(--marfil-2)] text-left text-[11px] uppercase tracking-[0.14em] text-[var(--tinta-suave)]">
                <th className="px-6 py-3.5 font-bold">Producto</th>
                <th className="px-6 py-3.5 font-bold">Usuario</th>
                <th className="px-6 py-3.5 font-bold">Cantidad</th>
                <th className="px-6 py-3.5 font-bold">Total</th>
                <th className="px-6 py-3.5 font-bold">Fecha</th>
                <th className="px-6 py-3.5 font-bold text-right"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE0]">
              {ventas.map((v) => (
                <tr key={v.id} className="hover:bg-[var(--marfil)]/60">
                  <td className="px-6 py-3.5 font-semibold text-[var(--bosque)]">{v.nombre_producto}</td>
                  <td className="px-6 py-3.5 text-xs text-[var(--tinta-suave)]">{v.usuario_username ? `@${v.usuario_username}` : v.usuario_id ? `ID ${v.usuario_id}` : 'Sin ID'}</td>
                  <td className="px-6 py-3.5">{fmtPeso(v.cantidad, v.tipo_venta)}</td>
                  <td className="px-6 py-3.5 font-semibold">{fmtMXN(v.total)}</td>
                  <td className="px-6 py-3.5 text-[var(--tinta-suave)] text-xs">{fmtFecha(v.fecha)}</td>
                  <td className="px-6 py-3.5 text-right">
                    <button onClick={async () => { if (window.confirm('¿Eliminar esta venta?')) { await api.deleteVenta(v.id); cargar(); } }}
                      className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              {ventas.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-[var(--tinta-suave)]">No hay ventas registradas aún.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
