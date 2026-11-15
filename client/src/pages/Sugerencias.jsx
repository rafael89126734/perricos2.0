import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { api } from '../api.js';

export default function Sugerencias() {
  const [form, setForm] = useState({ producto: '', categoria: '', motivo: '' });
  const [categorias, setCategorias] = useState([]);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  React.useEffect(() => {
    api.getCategorias().then(setCategorias).catch(() => {});
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await api.createSugerencia(form);
      setEnviado(true);
      setForm({ producto: '', categoria: '', motivo: '' });
      setTimeout(() => setEnviado(false), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-10 py-14 md:py-20">
      <div className="text-center mb-12">
        <p className="eyebrow mb-3">Buzón comunitario</p>
        <h1 className="font-display text-4xl md:text-5xl text-[var(--bosque)] font-medium mb-4">
          ¿Qué te gustaría que trajéramos a la tienda?
        </h1>
        <p className="text-[var(--tinta-suave)] max-w-xl mx-auto">
          Escribe tu sugerencia de accesorios, alimentos o productos para cualquier animal.
          Lo revisamos en el panel de administración.
        </p>
      </div>

      <form onSubmit={enviar} className="card p-8 md:p-10 bg-white space-y-6">
        {enviado && (
          <div className="fadein flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl text-sm font-medium">
            <CheckCircle2 size={20} /> ¡Sugerencia enviada con éxito! Gracias por ayudarnos a crecer.
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm">{error}</div>
        )}

        <div>
          <label className="label" htmlFor="producto">Nombre del producto *</label>
          <input id="producto" name="producto" className="input" placeholder="Ej. Correa, camita, arena…"
            value={form.producto} onChange={onChange} required />
        </div>

        <div>
          <label className="label" htmlFor="categoria">Categoría</label>
          <select id="categoria" name="categoria" className="input" value={form.categoria} onChange={onChange}>
            <option value="">— Elige una —</option>
            {categorias.map((c) => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
            <option value="Accesorios">Accesorios</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="motivo">Motivo / comentario</label>
          <textarea id="motivo" name="motivo" rows={4} className="input resize-none"
            placeholder="¿Por qué lo sugieres? ¿Para qué mascota es?"
            value={form.motivo} onChange={onChange} />
        </div>

        <div className="pt-2 text-center">
          <button type="submit" disabled={enviando} className="btn-primary px-10 py-4 text-xs uppercase tracking-[0.18em] disabled:opacity-60">
            <Send size={15} /> {enviando ? 'Enviando…' : 'Enviar sugerencia'}
          </button>
        </div>
      </form>
    </div>
  );
}
