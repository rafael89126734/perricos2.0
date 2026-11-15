import React, { useEffect, useState } from 'react';
import { CalendarDays, ImagePlus, LoaderCircle, Tag, Trash2 } from 'lucide-react';
import { api } from '../../api.js';
import { formatOfertaFecha } from '../../utils/offerDate.js';

export default function OfertasTab() {
  const [ofertas, setOfertas] = useState([]);
  const [form, setForm] = useState({ nombre: '', fecha_inicio: '', fecha_fin: '' });
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const cargar = async () => {
    try {
      const data = await api.getAdminOfertas();
      setOfertas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las ofertas.');
    }
  };

  useEffect(() => { cargar(); }, []);
  useEffect(() => () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);

  const elegirImagen = (event) => {
    const file = event.target.files?.[0] || null;
    setArchivo(file);
    setPreview(file ? URL.createObjectURL(file) : '');
  };

  const guardar = async (event) => {
    event.preventDefault();
    setError('');
    setOk('');
    if (!archivo) { setError('Selecciona la imagen de la oferta.'); return; }
    if (form.fecha_fin < form.fecha_inicio) { setError('La fecha final no puede ser anterior a la inicial.'); return; }

    setCargando(true);
    try {
      const imagen = await api.uploadImagen(archivo);
      const nueva = await api.createOferta({ ...form, imagen });
      setOfertas((actuales) => [nueva, ...actuales]);
      setForm({ nombre: '', fecha_inicio: '', fecha_fin: '' });
      setArchivo(null);
      setPreview('');
      setOk('La oferta quedó guardada y se mostrará durante las fechas indicadas.');
    } catch (err) {
      setError(err.message || 'No se pudo guardar la oferta.');
    } finally {
      setCargando(false);
    }
  };

  const eliminar = async (oferta) => {
    if (!window.confirm(`¿Eliminar la oferta “${oferta.nombre}”?`)) return;
    setError('');
    try {
      await api.deleteOferta(oferta.id);
      setOfertas((actuales) => actuales.filter((item) => item.id !== oferta.id));
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la oferta.');
    }
  };

  return (
    <div className="space-y-7">
      <div>
        <h2 className="font-display text-2xl md:text-3xl text-[var(--bosque)]">Ofertas</h2>
        <p className="text-sm text-[var(--tinta-suave)]">Crea promociones visibles para los clientes en el apartado Ofertas.</p>
      </div>

      <form onSubmit={guardar} className="card bg-white p-6 md:p-7 space-y-5">
        <h3 className="font-display text-xl text-[var(--bosque)] flex items-center gap-2"><Tag size={19} /> Nueva oferta</h3>
        {error && <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>}
        {ok && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-sm">{ok}</div>}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label className="label">Nombre de la oferta</label>
            <input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} maxLength={120} required placeholder="Ej. Descuento de temporada" />
          </div>
          <div>
            <label className="label">Desde</label>
            <input type="date" className="input" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} required />
          </div>
          <div>
            <label className="label">Hasta</label>
            <input type="date" min={form.fecha_inicio || undefined} className="input" value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} required />
          </div>
          <div>
            <label className="label">Imagen con el detalle</label>
            <label className="input flex items-center gap-2 cursor-pointer overflow-hidden">
              <ImagePlus size={17} className="shrink-0" />
              <span className="truncate">{archivo?.name || 'Elegir imagen…'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={elegirImagen} />
            </label>
          </div>
        </div>
        {preview && <div className="overflow-hidden rounded-2xl border border-[#E7E1D5] max-w-3xl"><img src={preview} alt="Vista previa de la oferta" className="w-full max-h-[360px] object-cover" /></div>}
        <button type="submit" disabled={cargando} className="btn-primary px-6 py-3 text-xs uppercase tracking-widest disabled:opacity-60">
          {cargando ? <><LoaderCircle size={15} className="animate-spin" /> Guardando…</> : 'Publicar oferta'}
        </button>
      </form>

      <section className="space-y-4">
        <h3 className="font-display text-xl text-[var(--bosque)]">Ofertas registradas ({ofertas.length})</h3>
        {ofertas.length === 0 ? <p className="card bg-white p-8 text-center text-sm text-[var(--tinta-suave)]">Todavía no hay ofertas.</p> : (
          <div className="grid md:grid-cols-2 gap-5">
            {ofertas.map((oferta) => (
              <article key={oferta.id} className="card bg-white overflow-hidden">
                <img src={oferta.imagen} alt={oferta.nombre} className="w-full aspect-[16/9] object-cover bg-[var(--marfil-2)]" />
                <div className="p-5 flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-display text-xl text-[var(--bosque)]">{oferta.nombre}</h4>
                    <p className="mt-2 flex items-center gap-2 text-xs text-[var(--tinta-suave)]"><CalendarDays size={14} />{formatOfertaFecha(oferta.fecha_inicio)} – {formatOfertaFecha(oferta.fecha_fin)}</p>
                  </div>
                  <button type="button" onClick={() => eliminar(oferta)} className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200" title="Eliminar oferta" aria-label={`Eliminar ${oferta.nombre}`}><Trash2 size={16} /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
