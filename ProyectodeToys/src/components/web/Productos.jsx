import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import './Productos.css';

const Productos = () => {
    const { nombreProducto } = useParams();
    const nombreDecodificado = decodeURIComponent(nombreProducto);
    const [producto, setProducto] = useState(null);
    const [imagenes, setImagenes] = useState([]);
    const [marca, setMarca] = useState(null);
    const [imagenPrincipal, setImagenPrincipal] = useState('');
    const [cantidad, setCantidad] = useState(1); // Nueva cantidad de productos
    const { user: authUser } = useAuth(); // Autenticación del usuario
    const navigate = useNavigate(); // Navegación
    const API_BASE_URL = 'https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net';

    // Cargar las imágenes del producto
    const cargarImagenes = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/imagenesproductos`);
            if (!response.ok) {
                throw new Error('Error al cargar las imágenes');
            }
            const data = await response.json();
            setImagenes(data);

            const imagenesProducto = data.filter(img => img.id_producto === producto?.id);
            if (imagenesProducto.length > 0 && !imagenPrincipal) {
                setImagenPrincipal(imagenesProducto[0].url);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Cargar los detalles del producto
    const cargarProducto = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/producto`);
            if (!response.ok) {
                throw new Error('Error al cargar el producto');
            }
            const data = await response.json();
            const productoSeleccionado = data.find(p => p.nombre.toLowerCase() === nombreDecodificado.toLowerCase());
            if (productoSeleccionado) {
                setProducto(productoSeleccionado);
                const marcaResponse = await fetch(`${API_BASE_URL}/marca/${productoSeleccionado.id_marca}`);
                const marcaData = await marcaResponse.json();
                setMarca(marcaData);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Agregar el producto al carrito
    const agregarAlCarrito = async () => {
        if (!authUser) {
            navigate('/login');
            return;
        }
    
        try {
            // Obtener carrito activo
            let carritoResponse = await fetch(`${API_BASE_URL}/carrito/active/${authUser.id}`);
            let carrito = null;
    
            if (carritoResponse.ok) {
                const data = await carritoResponse.json();
                if (data) {
                    carrito = data;
                }
            }
    
            if (!carrito) {
                // Crear carrito si no existe
                const crearCarritoResponse = await fetch(`${API_BASE_URL}/carrito`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id_usuario: authUser.id, total: 0 }),
                });
                if (!crearCarritoResponse.ok) throw new Error('No se pudo crear el carrito.');
                carrito = await crearCarritoResponse.json();
            }
    
            // Agregar producto al carrito
            const response = await fetch(`${API_BASE_URL}/itemCarrito/${carrito.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: producto.id,
                    quantity: cantidad,
                }),
            });
    
            if (!response.ok) throw new Error('No se pudo agregar el producto al carrito.');
            alert('¡Producto agregado al carrito!');
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
            alert('Error al agregar el producto.');
        }
    };
    

    useEffect(() => {
        cargarProducto();
    }, [nombreDecodificado]);

    useEffect(() => {
        if (producto) cargarImagenes();
    }, [producto]);

    if (!producto) return <p>Cargando producto...</p>;

    return (
        <div className="producto-contenedor">
            {/* Sección de imágenes */}
            <div className="imagenes-seccion">
                <div className="imagen-principal">
                    {imagenPrincipal && <img src={imagenPrincipal} alt={producto.nombre} />}
                </div>
                <div className="imagenes-secundarias">
                    {imagenes
                        .filter(img => img.id_producto === producto.id)
                        .map(img => (
                            <img
                                key={img.id}
                                src={img.url}
                                alt={producto.nombre}
                                onClick={() => setImagenPrincipal(img.url)}
                                className="miniatura"
                            />
                        ))}
                </div>
            </div>

            {/* Sección de información del producto */}
            <div className="producto-info">
                <h2>{producto.nombre}</h2>
                <p><strong>Marca:</strong> {marca ? marca.nombre : 'Desconocida'}</p>
                <p><strong>Precio:</strong> S/ {producto.precio}</p>
                <p>
                    <strong>Cantidad:</strong>
                    <input
                        type="number"
                        min="1"
                        value={cantidad}
                        onChange={(e) => setCantidad(Number(e.target.value))}
                    />
                </p>
                <button className="btn-agregar-carrito" onClick={agregarAlCarrito}>
                    Agregar al carrito
                </button>
                <div className="descripcion">
                    <h3>Descripción</h3>
                    <p>{producto.descripcion || 'No disponible.'}</p>
                </div>
            </div>
        </div>
    );
};

export default Productos;
