import React, { useEffect, useState } from 'react';
import { Trash2, Inbox } from 'lucide-react';
import { api, fmtFecha } from '../../api.js';

export default function SugerenciasTab() {
  const [items, setItems] = useState([]);
  const cargar = () => api.getSugerencias().then(setItems).catch(() => {});
  useEffect(() => { cargar(); }, []);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-2xl md:text-3xl text-[var(--bosque)]">Buzón de sugerencias</h2>
        <p className="text-sm text-[var(--tinta-suave)]">{items.length} recibidas</p>
      </div>
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="card p-12 bg-white text-center text-[var(--tinta-suave)]">
            <Inbox size={40} className="mx-auto mb-3 opacity-40" />
            <p>Sin sugerencias por ahora.</p>
          </div>
        )}
        {items.map((s) => (
          <div key={s.id} className="card p-5 bg-white flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-[var(--bosque)]">{s.producto}</p>
              {s.categoria && <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-bold bg-[var(--salvia-claro)] text-[var(--bosque)] px-2.5 py-1 rounded-full">{s.categoria}</span>}
              {s.motivo && <p className="text-sm text-[var(--tinta-suave)] italic mt-2">“{s.motivo}”</p>}
              <p className="text-[11px] text-[var(--tinta-suave)]/70 mt-2">{fmtFecha(s.fecha)}</p>
            </div>
            <button onClick={async () => { await api.deleteSugerencia(s.id); cargar(); }}
              className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 shrink-0" title="Eliminar">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
