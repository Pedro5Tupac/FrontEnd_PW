import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Header from './Header';
import { useAuth } from '../../AuthContext';
import './editarperfil.css';

const EditarPerfil = () => {
  const [user, setUser] = useState(null);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
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
        setNombre(userData.nombre);
        setApellido(userData.apellido);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones previas
    if (nombre.trim() === '') {
        setError('El nombre no puede estar vacío');
        return;
    }

    if (apellido.trim() === '') {
        setError('El apellido no puede estar vacío');
        return;
    }

    if (password && password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
    }

    try {
        console.log('Datos a enviar:', {
            id: authUser.id,
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: user.email,
            rol: user.rol,
            ...(password && { password })
        });

        const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/usuario', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: authUser.id,
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                email: user.email,
                rol: user.rol,
                ...(password && { password })
            })
        });

        // Registro de respuesta completa para diagnóstico
        const responseText = await response.text();
        console.log('Respuesta del servidor:', responseText);

        if (!response.ok) {
            throw new Error(`Error al actualizar: ${responseText}`);
        }

        setSuccessMessage('Perfil actualizado exitosamente');
        setError(null);
        
        setTimeout(() => {
            navigate('/perfil');
        }, 2000);
    } catch (err) {
        console.error('Error de actualización:', err);
        setError(err.message || 'Ocurrió un error al actualizar el perfil');
        setSuccessMessage('');
    }
};
  if (loading) return <div className="loading">Cargando...</div>;
  if (!user) return <div className="not-found">Usuario no encontrado</div>;

  return (
    <div className="user-profile-container">
      
      <div className="editar-perfil-content">
        <div className="profile-card">
          <h1 className="profile-title">Editar Perfil</h1>
          
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
          
          <form onSubmit={handleSubmit} className="editar-perfil-form">
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="apellido">Apellido</label>
              <input
                type="text"
                id="apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Nueva Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Dejar en blanco si no desea cambiar"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme la nueva contraseña"
              />
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="profile-button save-button"
              >
                Guardar Cambios
              </button>
              <button 
                type="button" 
                className="profile-button cancel-button"
                onClick={() => navigate('/perfil')}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarPerfil;