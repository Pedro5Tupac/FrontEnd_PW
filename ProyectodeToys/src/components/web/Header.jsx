import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './../../AuthContext.jsx'; // Import the custom hook
import './Header.css';

const Header = ({ showSearchModal, setShowSearchModal }) => {
    const { user, logout } = useAuth();
    const { user: authUser } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isCartSidebarOpen, setIsCartSidebarOpen] = useState(false);
    const [activeCarritoId, setActiveCarritoId] = useState(null);
    const [carritoItems, setCarritoItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_BASE_URL = 'https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net';


    
    const handleConfirmCart = () => {
        if (carritoItems.length === 0) {
            alert('El carrito está vacío');
            return;
        }
        // Close the cart sidebar before navigating
        setIsCartSidebarOpen(false);
        navigate(`/pago`);
    };

    const removeItem = async (itemId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/itemCarrito/${itemId}/${activeCarritoId}`, {
                method: 'DELETE'
            });
    
            if (!response.ok) throw new Error('Failed to remove item');
    
            // Refresh cart items after removal
            await fetchCarritoItems(activeCarritoId);
        } catch (error) {
            console.error('Error removing item:', error);
            alert('No se pudo eliminar el item');
        }
    };



    // Manejo del botón "Social 4"
    const handleSocial4Click = async () => {
        if (!authUser) {
            navigate('/login'); // Redirige al usuario al login si no está autenticado
            return;
        }

        // Abre el carrito si el usuario está autenticado
        openCartSidebar();
    };

    // Fetch active carrito
    const fetchActiveCarrito = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/carrito/active/${authUser.id}`);
            const data = await response.json();

            if (data === null) {
                // Create a new carrito if none exists
                const createCarritoResponse = await fetch(`${API_BASE_URL}/carrito`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id_usuario: authUser.id,
                        total: 0
                    })
                });
                const newCarrito = await createCarritoResponse.json();
                setActiveCarritoId(newCarrito.id);
                return newCarrito.id;
            }

            setActiveCarritoId(data.id);
            return data.id;
        } catch (error) {
            console.error('Error fetching active carrito:', error);
            setError('No se pudo obtener el carrito');
            return null;
        }
    };

    // Fetch carrito items
    const fetchCarritoItems = async (carritoId) => {
        try {
            setLoading(true);
            const itemsResponse = await fetch(`${API_BASE_URL}/itemcarrito/${carritoId}`);
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

    // Actualiza la cantidad de un producto en el carrito
const updateItemQuantity = async (itemId, newQuantity) => {
    try {
        // Realiza una solicitud PUT para actualizar la cantidad del producto
        const response = await fetch(`${API_BASE_URL}/itemCarrito/${itemId}/${activeCarritoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity }), // Usa 'quantity' como clave
        });

        // Verifica si la solicitud tuvo éxito
        if (!response.ok) throw new Error('Failed to update item quantity');

        // Realiza un fetch para obtener los elementos actualizados del carrito
        await fetchCarritoItems(activeCarritoId);
    } catch (error) {
        console.error('Error updating quantity:', error);
        alert('No se pudo actualizar la cantidad');
    }
};


    // Open cart sidebar
    const openCartSidebar = async () => {
        const carritoId = await fetchActiveCarrito();
        if (carritoId) {
            await fetchCarritoItems(carritoId);
            setIsCartSidebarOpen(true);
        }
    };

    const calculateTotal = () => {
        return carritoItems.reduce((total, item) => total + item.cantidad * item.precio_producto, 0).toFixed(2);
    };

    // Manejo del Submit de la búsqueda
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setShowSearchModal(false);
        navigate('/resultados', { state: { searchQuery: searchQuery.trim() } });
    };

    return (
        <header id="main-header">
            <Link to="/" id="logo-link">
                <img src="https://gordo.blob.core.windows.net/componentes/Imagen1.jpg" alt="Logo" id="logo-image" />
            </Link>

            <nav>
                <ul id="menu">
                    <li className="menu-item">
                        <Link to="/categorias" className="menu-link">📁 CATEGORÍAS</Link>
                    </li>
                    <li className="menu-item">
                        <Link to="/categorias/Pre-venta" className="menu-link">🔜 PRE-VENTA</Link>
                    </li>
                    <li className="menu-item">💰 MASTER POINTS</li>
                    <li className="menu-item">🤖 CLUB TOYS MASTER</li>
                    <li className="menu-item">🙂 RESEÑAS</li>
                </ul>
            </nav>

            <ul id="social-icons">
    <li onClick={() => setShowSearchModal(true)}> {/* Abre el modal de búsqueda al hacer clic en la lupa */}
        <img src="https://gordo.blob.core.windows.net/componentes/Imagen29.jpg" alt="Search Icon" className="social-icon" />
    </li>
    <li>
        <Link to="/perfil">
            <img src="https://gordo.blob.core.windows.net/componentes/Imagen30.jpg" alt="User Icon" className="social-icon" />
        </Link>
    </li>
    <li>
        <img src="https://gordo.blob.core.windows.net/componentes/Imagen31.jpg" alt="Social 3" className="social-icon" />
    </li>
    <li onClick={handleSocial4Click}>
        <img 
            src="https://gordo.blob.core.windows.net/componentes/Imagen32.jpg" 
            alt="Social 4" 
            className="social-icon" 
        />
    </li>

    {/* Botón del panel de administración, visible solo si el usuario es administrador */}
    {user && user.rol === 'admin' && (
        <li>
            <Link to="/admin" className="admin-panel">Panel de administración</Link> {/* Clase específica para estilos */}
        </li>
    )}

    {/* Botón de inicio o cierre de sesión */}
    {user ? (
        <li>
            <button className="logout-button" onClick={logout}>Cerrar sesión</button> {/* Clase específica para estilos */}
        </li>
    ) : (
        <li>
            <Link to="/login" className="login-link">Iniciar sesión</Link> {/* Clase específica para estilos */}
        </li>
    )}
</ul>

            {isCartSidebarOpen && (
                <div className="cart-sidebar">
                    <button onClick={() => setIsCartSidebarOpen(false)}>Cerrar</button>
                    <h2>Carrito de Compras</h2>
                    {loading ? (
                        <p>Cargando items...</p>
                    ) : error ? (
                        <p>Error: {error}</p>
                    ) : carritoItems.length === 0 ? (
                        <p>El carrito está vacío</p>
                    ) : (
                        <>
                            {carritoItems.map(item => (
                                <div key={item.id} className="cart-item">
                                    <span>{item.nombre_producto}</span>
                                    <input 
                                        type="number" 
                                        value={item.cantidad} 
                                        onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value))}
                                        min="1"
                                    />
                                    <span>Subtotal: ${(item.cantidad * item.precio_producto).toFixed(2)}</span>
                                    <button onClick={() => removeItem(item.id)}>Eliminar</button>
                                </div>
                            ))}
                                <div className="cart-footer">
                                    <div className="cart-total">
                                        <strong>Total: ${calculateTotal()}</strong>
                                    </div>
                                    <button onClick={handleConfirmCart}>Confirmar Carrito</button>
                                </div>
                        </>
                    )}
                </div>
            )}

            {/* Modal de búsqueda */}
            {showSearchModal && (
                <>
                    {/* Overlay */}
                    <div className="search-modal-overlay" onClick={() => setShowSearchModal(false)}></div>
                    {/* Modal */}
                    <div className="search-modal">
                        <button className="close-modal" onClick={() => setShowSearchModal(false)}>❌</button>
                        <form onSubmit={handleSearchSubmit}>
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit">Buscar</button>
                        </form>
                    </div>
                </>
            )}
        </header>
    );
};

export default Header;
