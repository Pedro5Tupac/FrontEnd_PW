import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext'; // Importamos el contexto de autenticación
import Header from './Header.jsx';
import { Navigate } from 'react-router-dom'; // Para redirigir al login
import './Historial.css';

const PurchaseHistory = () => {
  const { user: authUser } = useAuth(); // Obtenemos el usuario autenticado
  const [purchases, setPurchases] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const API_BASE_URL = 'https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net';

  // Si no hay un usuario autenticado, redirigimos a la página de login
  if (!authUser) {
    return <Navigate to="/login" />;
  }

  // Obtener historial de compras del usuario autenticado
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/compra/usuario/${authUser.id}`); // Usamos el ID del usuario autenticado
      if (!response.ok) throw new Error('Error al obtener el historial de compras');
      const data = await response.json();
      setPurchases(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener detalles de los artículos de una compra seleccionada
  const fetchPurchaseItems = async (carritoId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/itemcarrito/${carritoId}`);
      if (!response.ok) throw new Error('Error al obtener los detalles de la compra');
      const itemsData = await response.json();

      // Obtener los detalles de los productos para cada item
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

      setPurchaseItems(itemsWithDetails);
      setSelectedPurchase(purchases.find((purchase) => purchase.id_carrito === carritoId));
      setIsModalOpen(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejar la selección de una compra
  const handleViewDetails = (purchase) => {
    fetchPurchaseItems(purchase.id_carrito);
  };

  useEffect(() => {
    fetchPurchases(); // Obtener el historial de compras al montar el componente
  }, [authUser]); // Dependemos del usuario autenticado

  if (loading) return <div className="loading">Cargando historial de compras...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="header">
      

      <div className="purchase-history-container">
        <h1>Historial de Compras</h1>

        <div className="purchase-cards-container">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="purchase-card">
              <h2>Compra #{purchase.id}</h2>
              <p><strong>Dirección:</strong> {purchase.direccion}</p>
              <p><strong>Método de Pago:</strong> {purchase.tipoPago}</p>
              <p><strong>Total:</strong> ${purchase.total.toLocaleString()}</p>
              <button
                className="btn view-details-btn"
                onClick={() => handleViewDetails(purchase)}
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
            <h2>Detalles de Compra #{selectedPurchase?.id}</h2>
            <table className="purchase-items-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {purchaseItems.map((item) => (
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
                  <td>${selectedPurchase?.total.toLocaleString()}</td>
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

      {purchases.length === 0 && <p className="empty-list">No hay compras registradas</p>}
    </div>
  );
};

export default PurchaseHistory;
