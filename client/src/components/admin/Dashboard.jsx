import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, FolderOpen, Receipt, BarChart3, Mail, User, LogOut, Home, Tag } from 'lucide-react';
import { api, clearSession, getAdmin } from '../../api.js';
import ProductosTab from './ProductosTab.jsx';
import CategoriasTab from './CategoriasTab.jsx';
import VentasTab from './VentasTab.jsx';
import AnaliticasTab from './AnaliticasTab.jsx';
import SugerenciasTab from './SugerenciasTab.jsx';
import UsuariosTab from './UsuariosTab.jsx';
import OfertasTab from './OfertasTab.jsx';
import CuentaTab from './CuentaTab.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';

const TABS = [
  { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
  { id: 'productos', label: 'Productos', icon: Package },
  { id: 'categorias', label: 'Categorías', icon: FolderOpen },
  { id: 'ventas', label: 'Ventas', icon: Receipt },
  { id: 'ofertas', label: 'Ofertas', icon: Tag },
  { id: 'analiticas', label: 'Analíticas', icon: BarChart3 },
  { id: 'sugerencias', label: 'Buzón', icon: Mail },
  { id: 'usuarios', label: 'Usuarios', icon: User },
  { id: 'cuenta', label: 'Cuenta', icon: User },
];

export default function Dashboard() {
  const [tab, setTab] = useState('dashboard');
  const admin = getAdmin();
  const navigate = useNavigate();

  const logout = () => {
    clearSession();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[var(--marfil-2)]">
      {/* Barra superior */}
      <header className="admin-header bg-[var(--bosque)] text-[var(--marfil)] sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="" className="h-9 w-9 rounded-full object-cover border-2 border-[var(--crema)]" />
            <span className="font-display text-xl">perricos<span className="text-[var(--rosa)]">.</span></span>
            <span className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] font-bold bg-white/10 px-3 py-1 rounded-full ml-2">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full hover:bg-white/10 transition">
              <Home size={14} /> <span className="hidden sm:inline">Ver tienda</span>
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full bg-[var(--rosa)] text-[var(--bosque)] hover:brightness-105 transition">
              <LogOut size={14} /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-5 px-5 md:mx-0 md:px-0">
          {TABS.map((t) => {
            const Icon = t.icon;
            const activo = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                  activo
                    ? 'bg-[var(--bosque)] text-[var(--marfil)] border-[var(--bosque)] shadow-md'
                    : 'bg-white text-[var(--tinta-suave)] border-[#DDD5C4] hover:bg-[var(--marfil)]'
                }`}
              >
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Contenido */}
        <div className="fadein" key={tab}>
          <ErrorBoundary tab={TABS.find((t) => t.id === tab)?.label}>
            {tab === 'dashboard' && <AnaliticasTab modo="resumen" />}
            {tab === 'productos' && <ProductosTab />}
            {tab === 'categorias' && <CategoriasTab />}
            {tab === 'ventas' && <VentasTab />}
            {tab === 'ofertas' && <OfertasTab />}
            {tab === 'analiticas' && <AnaliticasTab modo="completo" />}
            {tab === 'sugerencias' && <SugerenciasTab />}
            {tab === 'usuarios' && <UsuariosTab />}
            {tab === 'cuenta' && <CuentaTab />}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
