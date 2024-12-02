import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import './FormularioPago.css';

const FormularioPago = () => {
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        metodoPago: '',
        direccion: '',
        numeroCuenta: '',
        banco: '',
        numeroTarjeta: '',
        fechaVencimiento: '',
        correoPypal: ''
    });

    const API_BASE_URL = 'https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net';

    useEffect(() => {
        if (authUser && authUser.id) {
            fetchCarritoItems();
        } else {
            navigate('/login');
        }
    }, [authUser, navigate]);

    const fetchCarritoItems = async () => {
        if (!authUser || !authUser.id) {
            setError('Usuario no autenticado');
            return;
        }

        try {
            setLoading(true);
            // Use the correct endpoint for active cart
            const carritoResponse = await fetch(`${API_BASE_URL}/carrito/active/${authUser.id}`);
            
            if (!carritoResponse.ok) {
                throw new Error('No se pudo obtener el carrito activo');
            }
            
            const carritoData = await carritoResponse.json();
            
            if (!carritoData || !carritoData.id) {
                setError('No hay carrito activo');
                setLoading(false);
                return;
            }
            
            const idCarrito = carritoData.id;
            
            // Fetch cart items
            const itemsResponse = await fetch(`${API_BASE_URL}/itemcarrito/${idCarrito}`);
            if (!itemsResponse.ok) throw new Error('No se pudieron cargar los items del carrito');
            const itemsData = await itemsResponse.json();

            const itemsWithDetails = await Promise.all(
                itemsData.map(async (item) => {
                    const productResponse = await fetch(`${API_BASE_URL}/producto/${item.id_producto}`);
                    if (!productResponse.ok) throw new Error(`No se pudo obtener el producto ${item.id_producto}`);
                    const productData = await productResponse.json();

                    return {
                        ...item,
                        nombre: productData.nombre,
                        precio: productData.precio
                    };
                })
            );

            setItems(itemsWithDetails);
            
            // Calculate total
            const totalCarrito = itemsWithDetails.reduce((acc, item) =>
                acc + item.precio * item.cantidad, 0);
            setTotal(totalCarrito);
            
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar los items del carrito:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!authUser || !authUser.id) {
            alert('Por favor, inicie sesión');
            navigate('/login');
            return;
        }
        
        try {
            // Fetch active cart using the correct endpoint
            const carritoResponse = await fetch(`${API_BASE_URL}/carrito/active/${authUser.id}`);
            const carritoData = await carritoResponse.json();
            
            if (!carritoData || !carritoData.id) {
                throw new Error('No se encontró un carrito activo');
            }
            
            const idCarrito = carritoData.id;
            
            // Create pedido
            const pedidoData = {
                id_usuario: authUser.id,
                id_carrito: idCarrito,
                total,
                metodoPago: formData.metodoPago,
                direccion: formData.direccion
            };

            // Create pedido
            const pedidoResponse = await fetch(`${API_BASE_URL}/pedido`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pedidoData)
            });

            if (!pedidoResponse.ok) {
                throw new Error('No se pudo crear el pedido');
            }

            // Update cart status to completed
            const updateCarritoResponse = await fetch(`${API_BASE_URL}/carrito/${idCarrito}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    estado: "completado"
                })
            });

            if (!updateCarritoResponse.ok) {
                throw new Error('No se pudo actualizar el estado del carrito');
            }

            alert('Pedido realizado exitosamente');
            navigate('/');
        } catch (err) {
            console.error('Error al procesar el pedido:', err);
            alert('Hubo un error al procesar su pedido');
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!authUser || !authUser.id) {
        return (
            <div>
                <p>Por favor, inicie sesión para continuar</p>
                <button onClick={() => navigate('/login')}>Iniciar Sesión</button>
            </div>
        );
    }

    return (
        <div className="header">
            <div className="payment-container">
                <div className="cart-details">
                    <h2>Detalles del Carrito</h2>
                    <ul className="cart-items">
                        {items.map((item) => (
                            <li key={item.id} className="cart-item">
                                <span className="item-name">{item.nombre}</span>
                                <div className="item-details">
                                    <span>Cantidad: {item.cantidad}</span>
                                    <span>Precio: S/ {item.precio}</span>
                                    <span>Subtotal: S/ {item.cantidad * item.precio}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="cart-total">
                        <h3>Total: S/ {total.toFixed(2)}</h3>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="payment-form">
                    <h2>Confirmación de Pago</h2>
                    <div className="form-group">
                        <label htmlFor="metodoPago">Método de Pago</label>
                        <select
                            id="metodoPago"
                            name="metodoPago"
                            value={formData.metodoPago}
                            onChange={handleChange}
                            required
                            className="form-input"
                        >
                            <option value="">Seleccione un método</option>
                            <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                            <option value="Tarjeta de Credito">Tarjeta de Crédito</option>
                            <option value="Tarjeta de Debito">Tarjeta de Débito</option>
                            <option value="Paypal">Paypal</option>
                        </select>
                    </div>

                    {formData.metodoPago && (
                        <div className="payment-details">
                            {formData.metodoPago === 'Transferencia Bancaria' && (
                                <div className="method-details">
                                    <h4>Detalles para Transferencia Bancaria</h4>
                                    <input
                                        type="text"
                                        name="numeroCuenta"
                                        placeholder="Número de cuenta"
                                        value={formData.numeroCuenta}
                                        onChange={handleChange}
                                        className="form-input"
                                    />
                                    <input
                                        type="text"
                                        name="banco"
                                        placeholder="Banco"
                                        value={formData.banco}
                                        onChange={handleChange}
                                        className="form-input"
                                    />
                                </div>
                            )}
                            {(formData.metodoPago === 'Tarjeta de Credito' || formData.metodoPago === 'Tarjeta de Debito') && (
                                <div className="method-details">
                                    <h4>{formData.metodoPago === 'Tarjeta de Credito' ? 'Detalles para Tarjeta de Crédito' : 'Detalles para Tarjeta de Débito'}</h4>
                                    <input
                                        type="text"
                                        name="numeroTarjeta"
                                        placeholder="Número de Tarjeta"
                                        value={formData.numeroTarjeta}
                                        onChange={handleChange}
                                        className="form-input"
                                    />
                                    <input
                                        type="text"
                                        name="fechaVencimiento"
                                        placeholder="Fecha de Vencimiento (MM/YY)"
                                        value={formData.fechaVencimiento}
                                        onChange={handleChange}
                                        className="form-input"
                                    />
                                </div>
                            )}
                            {formData.metodoPago === 'Paypal' && (
                                <div className="method-details">
                                    <h4>Detalles para Paypal</h4>
                                    <input
                                        type="email"
                                        name="correoPypal"
                                        placeholder="Correo de Paypal"
                                        value={formData.correoPypal}
                                        onChange={handleChange}
                                        className="form-input"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="direccion">Dirección</label>
                        <input
                            type="text"
                            id="direccion"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>
                    <button type="submit" className="submit-button">Realizar Pedido</button>
                </form>
            </div>
        </div>
    );
};

export default FormularioPago;