import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, HeartHandshake, Sparkles } from 'lucide-react';
import { api, fmtMXN } from '../api.js';
import { Foto, HERO, imagenCategoria, imagenProducto } from '../imagenes.jsx';

export default function Home() {
  const [categorias, setCategorias] = useState([]);
  const [destacados, setDestacados] = useState([
    { id: 1, nombre: 'Ganador Premium', categoria: 'Premium', precio: 8500, stock: 10 },
    { id: 2, nombre: 'Minino Plus', categoria: 'Premium', precio: 7200, stock: 8 },
    { id: 3, nombre: 'Ganador', categoria: 'Alimentos', precio: 6800, stock: 12 },
    { id: 4, nombre: 'Nupec', categoria: 'Alimentos', precio: 9200, stock: 15 },
    { id: 5, nombre: 'Ganador Recetas', categoria: 'Alimentos', precio: 7500, stock: 9 },
  ].filter((ps) => Number(ps.stock) > 0).slice(0, 4));

  useEffect(() => {
    api.getCategorias().then(setCategorias).catch(() => {});
    // Comentamos la llamada a la API para que no sobrescriba nuestros destacados manuales
    // api.getProductos().then((ps) => setDestacados((ps || []).filter((p) => Number(p.stock) > 0).slice(0, 4))).catch(() => {});
  }, []);

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="wrap pt-14 md:pt-20 pb-16 md:pb-24 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Texto */}
          <div>
            <h1 className="font-display text-[46px] leading-[1.04] md:text-[72px] font-medium text-[var(--bosque)] rise rise-1">
              Panzas llenas,<br />
              patitas <span className="moment-word">contentas.</span>
            </h1>
            <p className="mt-6 text-[var(--tinta-suave)] text-base md:text-lg leading-relaxed max-w-md rise rise-2">
              En Perricos seleccionamos nutrición premium, premios y accesorios para que tu
              compañero fiel viva mejor cada día.
            </p>
            <div className="mt-9 flex flex-wrap gap-4 rise rise-3">
              <Link to="/catalogo" className="btn-primary px-8 py-4 text-xs uppercase tracking-[0.18em]">
                Explorar catálogo <ArrowRight size={15} />
              </Link>
              <Link to="/login" className="btn-ghost px-8 py-4 text-xs uppercase tracking-[0.18em]">Mi Cuenta / Iniciar Sesión</Link>
              <Link to="/sugerencias" className="btn-ghost px-8 py-4 text-xs uppercase tracking-[0.18em]">
                Sugerir un producto
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-2 rise rise-4 text-[var(--tinta-suave)]">
              <div className="flex items-center gap-2 text-sm font-semibold"><HeartHandshake size={17} className="text-[var(--salvia)]" /> Excelente trato</div>
              <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck size={17} className="text-[var(--salvia)]" /> Calidad garantizada</div>
            </div>
          </div>

          {/* Foto hero con revelado */}
          <div className="relative rise rise-2">
            <div className="clip-reveal img-frame aspect-[4/3] shadow-[var(--sombra-lg)]">
              <Foto src={HERO} alt="Familia con su perro y gato" className="h-full w-full object-cover" />
            </div>
            <div className="floaty absolute -bottom-6 -left-4 md:-left-8 card bg-white px-5 py-4 flex items-center gap-3 shadow-lg">
              <span className="h-10 w-10 rounded-full bg-[var(--rosa-claro)] flex items-center justify-center">
                <HeartHandshake size={19} className="text-[var(--bosque)]" />
              </span>
              <div>
                <p className="font-display text-lg text-[var(--bosque)] leading-none">+28 productos</p>
                <p className="text-[11px] text-[var(--tinta-suave)] mt-1">seleccionados para ellos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CATEGORÍAS CON FOTO ============ */}
      <section className="wrap py-16 md:py-24">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-display text-3xl md:text-[44px] text-[var(--bosque)] font-medium">Elige por compañero</h2>
          <Link to="/catalogo" className="desktop-cta btn-ghost px-6 py-2.5 text-[11px] uppercase tracking-[0.16em]">
            Ver todo <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {categorias.map((c, i) => (
            <Link
              key={c.id}
              to={`/catalogo?categoria=${c.id}`}
              className={`card card-hover p-0 overflow-hidden bg-white rise rise-${Math.min(i + 1, 4)}`}
            >
              <Foto src={imagenCategoria(c.nombre)} alt={c.nombre} frame className="h-52 md:h-60 w-full" />
              <div className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-2xl text-[var(--bosque)]">{c.nombre}</h3>
                  <p className="text-xs text-[var(--tinta-suave)] mt-1">{c.total_productos} productos</p>
                </div>
                <span className="h-10 w-10 rounded-full bg-[var(--marfil-2)] flex items-center justify-center text-[var(--bosque)]">
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
          {categorias.length === 0 && [1, 2, 3].map((n) => <div key={n} className="skeleton h-72" />)}
        </div>
      </section>

      {/* ============ MOMENTO: titular grande ============ */}
      <section className="bg-[var(--bosque)] text-[var(--marfil)] py-20 md:py-28">
        <div className="wrap max-w-4xl text-center">
          <Sparkles size={26} className="mx-auto mb-6 text-[var(--crema)]" />
          <p className="font-display text-3xl md:text-[46px] leading-snug font-normal">
            «El mejor homenaje a quienes amamos es darles lo mejor: al fiel manchadito,
            al inquieto güerito y a esa pequeña empalagosa que nos llena el{' '}
            <span className="moment-word">corazón</span>.»
          </p>
        </div>
      </section>

      {/* ============ DESTACADOS ============ */}
      <section className="wrap py-16 md:py-24">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-display text-3xl md:text-[44px] text-[var(--bosque)] font-medium">Favoritos de la tienda</h2>
          <Link to="/catalogo" className="desktop-cta btn-ghost px-6 py-2.5 text-[11px] uppercase tracking-[0.16em]">
            Ver catálogo <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destacados.map((p) => (
            <article key={p.id} className="card card-hover p-4 bg-white flex flex-col">
              <Foto src={imagenProducto(p)} alt={p.nombre} frame className="h-44 w-full mb-4" />
              <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[var(--salvia)] mb-1">{p.categoria || 'Varios'}</span>
              <h3 className="font-display text-lg leading-snug text-[var(--bosque)]">{p.nombre}</h3>
            </article>
          ))}
          {destacados.length === 0 && [1, 2, 3, 4].map((n) => <div key={n} className="skeleton h-72" />)}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="wrap pb-10">
        <div className="card bg-[var(--rosa-claro)] border-[var(--rosa)]/40 px-8 py-14 md:py-16 text-center">
          <h2 className="font-display text-3xl md:text-5xl text-[var(--bosque)] font-medium mb-4">
            ¿Buscas algo en especial?
          </h2>
          <p className="text-[var(--tinta-suave)] max-w-xl mx-auto mb-8">
            Cuéntanos qué producto te gustaría encontrar y lo anotamos en el buzón comunitario.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/catalogo" className="btn-primary px-8 py-4 text-xs uppercase tracking-[0.18em]">
              Ver catálogo <ArrowRight size={15} />
            </Link>
            <Link to="/sugerencias" className="btn-ghost px-8 py-4 text-xs uppercase tracking-[0.18em] border-[var(--bosque)]">
              Enviar sugerencia
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
