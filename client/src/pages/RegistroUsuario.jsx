import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, CheckCircle } from 'lucide-react';
import { api } from '../api.js';

export default function RegistroUsuario() {
  const [form, setForm] = useState({ nombre: '', apellido: '' });
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await api.post('/usuarios', form);
      setUserId(user.id);
      setSuccess(true);
      setTimeout(() => navigate('/'), 5000);
    } catch (err) {
      setError(err.message || 'Error al registrarse');
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-5">
        <div className="bg-emerald-100 text-emerald-700 p-4 rounded-full mb-4">
          <CheckCircle size={48} />
        </div>
        <h1 className="font-display text-3xl text-[var(--bosque)] mb-2">¡Registro exitoso!</h1>
        <div className="bg-white border-2 border-dashed border-[var(--salvia)] p-6 rounded-3xl mb-6 shadow-sm">
          <p className="text-sm text-[var(--tinta-suave)] mb-2">Guarda tu ID para iniciar sesión:</p>
          <p className="text-4xl font-display font-bold text-[var(--bosque)]">{userId}</p>
        </div>
        <p className="text-[var(--tinta-suave)]">Te redireccionaremos al inicio en unos segundos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-5">
      <div className="card bg-white p-8 w-full max-w-md shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 rounded-full bg-[var(--marfil-2)] flex items-center justify-center text-[var(--bosque)] mb-4">
            <User size={32} />
          </div>
          <h1 className="font-display text-2xl text-[var(--bosque)]">Únete a Perricos</h1>
          <p className="text-sm text-[var(--tinta-suave)]">Regístrate para guardar tu perfil</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="label">Nombre</label>
            <input 
              className="input" 
              value={form.nombre} 
              onChange={(e) => setForm({...form, nombre: e.target.value})} 
              required 
              placeholder="Tu nombre"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label">Apellido</label>
            <input 
              className="input" 
              value={form.apellido} 
              onChange={(e) => setForm({...form, apellido: e.target.value})} 
              required 
              placeholder="Tu apellido"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label">Nombre de Usuario</label>
            <input 
              className="input" 
              value={form.username} 
              onChange={(e) => setForm({...form, username: e.target.value})} 
              required 
              placeholder="Ej. rafa_flores"
            />
          </div>
          <button type="submit" className="btn-primary w-full py-4 text-xs uppercase tracking-widest mt-4">
            Registrarme
          </button>
          <div className="text-center mt-4">
            <p className="text-xs text-[var(--tinta-suave)]">¿Ya tienes cuenta?</p>
            <Link to="/login" className="text-xs font-bold text-[var(--bosque)] hover:underline">Iniciar sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
