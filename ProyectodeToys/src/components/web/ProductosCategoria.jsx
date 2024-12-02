import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom'; 
import './ProductosCategoria.css';

import Header from './Header.jsx';

const ProductosCategoria = () => {
    const { nombreCategoria } = useParams(); // Captura el parámetro de la URL
    const [categorias, setCategorias] = useState([]);
    const [productos, setProductos] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [imagenes, setImagenes] = useState([]); // Estado para imágenes
    const [showSearchModal, setShowSearchModal] = useState(false);

    // Cargar las categorías
    const cargarCategorias = async () => {
        try {
            const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/categoria');
            if (!response.ok) {
                throw new Error('Error al cargar las categorías: ' + response.status);
            }
            const data = await response.json();
            setCategorias(data);
        } catch (error) {
            console.error('Error en la solicitud de categorías:', error);
        }
    };

    // Cargar las marcas
    const cargarMarcas = async () => {
        try {
            const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/marca');
            if (!response.ok) {
                throw new Error('Error al cargar las marcas: ' + response.status);
            }
            const data = await response.json();
            setMarcas(data);
        } catch (error) {
            console.error('Error en la solicitud de marcas:', error);
        }
    };

    // Cargar las imágenes
    const cargarImagenes = async () => {
        try {
            const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/imagenesproductos');
            if (!response.ok) {
                throw new Error('Error al cargar las imágenes: ' + response.status);
            }
            const data = await response.json();
            setImagenes(data);
        } catch (error) {
            console.error('Error en la solicitud de imágenes:', error);
        }
    };

    // Cargar los productos filtrados por categoría
    const cargarProductos = async () => {
        try {
            const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/producto');
            if (!response.ok) {
                throw new Error('Error al cargar los productos: ' + response.status);
            }
            const data = await response.json();

            // Buscar el id de la categoría correspondiente
            const categoriaSeleccionada = categorias.find(
                (categoria) => categoria.nombre.toLowerCase() === nombreCategoria.toLowerCase()
            );

            if (categoriaSeleccionada) {
                const productosFiltrados = data.filter(
                    (producto) => producto.id_categoria === categoriaSeleccionada.id
                );
                setProductos(productosFiltrados);
            } else {
                setProductos([]); // Si no se encuentra la categoría, no hay productos
            }
        } catch (error) {
            console.error('Error al cargar los productos:', error);
        }
    };

    // Cargar datos al inicio
    useEffect(() => {
        cargarCategorias();
        cargarMarcas();
        cargarImagenes();
        
    }, []);

    // Cargar productos cuando las categorías estén disponibles y el nombre de la categoría cambie
    useEffect(() => {
        if (categorias.length > 0 && nombreCategoria) {
            cargarProductos();
        }
    }, [categorias, nombreCategoria]);

    return (
        <>

            <div style={{ padding: '20px' }}>
                <h2>{nombreCategoria}</h2>
                <div className="productos-grid">
                    {productos.length > 0 ? (
                        productos.map((producto, index) => {
                            const marca = marcas.find((m) => m.id === producto.id_marca); // Encuentra la marca
                            const primeraImagen = imagenes.find((img) => img.id_producto === producto.id); // Encuentra la primera imagen
                            console.log(imagenes);
                            return (
                                <a href={`/productos/${encodeURIComponent(producto.nombre)}`} key={producto.id}>
                                    <div className="producto-item">
                                        <img
                                            src={primeraImagen ? primeraImagen.url : 'https://path-to-default-image.com/imagen_default.jpg'} // Usar URL completa para las imágenes
                                            alt={producto.nombre}
                                            className="producto-imagen"
                                        />
                                        <h3>{producto.nombre}</h3>
                                        <p>Marca: {marca ? marca.nombre : 'Desconocida'}</p>
                                        <p>Precio: S/. {producto.precio}</p>
                                    </div>
                                </a>
                            );
                        })
                    ) : (
                        <p>No hay productos en esta categoría.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProductosCategoria;
