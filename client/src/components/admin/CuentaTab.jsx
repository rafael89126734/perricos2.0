import React, { useState } from 'react';
import { User, Mail, KeyRound, Camera, Save, CheckCircle2 } from 'lucide-react';
import { api, getAdmin, setSession, getToken } from '../../api.js';

export default function CuentaTab() {
  const admin = getAdmin() || {};
  const [form, setForm] = useState({ email: admin.email || '', nombre: admin.nombre || '', password: '', foto: admin.foto || '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const subirFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendo(true);
    try {
      const url = await api.uploadImagen(file);
      setForm({ ...form, foto: url });
    } catch (err) { setError(err.message); }
    finally { setSubiendo(false); }
  };

  const guardar = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      const r = await api.updateMe({
        email: form.email, nombre: form.nombre, foto: form.foto,
        password: form.password || undefined,
      });
      // refrescar sesión local
      const me = await api.me();
      setSession(getToken(), me);
      setForm({ ...form, password: '' });
      setMsg('Cuenta actualizada con éxito.');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="max-w-xl">
      <div className="card p-8 bg-white space-y-6">
        <div>
          <h2 className="font-display text-2xl text-[var(--bosque)]">Mi cuenta</h2>
          <p className="text-sm text-[var(--tinta-suave)]">Actualiza tus datos de administrador.</p>
        </div>

        {msg && <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-sm"><CheckCircle2 size={17} /> {msg}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>}

        {/* Foto */}
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-[var(--bosque)] bg-[var(--marfil-2)] flex items-center justify-center shrink-0">
            {form.foto ? <img src={form.foto} alt="perfil" className="h-full w-full object-cover" /> : <User size={34} className="text-[var(--tinta-suave)]" />}
          </div>
          <label className="btn-ghost px-5 py-2.5 text-[11px] uppercase tracking-[0.14em] cursor-pointer">
            <Camera size={14} /> {subiendo ? 'Subiendo…' : 'Cambiar foto'}
            <input type="file" accept="image/*" onChange={subirFoto} className="hidden" />
          </label>
        </div>

        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="label">Nombre</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--tinta-suave)]" />
              <input name="nombre" className="input pl-11" value={form.nombre} onChange={onChange} />
            </div>
          </div>
          <div>
            <label className="label">Correo</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--tinta-suave)]" />
              <input name="email" type="email" className="input pl-11" value={form.email} onChange={onChange} required />
            </div>
          </div>
          <div>
            <label className="label">Nueva contraseña (deja en blanco para no cambiarla)</label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--tinta-suave)]" />
              <input name="password" type="password" className="input pl-11" placeholder="••••••••" value={form.password} onChange={onChange} autoComplete="new-password" />
            </div>
          </div>
          <button className="btn-primary w-full py-3.5 text-xs uppercase tracking-[0.16em]">
            <Save size={15} /> Guardar cambios
          </button>
        </form>
      </div>
    </div>
  );
}
