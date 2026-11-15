import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Crown, Trophy } from 'lucide-react';
import { api, fmtMXN } from '../api.js';

const POSICIONES = ['🥇', '🥈', '🥉'];

export default function TopUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.getTopUsuarios()
      .then((data) => setUsuarios(Array.isArray(data) ? data : []))
      .catch(() => setUsuarios([]))
      .finally(() => setCargando(false));
  }, []);

  return (
    <section className="wrap py-12 md:py-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <Trophy size={34} className="mx-auto mb-4 text-[var(--salvia)]" />
        <p className="eyebrow mb-3">Reconocimiento Perricos</p>
        <h1 className="font-display text-4xl md:text-5xl text-[var(--bosque)]">Top clientes de la semana</h1>
        <p className="mt-3 text-[var(--tinta-suave)]">Los tres clientes registrados con mayor compra desde el inicio de esta semana.</p>
      </div>
      {cargando ? (
        <p className="py-12 text-center text-[var(--tinta-suave)]">Cargando ranking…</p>
      ) : usuarios.length === 0 ? (
        <div className="card bg-white text-center py-14 px-6">
          <Crown size={32} className="mx-auto mb-3 text-[var(--salvia)]" />
          <p className="font-display text-2xl text-[var(--bosque)]">Aún no hay compras asociadas a usuarios esta semana</p>
          <p className="mt-2 text-sm text-[var(--tinta-suave)]">Al registrarse con su ID, los clientes pueden aparecer aquí.</p>
          <Link to="/registro" className="btn-primary inline-flex mt-6 px-6 py-3 text-xs uppercase tracking-widest">Registrarme <ArrowRight size={14} /></Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {usuarios.map((usuario, index) => (
            <article key={usuario.id} className={`card bg-white p-7 text-center ${index === 0 ? 'md:-translate-y-2 border-2 border-[var(--crema)]' : ''}`}>
              <span className="text-4xl" aria-label={`Puesto ${index + 1}`}>{POSICIONES[index]}</span>
              <p className="mt-4 text-xs uppercase tracking-[0.16em] font-bold text-[var(--salvia)]">Puesto {index + 1}</p>
              <h2 className="font-display text-2xl text-[var(--bosque)] mt-2">{usuario.nombre} {usuario.apellido}</h2>
              <p className="text-sm text-[var(--tinta-suave)]">@{usuario.username || `cliente${usuario.id}`}</p>
              <div className="mt-6 pt-5 border-t border-[#F0EBE0]">
                <p className="text-xs uppercase tracking-wider text-[var(--tinta-suave)]">Compras de la semana</p>
                <p className="font-display text-2xl text-[var(--bosque)] mt-1">{fmtMXN(usuario.total_gastado)}</p>
                <p className="text-xs text-[var(--tinta-suave)] mt-1">{usuario.numero_compras} {usuario.numero_compras === 1 ? 'compra' : 'compras'}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
