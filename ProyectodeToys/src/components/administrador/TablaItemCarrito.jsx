import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Importa useParams
import './CarritoItemsComponent.css';

const CarritoItemsComponent = () => {
  const { id } = useParams(); // Obtén el ID del carrito desde la URL
  const [carritoItems, setCarritoItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItemProductId, setNewItemProductId] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  const API_BASE_URL = 'https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net';

  // Fetch carrito items with product details
  const fetchCarritoItems = async () => {
    try {
      setLoading(true);
      const itemsResponse = await fetch(`${API_BASE_URL}/itemCarrito/${id}`);
      if (!itemsResponse.ok) throw new Error('Failed to fetch carrito items');
      const itemsData = await itemsResponse.json();

      const itemsWithDetails = await Promise.all(
        itemsData.map(async (item) => {
          const productResponse = await fetch(`${API_BASE_URL}/producto/${item.id_producto}`);
          if (!productResponse.ok) throw new Error(`Failed to fetch product ${item.id_producto}`);
          const productData = await productResponse.json();

          return {
            ...item,
            nombre_producto: productData.nombre,
            precio_producto: productData.precio
          };
        })
      );

      setCarritoItems(itemsWithDetails);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching carrito items:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  // Update item quantity
 // Update item quantity
 const updateItemQuantity = async (itemId, newQuantity) => {
    try {
      const response = await fetch(`${API_BASE_URL}/itemCarrito/${itemId}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),  // Cambia 'cantidad' a 'quantity'
      });
  
      if (!response.ok) throw new Error('Failed to update item quantity');
  
      // Realiza el fetch de los items actualizados
      await fetchCarritoItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    }
  };
  
  

  // Remove item from carrito
  const removeItem = async (itemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/itemCarrito/${itemId}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove item');

      setCarritoItems(prevItems =>
        prevItems.filter(item => item.id !== itemId)
      );
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    }
  };

  // Add new item to carrito
  const addItemToCarrito = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/itemCarrito/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: newItemProductId,  // Cambiar id_producto a productId
          quantity: newItemQuantity     // Cambiar cantidad a quantity
        }),
      });
  
      if (!response.ok) throw new Error('Failed to add item');
  
      await fetchCarritoItems();
      setIsAddItemModalOpen(false);
      setNewItemProductId('');
      setNewItemQuantity(1);
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item');
    }
  };
  

  // Calculate total price of items in the cart
  const calculateTotal = () => {
    return carritoItems.reduce((total, item) =>
      total + (item.cantidad * item.precio_producto), 0
    ).toFixed(2);
  };

  useEffect(() => {
    fetchCarritoItems(); // Usar el ID de la URL para obtener los items del carrito
  }, [id]);

  if (loading) return <div className="loading">Cargando items del carrito...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="carrito-items-container">
      <h2>Detalles del Carrito #{id}</h2>

      <button
        className="btn add-item-btn"
        onClick={() => setIsAddItemModalOpen(true)}
      >
        Agregar Nuevo Item
      </button>

      <table className="carrito-items-table">
        <thead>
          <tr>
            <th>ID Producto</th>
            <th>Nombre Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Subtotal</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {carritoItems.map((item) => (
            <tr key={item.id}>
              <td>{item.id_producto}</td>
              <td>{item.nombre_producto}</td>
              <td>
                <div className="quantity-control">
                  <button
                    className="qty-btn decrease"
                    onClick={() => {
                      const newQty = Math.max(1, item.cantidad - 1);
                      updateItemQuantity(item.id, newQty);
                    }}
                  >
                    -
                  </button>
                  <span>{item.cantidad}</span>
                  <button
                    className="qty-btn increase"
                    onClick={() => updateItemQuantity(item.id, item.cantidad + 1)}
                  >
                    +
                  </button>
                </div>
              </td>
              <td>${item.precio_producto.toFixed(2)}</td>
              <td>${(item.cantidad * item.precio_producto).toFixed(2)}</td>
              <td>
                <button
                  className="btn remove-btn"
                  onClick={() => removeItem(item.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="4">Total</td>
            <td>${calculateTotal()}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      {carritoItems.length === 0 && (
        <p className="empty-cart">El carrito está vacío</p>
      )}

      {/* Add Item Modal */}
      {isAddItemModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Agregar Nuevo Item</h2>
            <input
              type="text"
              placeholder="ID de Producto"
              value={newItemProductId}
              onChange={(e) => setNewItemProductId(e.target.value)}
            />
            <div className="quantity-input">
              <label>Cantidad:</label>
              <input
                type="number"
                min="1"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(parseInt(e.target.value))}
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn submit-btn"
                onClick={addItemToCarrito}
                disabled={!newItemProductId}
              >
                Agregar
              </button>
              <button
                className="btn cancel-btn"
                onClick={() => setIsAddItemModalOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarritoItemsComponent;
