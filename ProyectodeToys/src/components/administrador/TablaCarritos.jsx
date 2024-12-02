import React, { useState, useEffect } from 'react';
import './CarritoComponent.css';

const CarritoComponent = () => {
  const [carritos, setCarritos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newCarrito, setNewCarrito] = useState({ 
    id_usuario: '', 
    estado: 'activo', 
    total: '' 
  });

  // Fetch all carritos
  const fetchCarritos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/carrito');
      if (!response.ok) throw new Error('No se pudieron cargar los carritos');
      const data = await response.json();
      setCarritos(data);
    } catch (error) {
      console.error('Error fetching carritos:', error);
      setError('No se pudieron cargar los carritos. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new carrito
  const createCarrito = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Validate input
      if (!newCarrito.id_usuario || !newCarrito.total) {
        throw new Error('Por favor complete todos los campos');
      }

      const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/carrito', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_usuario: Number(newCarrito.id_usuario),
          estado: 'activo',
          total: Number(newCarrito.total)
        }),
      });

      if (!response.ok) throw new Error('No se pudo crear el carrito');
      
      await fetchCarritos(); // Refresh the list
      setShowModal(false); // Close modal
      // Reset form
      setNewCarrito({ id_usuario: '', estado: 'activo', total: '' });
    } catch (error) {
      console.error('Error creating carrito:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load carritos on component mount
  useEffect(() => {
    fetchCarritos();
  }, []);

  // Update carrito status
  const updateCarritoStatus = async (id, nuevoEstado) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/carrito/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) throw new Error('No se pudo actualizar el estado del carrito');
      
      await fetchCarritos(); // Refresh the list
    } catch (error) {
      console.error('Error updating carrito status:', error);
      setError('No se pudo actualizar el estado del carrito');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove carrito
  const removeCarrito = async (id) => {
    try {
      const response = await fetch(`https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/carrito/${id}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) throw new Error('Network response was not ok');
  
      alert('Carrito eliminado exitosamente.');
      fetchCarritos();
    } catch (error) {
      console.error('Error eliminando el carrito:', error);
      alert('No se pudo eliminar el carrito.');
    }
  };
  // Navigate to carrito items
  const navigateToCarritoItems = (id) => {
    window.location.href = `/admin/itemcarrito/${id}`;
  };

  return (
    <div className="carrito-container">
      <div className="carrito-header">
        <h1>Gestión de Carritos</h1>
        <button 
          onClick={() => setShowModal(true)} 
          className="btn-add"
          disabled={isLoading}
        >
          Agregar Carrito
        </button>
      </div>

      {/* Error handling */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="loading-spinner">
          Cargando...
        </div>
      )}

      <table className="carrito-table">
        <thead>
          <tr>
            <th>ID Carrito</th>
            <th>ID Usuario</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {carritos.map((carrito) => (
            <tr key={carrito.id}>
              <td>{carrito.id}</td>
              <td>{carrito.id_usuario}</td>
              <td>{carrito.estado}</td>
              <td>${carrito.total.toFixed(2)}</td>
              <td>
                <div className="action-buttons">
                  <button 
                    onClick={() => navigateToCarritoItems(carrito.id)} 
                    className="btn-view"
                    disabled={isLoading}
                  >
                    Ver Items
                  </button>
                  {carrito.estado === 'activo' && (
                    <button 
                      onClick={() => updateCarritoStatus(carrito.id, 'completado')} 
                      className="btn-complete"
                      disabled={isLoading}
                    >
                      Completar
                    </button>
                  )}
                  <button 
                    onClick={() => removeCarrito(carrito.id)} 
                    className="btn-delete"
                    disabled={isLoading}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Agregar Nuevo Carrito</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createCarrito();
              }}
            >
              <div className="form-group">
                <label>ID Usuario</label>
                <input
                  type="number"
                  value={newCarrito.id_usuario}
                  onChange={(e) => setNewCarrito({ ...newCarrito, id_usuario: e.target.value })}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Total</label>
                <input
                  type="number"
                  value={newCarrito.total}
                  onChange={(e) => setNewCarrito({ ...newCarrito, total: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="submit" 
                  className="btn-save"
                  disabled={isLoading}
                >
                  {isLoading ? 'Guardando...' : 'Guardar'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn-cancel"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarritoComponent;