import React, { useState, useEffect } from 'react';
import './PedidosTabla.css';

const PedidoComponent = () => {
  const [pedidos, setPedidos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPedido, setCurrentPedido] = useState({
    id_usuario: '',
    id_carrito: '',
    metodoPago: '',
    direccion: ''
  });

  // Fetch all pedidos
  const findAll = async () => {
    try {
      const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/pedido');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setPedidos(data);
    } catch (error) {
      console.error('Error fetching pedidos:', error);
      alert('Failed to fetch pedidos');
    }
  };

  // Completar Pedido
 // Completar Pedido
const completarPedido = async (pedido) => {
  try {
    const compraData = {
      id_usuario: pedido.id_usuario,
      id_carrito: pedido.id_carrito,
      tipoPago: pedido.metodoPago, // Convertir metodoPago a tipoPago
      direccion: pedido.direccion,
      // El total se calculará automáticamente en el backend como antes
    };

    const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/compra', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(compraData),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    // Eliminar el pedido tras completarlo
    await eliminarPedido(pedido.id);

    alert('Pedido completado y añadido a la tabla de compras.');
    findAll();
  } catch (error) {
    console.error('Error completando el pedido:', error);
    alert('No se pudo completar el pedido.');
  }
};
  // Eliminar Pedido
  const eliminarPedido = async (id) => {
    try {
      const response = await fetch(`https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/pedido/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Network response was not ok');

      alert('Pedido eliminado exitosamente.');
      findAll();
    } catch (error) {
      console.error('Error eliminando el pedido:', error);
      alert('No se pudo eliminar el pedido.');
    }
  };

  // Create a new pedido
  const create = async () => {
    try {
      const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/pedido', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentPedido),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      alert('Pedido creado exitosamente.');
      findAll();
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creando pedido:', error);
      alert('No se pudo crear el pedido.');
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setCurrentPedido({
      id_usuario: '',
      id_carrito: '',
      metodoPago: '',
      direccion: ''
    });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPedido((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Load pedidos on component mount
  useEffect(() => {
    findAll();
  }, []);

  return (
    <div className="pedido-container">
      <div className="pedido-header">
        <h1>Pedidos</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn-add">
          Agregar Nuevo Pedido
        </button>
      </div>

      <table className="pedido-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ID Usuario</th>
            <th>ID Carrito</th>
            <th>Total</th>
            <th>Método de Pago</th>
            <th>Dirección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.id}>
              <td>{pedido.id}</td>
              <td>{pedido.id_usuario}</td>
              <td>{pedido.id_carrito}</td>
              <td>${pedido.total}</td>
              <td>{pedido.metodoPago}</td>
              <td>{pedido.direccion}</td>
              <td>
                <div className="action-buttons">
                  <button
                    onClick={() => (window.location.href = `/admin/itemcarrito/${pedido.id_carrito}`)}
                    className="btn-view"
                  >
                    Ver Items
                  </button>
                  <button
                    onClick={() => completarPedido(pedido)}
                    className="btn-complete"
                  >
                    Completar Pedido
                  </button>
                  <button
                    onClick={() => eliminarPedido(pedido.id)}
                    className="btn-delete"
                  >
                    Eliminar Pedido
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
            <h2>Nuevo Pedido</h2>
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
                  value={currentPedido.id_usuario}
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
                  value={currentPedido.id_carrito}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="metodoPago">Método de Pago</label>
                <select
                  id="metodoPago"
                  name="metodoPago"
                  value={currentPedido.metodoPago}
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
                  value={currentPedido.direccion}
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
                  Crear Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidoComponent;
