import React from 'react';
import Sidebar from './PaginaPrincipal.jsx'; // Tu barra lateral
import { Outlet } from 'react-router-dom';
import './layout.css';
import { useAuth } from '../../AuthContext.jsx';
import { Navigate } from 'react-router-dom';  // Importa Navigate

const Layout = () => {
  const { user } = useAuth();  // Obtén los datos del usuario (que incluye el rol)

  // Si no hay usuario o no es un usuario autenticado, redirigir al login
  if (!user) {
      return <Navigate to="/login" />;  // Redirige a la página de login
  }

  // Si el usuario no es admin, mostrar un mensaje o no mostrar el panel
  if (user.rol !== 'admin') {
    return (
      <div className="layout">
        <div className="sidebar">
          <Sidebar />
        </div>
        
        <div className="content">
          <p>No tienes acceso a este panel. Solo los administradores pueden ver el contenido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className="sidebar">
        <Sidebar />
      </div>
      
      {/* Contenido dinámico */}
      <div className="content">
        <Outlet /> {/* Muestra el contenido de las rutas protegidas */}
      </div>
    </div>
  );
};

export default Layout;
