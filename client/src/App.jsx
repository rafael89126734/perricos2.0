import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home';
import RegistroUsuario from './pages/RegistroUsuario';
import LoginUsuario from './pages/LoginUsuario';
import Catalogo from './pages/Catalogo.jsx';
import Sugerencias from './pages/Sugerencias.jsx';
import Ofertas from './pages/Ofertas.jsx';
import TopUsuarios from './pages/TopUsuarios.jsx';
import Admin from './pages/Admin.jsx';
import { getToken } from './api.js';

function RequireAdmin({ children }) {
  return getToken() ? children : <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginUsuario />} />
        <Route path="/registro" element={<RegistroUsuario />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/sugerencias" element={<Sugerencias />} />
        <Route path="/ofertas" element={<Ofertas />} />
        <Route path="/top-usuarios" element={<TopUsuarios />} />
      </Route>
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
