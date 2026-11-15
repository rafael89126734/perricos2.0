import React, { useEffect, useState, useMemo } from 'react';
import { Foto } from '../imagenes.jsx';
import { useSearchParams } from 'react-router-dom';
import { Search, X, PackageOpen } from 'lucide-react';
import { api, fmtMXN } from '../api.js';

export default function Catalogo() {
  const [params, setParams] = useSearchParams();
  const catParam = params.get('categoria') || '';
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.getCategorias().then(setCategorias).catch(() => {});
  }, []);

  useEffect(() => {
    setCargando(true);
    api.getProductos({ categoria: catParam || undefined, s: busqueda || undefined })
      .then(setProductos)
      .catch(() => setProductos([]))
      .finally(() => setCargando(false));
  }, [catParam, busqueda]);

  const catNombre = useMemo(() => {
    const c = categorias.find((x) => String(x.id) === String(catParam));
    return c ? c.nombre : '';
  }, [categorias, catParam]);

  const seleccionarCat = (id) => {
    const p = new URLSearchParams(params);
    if (id) p.set('categoria', id); else p.delete('categoria');
    setParams(p, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-10 py-12 md:py-16">
      {/* Encabezado */}
      <div className="border-b border-[#E7E1D5] pb-8 mb-10">
        <p className="eyebrow mb-3">Inventario disponible</p>
        <h1 className="font-display text-4xl md:text-5xl text-[var(--bosque)] font-medium">
          {catNombre ? catNombre : 'Colección completa'}
        </h1>

        {/* Buscador */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2.5 bg-white border border-[#DDD5C4] rounded-full px-5 py-3 w-full md:max-w-sm shadow-sm focus-within:border-[var(--salvia)] focus-within:ring-4 focus-within:ring-[var(--salvia)]/15 transition">
            <Search size={16} className="text-[var(--tinta-suave)]" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto…"
              className="bg-transparent outline-none text-sm w-full placeholder-[var(--tinta-suave)]/60"
            />
            {busqueda && (
              <button onClick={() => setBusqueda('')} className="text-[var(--tinta-suave)] hover:text-black">
                <X size={15} />
              </button>
            )}
          </div>
          {catNombre && (
            <button onClick={() => seleccionarCat('')} className="btn-ghost px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] w-max">
              <X size={14} /> Ver todo
            </button>
          )}
        </div>

        {/* Filtros por categoría */}
        <div className="flex flex-wrap gap-2.5 mt-6">
          <button
            onClick={() => seleccionarCat('')}
            className={`px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.14em] font-bold border transition-all ${
              !catParam
                ? 'bg-[var(--bosque)] text-[var(--marfil)] border-[var(--bosque)] shadow-md'
                : 'bg-white text-[var(--tinta-suave)] border-[#DDD5C4] hover:bg-[var(--marfil-2)]'
            }`}
          >
            Todos
          </button>
          {categorias.map((c) => (
            <button
              key={c.id}
              onClick={() => seleccionarCat(String(c.id))}
              className={`px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.14em] font-bold border transition-all ${
                String(catParam) === String(c.id)
                  ? 'bg-[var(--bosque)] text-[var(--marfil)] border-[var(--bosque)] shadow-md'
                  : 'bg-white text-[var(--tinta-suave)] border-[#DDD5C4] hover:bg-[var(--marfil-2)]'
              }`}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de productos */}
      {cargando ? (
        <p className="text-center text-[var(--tinta-suave)] py-20">Cargando productos…</p>
      ) : productos.length === 0 ? (
        <div className="text-center py-24 text-[var(--tinta-suave)]">
          <PackageOpen size={44} className="mx-auto mb-4 opacity-40" />
          <p className="font-display text-2xl text-[var(--bosque)] mb-2">No hay productos en esta sección</p>
          <p className="text-sm">Prueba con otra categoría o término de búsqueda.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productos.map((p) => (
            <article key={p.id} className="card card-hover p-7 flex flex-col bg-white">
              <div className="mb-5 overflow-hidden rounded-2xl border border-[#E7E1D5] aspect-square bg-[var(--marfil-2)] shadow-sm">
                <Foto src={p.imagen} alt={p.nombre} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
              </div>
              <div className="flex items-start justify-between mb-4">
                <span className="text-[10px] uppercase tracking-[0.16em] font-bold bg-[var(--salvia-claro)] text-[var(--bosque)] px-3.5 py-1.5 rounded-full">
                  {p.categoria || 'Varios'}
                </span>
                {p.stock > 0 ? (
                  <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
                    Stock: {p.stock} {p.tipo_venta === 'gramos' ? 'g' : 'pz'}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-red-100 text-red-700">Agotado</span>
                )}
              </div>

              <h3 className="font-display text-[26px] leading-tight text-[var(--bosque)] mb-1">{p.nombre}</h3>
              {p.presentacion && <p className="text-sm font-semibold text-[var(--tinta-suave)] mb-1.5">{p.presentacion}</p>}
              {p.descripcion && <p className="text-[13px] text-[var(--tinta-suave)]/80 mb-3">{p.descripcion}</p>}
              {p.beneficios && (
                <p className="text-[13px] italic text-[var(--bosque)] bg-[var(--marfil-2)] border border-[#E7E1D5] rounded-2xl p-3.5 mb-5">
                  “{p.beneficios}”
                </p>
              )}

              <div className="mt-auto flex items-end justify-between border-t border-[#F0EBE0] pt-4">
                <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[var(--tinta-suave)]">
                  Precio {p.tipo_venta === 'gramos' ? '(x kg)' : ''}
                </span>
                <span className="font-display text-2xl font-semibold text-[var(--bosque)]">{fmtMXN(p.precio)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
