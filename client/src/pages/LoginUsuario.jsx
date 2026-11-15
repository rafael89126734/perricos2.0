import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';
import { api } from '../api.js';

export default function LoginUsuario() {
  const [idUsuario, setIdUsuario] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api.post('/usuarios/login', { id_usuario: idUsuario });
      localStorage.setItem('perricos_user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err.message || 'ID de usuario no encontrado o error en el servidor');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-5">
      <div className="card bg-white p-8 w-full max-w-md shadow-lg">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-16 w-16 rounded-full bg-[var(--marfil-2)] flex items-center justify-center text-[var(--bosque)] mb-4">
            <User size={32} />
          </div>
          <h1 className="font-display text-2xl text-[var(--bosque)]">Hola de nuevo</h1>
          <p className="text-sm text-[var(--tinta-suave)]">Ingresa tu ID de usuario para entrar</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <label className="label">ID de Usuario</label>
            <input 
              className="input" 
              value={idUsuario} 
              onChange={(e) => setIdUsuario(e.target.value)} 
              required 
              placeholder="Ej. 123"
            />
          </div>
          <button type="submit" className="btn-primary w-full py-4 text-xs uppercase tracking-widest mt-4">
            Entrar <ArrowRight size={14} className="inline ml-2" />
          </button>
          <div className="text-center mt-4">
            <p className="text-xs text-[var(--tinta-suave)]">¿No tienes cuenta?</p>
            <Link to="/registro" className="text-xs font-bold text-[var(--bosque)] hover:underline">Registrarme</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
