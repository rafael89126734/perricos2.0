import React, { useEffect, useState } from 'react';
import { CalendarDays, Tag } from 'lucide-react';
import { api } from '../api.js';
import { formatOfertaFecha } from '../utils/offerDate.js';

export default function Ofertas() {
  const [ofertas, setOfertas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.getOfertas()
      .then((data) => setOfertas(Array.isArray(data) ? data : []))
      .catch(() => setOfertas([]))
      .finally(() => setCargando(false));
  }, []);

  return (
    <section className="wrap py-12 md:py-16">
      <div className="max-w-3xl mb-10">
        <p className="eyebrow mb-3">Promociones vigentes</p>
        <h1 className="font-display text-4xl md:text-5xl text-[var(--bosque)]">Ofertas</h1>
        <p className="mt-3 text-[var(--tinta-suave)]">Consulta las promociones disponibles en Perricos.</p>
      </div>
      {cargando ? (
        <p className="py-16 text-center text-[var(--tinta-suave)]">Cargando ofertas…</p>
      ) : ofertas.length === 0 ? (
        <div className="card bg-white text-center py-16 px-6">
          <Tag size={34} className="mx-auto mb-4 text-[var(--salvia)]" />
          <h2 className="font-display text-2xl text-[var(--bosque)]">No hay ofertas vigentes por ahora</h2>
          <p className="mt-2 text-sm text-[var(--tinta-suave)]">Vuelve pronto para consultar nuevas promociones.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {ofertas.map((oferta) => (
            <article key={oferta.id} className="card overflow-hidden bg-white">
              <div className="relative w-full aspect-[4/3] md:aspect-[16/9] bg-[var(--marfil-2)]">
                <img src={oferta.imagen} alt={oferta.nombre} className="absolute inset-0 h-full w-full object-cover" />
              </div>
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="font-display text-2xl md:text-3xl text-[var(--bosque)]">{oferta.nombre}</h2>
                <p className="flex items-center gap-2 text-sm text-[var(--tinta-suave)] shrink-0">
                  <CalendarDays size={16} /> {formatOfertaFecha(oferta.fecha_inicio)} – {formatOfertaFecha(oferta.fecha_fin)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
