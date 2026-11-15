import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { Lock, Menu, X, ArrowRight, PawPrint, Truck, ShieldCheck, HeartHandshake } from 'lucide-react';
import { getAdmin } from '../api.js';

const MARQUEE = [
  'Nutrición premium seleccionada a mano',
  'Accesorios para perros, gatos y más',
  'Panzas llenas, patitas contentas',
  'Atención cálida en cada visita',
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const admin = getAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkCls = ({ isActive }) =>
    `link-underline text-[11px] md:text-xs uppercase tracking-[0.18em] font-bold transition-colors ${
      isActive ? 'active text-[var(--bosque)]' : 'text-[var(--tinta-suave)] hover:text-[var(--bosque)]'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--marfil)]">
      {/* ===== NAV ===== */}
      <header
        className={`site-header fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[var(--marfil)]/90 backdrop-blur-md shadow-[0_10px_36px_rgba(24,39,31,0.10)]' : 'bg-transparent'
        }`}
      >
        <nav className="wrap h-[76px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
            <img
              src="/logo.jpg"
              alt="Perricos"
              className="h-11 w-11 rounded-full object-cover border-2 border-[var(--crema)] shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
            />
            <span className="font-display text-[26px] font-semibold text-[var(--bosque)] tracking-tight">
              perricos<span className="text-[var(--rosa)]">.</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-9">
            <NavLink to="/" end className={linkCls}>Inicio</NavLink>
            <NavLink to="/catalogo" className={linkCls}>Catálogo</NavLink>
            <NavLink to="/ofertas" className={linkCls}>Ofertas</NavLink>
            <NavLink to="/top-usuarios" className={linkCls}>Top clientes</NavLink>
            <NavLink to="/sugerencias" className={linkCls}>Sugerencias</NavLink>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/catalogo" className="nav-explore btn-primary px-6 py-2.5 text-[11px] uppercase tracking-[0.16em]">
              Explorar <ArrowRight size={14} />
            </Link>
            <button
              onClick={() => navigate('/admin')}
              title="Panel de administrador"
              className="h-11 w-11 rounded-full border-2 border-[var(--bosque)]/20 bg-white flex items-center justify-center hover:border-[var(--rosa)] hover:bg-[var(--rosa-claro)] transition-all"
            >
              {admin?.foto ? (
                <img src={admin.foto} alt="Admin" className="h-full w-full rounded-full object-cover" />
              ) : (
                <Lock size={17} className="text-[var(--bosque)]" />
              )}
            </button>
            <button
              className="md:hidden h-11 w-11 rounded-full border border-[var(--bosque)]/20 bg-white flex items-center justify-center"
              onClick={() => setOpen(!open)}
              aria-label="Menú"
              aria-expanded={open}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

        {open && (
          <div className="md:hidden bg-[var(--marfil)]/95 backdrop-blur-md border-t border-[var(--linea)] px-6 py-5 pop">
            <div className="flex flex-col gap-4">
              <NavLink to="/" end className={linkCls} onClick={() => setOpen(false)}>Inicio</NavLink>
              <NavLink to="/catalogo" className={linkCls} onClick={() => setOpen(false)}>Catálogo</NavLink>
              <NavLink to="/ofertas" className={linkCls} onClick={() => setOpen(false)}>Ofertas</NavLink>
              <NavLink to="/top-usuarios" className={linkCls} onClick={() => setOpen(false)}>Top clientes</NavLink>
              <NavLink to="/sugerencias" className={linkCls} onClick={() => setOpen(false)}>Sugerencias</NavLink>
            </div>
          </div>
        )}
      </header>

      <main className="site-main flex-1 pt-[76px]">
        <Outlet />
      </main>

      {/* ===== BANDA MARQUEE (momento) ===== */}
      <div className="marquee bg-[var(--bosque)] text-[var(--marfil)] overflow-hidden py-3.5 mt-20" aria-hidden="true">
        <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i} className="flex items-center gap-10 text-[12px] uppercase tracking-[0.22em] font-bold">
              {t} <PawPrint size={14} className="text-[var(--rosa)]" />
            </span>
          ))}
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="site-footer bg-[var(--bosque)] text-[var(--marfil)]">
        <div className="wrap py-14 grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.jpg" alt="Perricos" className="h-11 w-11 rounded-full object-cover border-2 border-[var(--crema)]" />
              <span className="font-display text-2xl font-semibold">perricos<span className="text-[var(--rosa)]">.</span></span>
            </div>
            <p className="text-sm text-[var(--marfil)]/70 leading-relaxed max-w-sm">
              Nutrición y accesorios de calidad para tus compañeros fieles.
              Panzas llenas, patitas contentas.
            </p>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[var(--crema)] mb-4">Explora</h4>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link to="/" className="text-[var(--marfil)]/80 hover:text-white w-max link-underline">Inicio</Link>
              <Link to="/catalogo" className="text-[var(--marfil)]/80 hover:text-white w-max link-underline">Catálogo</Link>
              <Link to="/ofertas" className="text-[var(--marfil)]/80 hover:text-white w-max link-underline">Ofertas</Link>
              <Link to="/top-usuarios" className="text-[var(--marfil)]/80 hover:text-white w-max link-underline">Top clientes</Link>
              <Link to="/sugerencias" className="text-[var(--marfil)]/80 hover:text-white w-max link-underline">Sugerencias</Link>
            </div>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] font-bold text-[var(--crema)] mb-4">Confianza</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-[var(--marfil)]/80">
              <li className="flex items-center gap-2"><Truck size={15} className="text-[var(--crema)]" /> excelente trato</li>
              <li className="flex items-center gap-2"><ShieldCheck size={15} className="text-[var(--crema)]" /> Garantía de calidad</li>
              <li className="flex items-center gap-2"><HeartHandshake size={15} className="text-[var(--crema)]" /> Trato cálido</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-5">
          <p className="wrap flex items-center justify-center gap-2 text-xs text-[var(--marfil)]/50">
            <PawPrint size={13} className="text-[var(--rosa)]" /> Perricos — Todo para tus compañeros fieles · © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

