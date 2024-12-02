import { Link } from 'react-router-dom'; 
import React, { useState, useEffect } from 'react'; 
import Header from './Header';
import './Inicio.css';

const Inicio = () => {
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [imagenesProductos, setImagenesProductos] = useState([]);

    useEffect(() => {
        // Cargar todas las categorías
        const fetchCategorias = async () => {
            try {
                const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/categoria');
                const data = await response.json();
                setCategorias(data);
            } catch (error) {
                console.error('Error fetching categorías:', error);
            }
        };

        // Cargar todos los productos
        const fetchProductos = async () => {
            try {
                const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/producto');
                const data = await response.json();
                setProductos(data);
            } catch (error) {
                console.error('Error fetching productos:', error);
            }
        };

        // Cargar todas las imágenes de productos
        const fetchImagenesProductos = async () => {
            try {
                const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/imagenesproductos');
                const data = await response.json();
                setImagenesProductos(data);
            } catch (error) {
                console.error('Error fetching imágenes productos:', error);
            }
        };

        fetchCategorias();
        fetchProductos();
        fetchImagenesProductos();
    }, []);

    // Función para obtener la imagen de un producto
    const getProductImage = (productoId) => {
        const imagenProducto = imagenesProductos.find(img => img.id_producto === productoId);
        return imagenProducto ? imagenProducto.url : '../../imagenes/default.jpg';
    };

    // Función para obtener el nombre de la categoría
    const getCategoriaNombre = (categoriaId) => {
        const categoria = categorias.find(cat => cat.id === categoriaId);
        return categoria ? categoria.nombre : 'Categoría';
    };

    // Secciones predefinidas de productos con lógica de filtrado personalizada
    const seccionesPredefinidas = [
        { 
            id: 1, 
            titulo: 'NOVEDADES',
            filtro: (producto) => {
                // Selecciona algunos productos al azar para novedades
                return Math.random() < 0.2; // 20% de probabilidad de ser seleccionado
            }
        },
        { 
            id: 2, 
            titulo: 'CATEGORIAS',
            filtro: (producto) => producto.id_categoria === 2 // Suponiendo que 2 es el ID de la categoría general
        },
        { 
            id: 3, 
            titulo: 'PRODUCTOS A MENOS DE S/.100',
            filtro: (producto) => parseFloat(producto.precio) < 100
        },
        { 
            id: 4, 
            titulo: 'PRODUCTOS MAS VENDIDOS',
            filtro: (producto) => producto.id_categoria === 4 // Suponiendo que 4 es el ID de productos más vendidos
        },
        { 
            id: 5, 
            titulo: 'PRE-VENTAS',
            filtro: (producto) => {
                const categoria = categorias.find(cat => cat.nombre === 'Pre-venta');
                return categoria ? producto.id_categoria === categoria.id : false;
            }
        }
    ];

    return (
        <>


            <div className="banner-section">
                <ul>
                    <li><img src="https://gordo.blob.core.windows.net/componentes/Imagen2.jpg" alt="Banner 1" /></li>
                    <li><img src="https://gordo.blob.core.windows.net/componentes/Imagen4.jpg" alt="Banner 2" /></li>
                </ul>
            </div>

            {seccionesPredefinidas.map((seccion) => (
                <div key={seccion.id} className={`productos-section ${seccion.titulo.toLowerCase().replace(/\s+/g, '-')}`}>
                    <h2>{seccion.titulo}</h2>
                    <ul>
                        {productos
                            .filter(seccion.filtro)
                            .map((producto) => (
                                <li key={producto.id}>
                                    <Link 
                                        to={`/productos/${encodeURIComponent(producto.nombre)}`} 
                                        className="product-link"
                                    >
                                        <div className="product-card">
                                            <img 
                                                src={getProductImage(producto.id)} 
                                                alt={producto.nombre} 
                                            />
                                            <div className="product-details">
                                                <h3>{producto.nombre}</h3>
                                                <p>{producto.descripcion}</p>
                                                <p>Precio: S/. {producto.precio}</p>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            ))}

            {/* Resto del código permanece igual */}
            <div className="ver-mas">
                <button>VER MÁS</button>
                <ul>
                    {['1', '2', '3', '4', '5', '6'].map((num) => (
                        <li key={num}>
                            <img src={`https://gordo.blob.core.windows.net/componentes/video%20${num}.png`} alt={`Video ${num}`} />
                        </li>
                    ))}
                </ul> 
                <ul>
                    {['7', '8', '5', '9', '10', '11'].map((num) => (
                        <li key={num}>
                            <img src={`https://gordo.blob.core.windows.net/componentes/video%20${num}.png`} alt={`Video ${num}`} />
                        </li>
                    ))}
                </ul>
            </div>

            {/* Resto del componente permanece igual */}
            <div className="info">
                <section>
                    <img src="https://gordo.blob.core.windows.net/componentes/Imagen12.jpg" alt="Banner" />
                </section>
                <aside>
                    <h3>Tambien puedes recibir informacion por correo Electronico</h3>
                    <input type="text" placeholder="Ingrese su correo" />
                    <button>Enviar</button>
                </aside>
            </div>

            <div className="ver-mas2">
                <button>VER MÁS</button>
                <ul>
                    {['18', '19', '20'].map((num) => (
                        <li key={num}>
                            <img src={`https://gordo.blob.core.windows.net/componentes/Imagen${num}.jpg`} alt={`Relleno ${num}`} />
                        </li>
                    ))}
                </ul>
            </div>

            <div className="ver-mas3">
                <button>VER MÁS</button>
            </div>

            <div className="pie-pagina">
                <ul>
                    <li>
                        <ol>
                            <li><img src="https://gordo.blob.core.windows.net/componentes/Imagen26.jpg" alt="Location" /></li>
                            <li>Av.La Paz 138, Miraflores - Lima</li>
                            <li>01-4001815 / 966 323 587</li>
                            <li>contacto@toymaster.pe</li>
                        </ol>
                    </li>
                    <li>
                        <ol className="sub1">
                            <li>Sobre Toys Master</li>
                            <li>Programa de recompensa Master Points</li>
                            <li>Acerca de las preventas</li>
                        </ol>
                    </li>
                    <li>
                        <ol className="sub1"> 
                            <li>Libro de Reclamaciones Virtual</li>
                            <li>Términos del Servicio</li>
                            <li>Política de Privacidad de Datos</li>
                            <li>Políticas de Devolución y Reembolso</li>
                            <li>Políticas de Envíos</li>
                        </ol>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default Inicio;