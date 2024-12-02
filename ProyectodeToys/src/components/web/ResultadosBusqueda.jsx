import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './resultados.css';
const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [productImages, setProductImages] = useState({});
  const [loading, setLoading] = useState(false);

  // Obtener la consulta de búsqueda desde el estado de navegación
  const searchQuery = location.state?.searchQuery || '';

  // Cargar productos y filtrar
  useEffect(() => {
    const fetchProductsAndFilter = async () => {
      // Si no hay consulta de búsqueda, redirigir a inicio
      if (!searchQuery) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        // Obtener todos los productos
        const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/producto');
        if (!response.ok) throw new Error('Error al obtener los productos');
        
        const allProducts = await response.json();
        
        // Filtrar productos por nombre
        const filteredProducts = allProducts.filter((product) =>
          product.nombre.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setProducts(filteredProducts);

        // Obtener imágenes para los productos filtrados
        const images = {};
        for (const product of filteredProducts) {
          try {
            const imageResponse = await fetch(
              `https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/imagenesproductos/${product.id}`
            );
            if (!imageResponse.ok) throw new Error('Error al obtener las imágenes del producto');
            const imageData = await imageResponse.json();
            images[product.id] = imageData[0]?.url || 'https://via.placeholder.com/150';
          } catch (error) {
            console.error(`Error al obtener la imagen del producto ${product.id}:`, error);
            images[product.id] = 'https://via.placeholder.com/150';
          }
        }
        setProductImages(images);
      } catch (error) {
        console.error('Error al buscar productos:', error);
      } finally {
        setLoading(false);
      }
    };

    // Solo fetch si hay una consulta de búsqueda
    if (searchQuery) {
      fetchProductsAndFilter();
    }
  }, [searchQuery, navigate]);

  // Manejar selección de producto
  const handleProductSelect = (product) => {
    navigate(`/productos/${encodeURIComponent(product.nombre)}`);
  };

  // Si no hay consulta de búsqueda, no renderizar nada
  if (!searchQuery) {
    return null;
  }

  if (loading) {
    return (
      <div className="search-results-loading">
        Cargando resultados...
      </div>
    );
  }

  return (
    <div className="search-results-container">
      <div className="search-results-header">
        <h1>Resultados de búsqueda</h1>
        <p>"{searchQuery}" - {products.length} resultado{products.length !== 1 ? 's' : ''}</p>
      </div>

      {products.length === 0 ? (
        <div className="search-results-empty">
          <p>No se encontraron resultados para "{searchQuery}".</p>
          <p>Intenta buscar con otros términos.</p>
        </div>
      ) : (
        <div className="search-results-grid">
          {products.map((product) => (
            <div
              key={product.id}
              className="search-result-card"
              onClick={() => handleProductSelect(product)}
            >
              <div className="search-result-image-container">
                <img
                  src={productImages[product.id]}
                  alt={product.nombre}
                  className="search-result-image"
                />
              </div>
              <div className="search-result-info">
                <h3 className="search-result-name">{product.nombre}</h3>
                <p className="search-result-price">S/ {product.precio.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;