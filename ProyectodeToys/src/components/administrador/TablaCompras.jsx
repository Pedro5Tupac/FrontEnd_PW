import React, { useState, useEffect } from 'react';
import './ComprasTabla.css';

const CompraComponent = () => {
  const [compras, setCompras] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCompra, setCurrentCompra] = useState({
    id_usuario: '',
    id_carrito: '',
    tipoPago: '',
    direccion: ''
  });

  // Fetch all compras
  const findAll = async () => {
    try {
      const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/compra');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setCompras(data);
    } catch (error) {
      console.error('Error fetching compras:', error);
      alert('Failed to fetch compras');
    }
  };

  // Eliminar Compra
  const eliminarCompra = async (id) => {
    try {
      const response = await fetch(`https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/compra/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Network response was not ok');

      alert('Compra eliminada exitosamente.');
      findAll();
    } catch (error) {
      console.error('Error eliminando la compra:', error);
      alert('No se pudo eliminar la compra.');
    }
  };

  // Crear una nueva compra
  const create = async () => {
    try {
      const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/compra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentCompra),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      alert('Compra creada exitosamente.');
      findAll();
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creando la compra:', error);
      alert('No se pudo crear la compra.');
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setCurrentCompra({
      id_usuario: '',
      id_carrito: '',
      tipoPago: '',
      direccion: ''
    });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCompra((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Load compras on component mount
  useEffect(() => {
    findAll();
  }, []);

  return (
    <div className="compra-container">
      <div className="compra-header">
        <h1>Compras</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn-add">
          Agregar Nueva Compra
        </button>
      </div>

      <table className="compra-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ID Usuario</th>
            <th>ID Carrito</th>
            <th>Método de Pago</th>
            <th>Dirección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {compras.map((compra) => (
            <tr key={compra.id}>
              <td>{compra.id}</td>
              <td>{compra.id_usuario}</td>
              <td>{compra.id_carrito}</td>
              <td>{compra.tipoPago}</td>
              <td>{compra.direccion}</td>
              <td>
                <div className="action-buttons">
                  <button
                    onClick={() => (window.location.href = `/admin/itemcarrito/${compra.id_carrito}`)}
                    className="btn-view"
                  >
                    Ver Items
                  </button>
                  <button
                    onClick={() => eliminarCompra(compra.id)}
                    className="btn-delete"
                  >
                    Eliminar Compra
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Nuevo Compra</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                create();
              }}
            >
              <div className="form-group">
                <label htmlFor="id_usuario">ID Usuario</label>
                <input
                  id="id_usuario"
                  name="id_usuario"
                  type="number"
                  value={currentCompra.id_usuario}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="id_carrito">ID Carrito</label>
                <input
                  id="id_carrito"
                  name="id_carrito"
                  type="number"
                  value={currentCompra.id_carrito}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="tipoPago">Método de Pago</label>
                <select
                  id="tipoPago"
                  name="tipoPago"
                  value={currentCompra.tipoPago}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione un método de pago</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Efectivo">Efectivo</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="direccion">Dirección</label>
                <input
                  id="direccion"
                  name="direccion"
                  value={currentCompra.direccion}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  Crear Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompraComponent;
