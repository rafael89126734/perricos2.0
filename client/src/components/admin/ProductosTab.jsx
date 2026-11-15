import React, { useEffect, useState } from 'react';
import { PlusCircle, Edit3, Trash2, X, Save, Upload } from 'lucide-react';
import { api, fmtMXN } from '../../api.js';

const VACIO = {
  nombre: '', categoria_id: '', presentacion: '', descripcion: '', beneficios: '',
  precio: '', costo: '', stock: '', tipo_venta: 'pieza', activo: true, imagen: '',
};

const fmtPeso = (g, tipo) => {
  if (tipo !== 'gramos') return `${g} pz`;
  const grams = Number(g || 0);
  const kg = Math.floor(grams / 1000);
  const rem = Math.round(grams % 1000);
  if (kg === 0) return `${rem} g`;
  if (rem === 0) return `${kg} kg`;
  return `${kg} kg ${rem} g`;
};

export default function ProductosTab() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [error, setError] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  const cargar = () => {
    api.getProductos({ incluirInactivos: 1 }).then(setProductos).catch(() => {});
    api.getCategorias().then(setCategorias).catch(() => {});
  };
  useEffect(() => { cargar(); }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const subirImagen = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    try {
      const url = await api.uploadImagen(file);
      setForm({ ...form, imagen: url });
    } catch (err) { setError(err.message); }
    finally { setSubiendo(false); }
  };

  const editar = (p) => {
    setEditandoId(p.id);
    setForm({
      nombre: p.nombre, categoria_id: p.categoria_id || '', presentacion: p.presentacion || '',
      descripcion: p.descripcion || '', beneficios: p.beneficios || '', precio: p.precio,
      costo: p.costo, stock: p.stock, tipo_venta: p.tipo_venta || 'pieza',
      activo: p.activo, imagen: p.imagen || '',
    });
    setMostrarForm(true);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelar = () => { setEditandoId(null); setForm(VACIO); setMostrarForm(false); setError(''); };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
      precio: Number(form.precio || 0), costo: Number(form.costo || 0), stock: Number(form.stock || 0),
    };
    try {
      if (editandoId) await api.updateProducto(editandoId, payload);
      else await api.createProducto(payload);
      cancelar(); cargar();
    } catch (err) { setError(err.message); }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este producto permanentemente?')) return;
    try { await api.deleteProducto(id); cargar(); } catch (err) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-[var(--bosque)]">Productos</h2>
          <p className="text-sm text-[var(--tinta-suave)]">{productos.length} registrados</p>
        </div>
        <button onClick={() => { setMostrarForm(!mostrarForm); if (mostrarForm) cancelar(); }}
          className="btn-primary px-5 py-3 text-[11px] uppercase tracking-[0.14em]">
          {mostrarForm ? <X size={15} /> : <PlusCircle size={15} />} {mostrarForm ? 'Cerrar' : 'Nuevo producto'}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={guardar} className="pop card p-6 md:p-8 bg-white space-y-4">
          <h3 className="font-display text-xl text-[var(--bosque)]">
            {editandoId ? `Editando #${editandoId}` : 'Nuevo producto'}
          </h3>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre *</label>
              <input name="nombre" className="input" value={form.nombre} onChange={onChange} required />
            </div>
            <div>
              <label className="label">Categoría</label>
              <select name="categoria_id" className="input" value={form.categoria_id} onChange={onChange}>
                <option value="">— Sin categoría —</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Presentación</label>
              <input name="presentacion" className="input" placeholder="Ej. Costal 10 kg / Sobre" value={form.presentacion} onChange={onChange} />
            </div>
            <div>
              <label className="label">Tipo de venta</label>
              <select name="tipo_venta" className="input" value={form.tipo_venta} onChange={onChange}>
                <option value="pieza">Por pieza / sobre</option>
                <option value="gramos">Por gramos (granel)</option>
              </select>
            </div>
            <div>
              <label className="label">Precio ($) *</label>
              <input name="precio" type="number" step="0.01" min="0" className="input" value={form.precio} onChange={onChange} required />
            </div>
            <div>
              <label className="label">Costo ($)</label>
              <input name="costo" type="number" step="0.01" min="0" className="input" value={form.costo} onChange={onChange} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="label">Stock *</label>
              {form.tipo_venta === "gramos" ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-center font-bold text-[var(--tinta-suave)]">Kg</span>
                    <input type="number" min="0" className="input" value={Math.floor(Number(form.stock)/1000) || ""} onChange={(e) => setForm({...form, stock: (Math.floor(Number(e.target.value)||0)*1000) + (Number(form.stock)%1000) })} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-center font-bold text-[var(--tinta-suave)]">g</span>
                    <input type="number" min="0" max="999" className="input" value={Math.round(Number(form.stock)%1000) || ""} onChange={(e) => setForm({...form, stock: (Math.floor(Number(form.stock)/1000)*1000) + Number(e.target.value||0) })} />
                  </div>
                </div>
              ) : (
                <input name="stock" type="number" step="0.01" min="0" className="input" value={form.stock} onChange={onChange} required />
              )}
            </div>
            <div className="flex items-end gap-3 pb-1">
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--tinta)] cursor-pointer">
                <input type="checkbox" name="activo" checked={form.activo} onChange={onChange} className="h-4 w-4 accent-[var(--bosque)]" />
                Activo / visible
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="label">Descripción</label>
              <input name="descripcion" className="input" value={form.descripcion} onChange={onChange} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Beneficios / público</label>
              <input name="beneficios" className="input" value={form.beneficios} onChange={onChange} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Imagen del producto</label>
              <div className="flex items-center gap-4">
                <label className="btn-ghost px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] cursor-pointer">
                  <Upload size={14} /> {subiendo ? 'Subiendo…' : 'Subir imagen'}
                  <input type="file" accept="image/*" onChange={subirImagen} className="hidden" />
                </label>
                {form.imagen && (
                  <img src={form.imagen} alt="preview" className="h-14 w-14 rounded-xl object-cover border border-[#DDD5C4]" />
                )}
                {form.imagen && (
                  <button type="button" onClick={() => setForm({ ...form, imagen: '' })} className="text-red-600 text-xs font-bold">Quitar</button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={cancelar} className="btn-ghost px-6 py-3 text-[11px] uppercase tracking-[0.14em]">Cancelar</button>
            <button type="submit" className="btn-primary px-6 py-3 text-[11px] uppercase tracking-[0.14em]">
              <Save size={15} /> {editandoId ? 'Guardar cambios' : 'Añadir producto'}
            </button>
          </div>
        </form>
      )}

      {/* Tabla */}
      <div className="card bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="bg-[var(--marfil-2)] text-left text-[11px] uppercase tracking-[0.14em] text-[var(--tinta-suave)]">
                <th className="px-5 py-4 font-bold">Producto</th>
                <th className="px-5 py-4 font-bold">Categoría</th>
                <th className="px-5 py-4 font-bold">Precio</th>
                <th className="px-5 py-4 font-bold">Stock</th>
                <th className="px-5 py-4 font-bold">Estado</th>
                <th className="px-5 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE0]">
              {productos.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--marfil)]/60 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {p.imagen ? (
                        <img src={p.imagen} alt="" className="h-10 w-10 rounded-lg object-cover border border-[#E7E1D5]" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-[var(--marfil-2)] border border-[#E7E1D5]" />
                      )}
                      <div>
                        <p className="font-bold text-[var(--bosque)]">{p.nombre}</p>
                        {p.presentacion && <p className="text-xs text-[var(--tinta-suave)]">{p.presentacion}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[var(--tinta-suave)]">{p.categoria || '—'}</td>
                  <td className="px-5 py-3.5 font-semibold">{fmtMXN(p.precio)}</td>
                  <td className="px-5 py-3.5">
                    <span className={p.stock > 0 ? 'text-emerald-700 font-semibold' : 'text-red-600 font-semibold'}>
                      {fmtPeso(p.stock, p.tipo_venta)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {p.activo
                      ? <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">Activo</span>
                      : <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-200 text-gray-600">Oculto</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => editar(p)} className="p-2 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition" title="Editar">
                        <Edit3 size={15} />
                      </button>
                      <button onClick={() => eliminar(p.id)} className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition" title="Eliminar">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {productos.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[var(--tinta-suave)]">Sin productos. Crea el primero con el botón “Nuevo producto”.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
