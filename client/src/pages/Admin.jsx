import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { api, getToken, getAdmin } from '../api.js';
import Dashboard from '../components/admin/Dashboard.jsx';

export default function Admin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = getToken();

  if (token) return <Dashboard />;

  const login = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.login(email, password);
      // recarga suave para entrar al dashboard
      window.location.href = '/admin';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--marfil)] flex flex-col">
      <div className="px-5 py-5">
        <button onClick={() => navigate('/')} className="btn-ghost px-4 py-2 text-[11px] uppercase tracking-[0.14em]">
          <ArrowLeft size={14} /> Volver a la tienda
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 pb-16">
        <div className="pop w-full max-w-md">
          <div className="card p-8 md:p-10 bg-white">
            <div className="flex flex-col items-center text-center mb-8">
              <img src="/logo.jpg" alt="Perricos" className="h-16 w-16 rounded-full object-cover border-2 border-[var(--crema)] shadow-md mb-4" />
              <h1 className="font-display text-3xl text-[var(--bosque)]">Panel de administrador</h1>
              <p className="text-sm text-[var(--tinta-suave)] mt-2">Ingresa tus credenciales para gestionar la tienda.</p>
            </div>

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={login} className="space-y-4">
              <div>
                <label className="label" htmlFor="email">Correo</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--tinta-suave)]" />
                  <input id="email" type="email" className="input pl-11" placeholder="admin@perricos.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="password">Contraseña</label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--tinta-suave)]" />
                  <input id="password" type="password" className="input pl-11" placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-xs uppercase tracking-[0.18em] mt-2 disabled:opacity-60">
                <Lock size={15} /> {loading ? 'Entrando…' : 'Entrar al panel'}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
