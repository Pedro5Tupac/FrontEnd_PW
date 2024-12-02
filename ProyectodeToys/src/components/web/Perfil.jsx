import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../../AuthContext';
import './perfil.css';
const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  // If not authenticated, redirect to login
  if (!authUser) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/usuario/${authUser.id}`);
        
        if (!response.ok) {
          throw new Error('Error al obtener el perfil del usuario');
        }
        
        const userData = await response.json();
        setUser(userData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [authUser]);

  // Handlers for navigation buttons
  const handlePedidosClick = () => {
    navigate('/pedidos');
  };

  const handleHistorialClick = () => {
    navigate('/historial');
  };

  const handleEditarPerfilClick = () => {
    navigate('/editar-perfil');
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div className="not-found">Usuario no encontrado</div>;

  return (
    <div className="header">
     
      <div className="user-profile-content">
        <div className="profile-card">
          <h1 className="profile-title">Perfil de Usuario</h1>
          <div className="profile-info">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Nombre:</strong> {user.nombre}</p>
            <p><strong>Apellido:</strong> {user.apellido}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Rol:</strong> {user.rol}</p>
          </div>
          <div className="profile-actions">
            <button 
              className="profile-button pedidos-button" 
              onClick={handlePedidosClick}
            >
              Mis Pedidos
            </button>
            <button 
              className="profile-button historial-button" 
              onClick={handleHistorialClick}
            >
              Historial
            </button>
            <button 
              className="profile-button editarperfil-button" 
              onClick={handleEditarPerfilClick}
            >
              Editar perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
