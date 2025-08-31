import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import AutomatizacionesList from './pages/AutomatizacionesList';
import AutomatizacionCrear from './pages/AutomatizacionCrear';
import EjecutarAutomatizacionDisponible from './pages/EjecutarAutomatizacionDisponible';
import AutomatizacionEditar from './pages/AutomatizacionEditar';
import AutomatizacionDetalle from './pages/AutomatizacionDetalle';
import Login from './components/Login';

const AppRouter = () => {
  const authed = !!localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (!authed) return <Login onLogin={() => window.location.reload()} />;

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-gradient-to-r from-blue-400 via-green-300 to-yellow-200 shadow-md">
        <div className="flex gap-4">
          <Link to="/automatizaciones">
            <button className={`px-5 py-2 rounded-lg font-semibold shadow ${location.pathname.startsWith('/automatizaciones') && location.pathname !== '/automatizaciones/crear' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-600'} hover:bg-blue-700 hover:text-white transition`}>
              Automatizaciones
            </button>
          </Link>
          <Link to="/automatizaciones/crear">
            <button className={`px-5 py-2 rounded-lg font-semibold shadow ${location.pathname === '/automatizaciones/crear' ? 'bg-green-600 text-white' : 'bg-white text-green-600 border border-green-600'} hover:bg-green-700 hover:text-white transition`}>
              Crear
            </button>
          </Link>
        </div>
        <button onClick={handleLogout} className="bg-red-500 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-red-600 transition">Cerrar sesión</button>
      </div>
      <Routes>
        <Route path="/" element={<Navigate to="/automatizaciones" />} />
        <Route path="/automatizaciones" element={<AutomatizacionesList />} />
        <Route path="/automatizaciones/crear" element={<AutomatizacionCrear />} />
        <Route path="/automatizaciones/ejecutar/:tipoId" element={<EjecutarAutomatizacionDisponible />} />
        <Route path="/automatizaciones/:id/editar" element={<AutomatizacionEditar />} />
        <Route path="/automatizaciones/:id" element={<AutomatizacionDetalle />} />
        <Route path="*" element={<div>404 - Página no encontrada</div>} />
      </Routes>
    </>
  );
};

export default AppRouter;
