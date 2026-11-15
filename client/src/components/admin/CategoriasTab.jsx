import React, { useEffect, useState } from 'react';
import { PlusCircle, Trash2, Edit3, Check, X } from 'lucide-react';
import { api } from '../../api.js';

export default function CategoriasTab() {
  const [categorias, setCategorias] = useState([]);
  const [nueva, setNueva] = useState('');
  const [editando, setEditando] = useState(null);
  const [nombreEdit, setNombreEdit] = useState('');

  const cargar = () => api.getCategorias().then(setCategorias).catch(() => {});
  useEffect(() => { cargar(); }, []);

  const crear = async (e) => {
    e.preventDefault();
    if (!nueva.trim()) return;
    try { await api.createCategoria(nueva.trim()); setNueva(''); cargar(); }
    catch (err) { alert(err.message); }
  };

  const guardarEdit = async (id) => {
    try { await api.updateCategoria(id, nombreEdit.trim()); setEditando(null); cargar(); }
    catch (err) { alert(err.message); }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría? Los productos quedarán sin categoría.')) return;
    try { await api.deleteCategoria(id); cargar(); } catch (err) { alert(err.message); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl md:text-3xl text-[var(--bosque)]">Categorías</h2>
        <p className="text-sm text-[var(--tinta-suave)]">{categorias.length} creadas</p>
      </div>

      <form onSubmit={crear} className="card p-5 bg-white flex gap-3">
        <input className="input flex-1" placeholder="Nombre de la nueva categoría…" value={nueva} onChange={(e) => setNueva(e.target.value)} />
        <button className="btn-primary px-5 py-3 text-[11px] uppercase tracking-[0.14em] whitespace-nowrap">
          <PlusCircle size={15} /> Crear
        </button>
      </form>

      <div className="card bg-white divide-y divide-[#F0EBE0]">
        {categorias.map((c) => (
          <div key={c.id} className="px-5 py-4 flex items-center justify-between gap-3">
            {editando === c.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input className="input flex-1 !py-2" value={nombreEdit} onChange={(e) => setNombreEdit(e.target.value)} />
                <button onClick={() => guardarEdit(c.id)} className="p-2 rounded-lg bg-emerald-100 text-emerald-800"><Check size={16} /></button>
                <button onClick={() => setEditando(null)} className="p-2 rounded-lg bg-gray-100 text-gray-600"><X size={16} /></button>
              </div>
            ) : (
              <>
                <div>
                  <p className="font-bold text-[var(--bosque)]">{c.nombre}</p>
                  <p className="text-xs text-[var(--tinta-suave)]">{c.total_productos} productos</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditando(c.id); setNombreEdit(c.nombre); }} className="p-2 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200"><Edit3 size={15} /></button>
                  <button onClick={() => eliminar(c.id)} className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"><Trash2 size={15} /></button>
                </div>
              </>
            )}
          </div>
        ))}
        {categorias.length === 0 && <p className="px-5 py-10 text-center text-[var(--tinta-suave)]">Sin categorías.</p>}
      </div>
    </div>
  );
}
