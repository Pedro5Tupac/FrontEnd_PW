import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';  // Importa el contexto de autenticación
import Header from './Header.jsx';
import { Navigate } from 'react-router-dom';  // Para redirigir al login
import './Pedidos.css';

const OrderHistory = () => {
  const { user: authUser } = useAuth();  // Obtén el usuario autenticado
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_BASE_URL = 'https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net';

  // Si no está autenticado, redirigimos al login
  if (!authUser) {
    return <Navigate to="/login" />;
  }

  // Fetch user's order history
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/pedido/usuario/${authUser.id}`);  // Usar el id del usuario autenticado
      if (!response.ok) throw new Error('Error al obtener el historial de pedidos');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch items for a selected order
  const fetchOrderItems = async (carritoId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/itemcarrito/${carritoId}`);
      if (!response.ok) throw new Error('Error al obtener los detalles del pedido');
      const itemsData = await response.json();

      // Get product details for each item
      const itemsWithDetails = await Promise.all(
        itemsData.map(async (item) => {
          const productResponse = await fetch(`${API_BASE_URL}/producto/${item.id_producto}`);
          if (!productResponse.ok) throw new Error(`Error al obtener el producto ${item.id_producto}`);
          const productData = await productResponse.json();

          return {
            ...item,
            nombre_producto: productData.nombre,
            precio_producto: productData.precio,
          };
        })
      );

      setOrderItems(itemsWithDetails);
      setSelectedOrder(orders.find((order) => order.id_carrito === carritoId));
      setIsModalOpen(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle order details view
  const handleViewDetails = (order) => {
    fetchOrderItems(order.id_carrito);
  };

  useEffect(() => {
    fetchOrders(); // Fetch order history when component mounts
  }, [authUser]); // Dependencia cambiada a authUser

  if (loading) return <div className="loading">Cargando historial de pedidos...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="header">
      

      <div className="order-history-container">
        <h1>Pedidos Pendientes</h1>

        <div className="order-cards-container">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <h2>Pedido #{order.id}</h2>
              <p><strong>Dirección:</strong> {order.direccion}</p>
              <p><strong>Método de Pago:</strong> {order.metodoPago}</p>
              <p><strong>Total:</strong> ${order.total.toLocaleString()}</p>
              <button
                className="btn view-details-btn"
                onClick={() => handleViewDetails(order)}
              >
                Ver Detalles
              </button>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Detalles de Pedido #{selectedOrder?.id}</h2>
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nombre_producto}</td>
                    <td>{item.cantidad}</td>
                    <td>${item.precio_producto.toLocaleString()}</td>
                    <td>${(item.cantidad * item.precio_producto).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3">Total:</td>
                  <td>${selectedOrder?.total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
            <button
              className="btn close-modal-btn"
              onClick={() => setIsModalOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {orders.length === 0 && <p className="empty-list">No hay pedidos registrados</p>}
    </div>
  );
};

export default OrderHistory;
