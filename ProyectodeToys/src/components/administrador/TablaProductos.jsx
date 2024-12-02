import React, { useState, useEffect } from 'react';
import './ProductoTabla.css';

const ProductoComponent = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [currentProducto, setCurrentProducto] = useState({
        id: null,
        nombre: '',
        descripcion: '',
        precio: '',
        id_categoria: '',
        id_marca: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    

    // Fetch all products
    const findAll = async () => {
        try {
            const [productosResponse, categoriasResponse, marcasResponse] = await Promise.all([
                fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/producto'),
                fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/categoria'),
                fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/marca'),
            ]);

            if (!productosResponse.ok || !categoriasResponse.ok || !marcasResponse.ok)
                throw new Error('Failed to fetch data');

            const [productosData, categoriasData, marcasData] = await Promise.all([
                productosResponse.json(),
                categoriasResponse.json(),
                marcasResponse.json(),
            ]);

            setProductos(productosData.sort((a, b) => a.id - b.id)); // Mantener orden por ID
            setCategorias(categoriasData);
            setMarcas(marcasData);
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data');
        }
    };

    // Create a new product
    const create = async () => {
        try {
            const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/producto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentProducto),
            });
    
            if (!response.ok) throw new Error('Failed to create product');
    
            // Recargar datos después de crear
            findAll();
            
            // Resetear el formulario
            resetForm();
            
            // Cerrar el modal
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product');
        }
    };

    // Update an existing product
    const update = async () => {
        try {
            const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/producto', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentProducto),
            });

            if (!response.ok) throw new Error('Failed to update product');

            setProductos(productos.map(p => (p.id === currentProducto.id ? currentProducto : p)));
            resetForm();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Failed to update product');
        }
    };

    // Remove a product
    const remove = async (id) => {
        try {
            const response = await fetch(`https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/producto/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete product');

            setProductos(productos.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    // Reset form to initial state
    const resetForm = () => {
        setCurrentProducto({
            id: null,
            nombre: '',
            descripcion: '',
            precio: '',
            id_categoria: '',
            id_marca: '',
        });
        setIsEditing(false);
    };

    // Open modal for adding/editing product
    const openModal = (producto = null) => {
        if (producto) {
            setCurrentProducto(producto);
            setIsEditing(true);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentProducto((prev) => ({ ...prev, [name]: value }));
    };

    // Load products on component mount
    useEffect(() => {
        findAll();
    }, []);

    // Get category name
    const getCategoryName = (id_categoria) => {
        const categoria = categorias.find(cat => cat.id === Number(id_categoria));
        return categoria ? categoria.nombre : 'N/A';
    };

    // Get brand name
    const getMarcaName = (id_marca) => {
        const marca = marcas.find(marc => marc.id === Number(id_marca));
        return marca ? marca.nombre : 'N/A';
    };
    return (
        <div className="producto-container">
          <div className="producto-header">
    <h1>Productos</h1>
    <button onClick={() => openModal()} className="btn-add">
        Agregar Nuevo Producto
    </button>

</div>

<div className="search-bar">
    <input
        type="text"
        placeholder="Buscar producto por nombre"
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-input"
    />
</div>



<table className="producto-table">
    <thead>
        <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Categoría</th>
            <th>Marca</th>
            <th>Acciones</th>
        </tr>
    </thead>
    <tbody>
        {productos
            .filter((producto) =>
                producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((producto) => (
                <tr key={producto.id}>
                    <td>{producto.id}</td>
                    <td>{producto.nombre}</td>
                    <td>{producto.descripcion}</td>
                    <td>${producto.precio}</td>
                    <td>{getCategoryName(producto.id_categoria)}</td>
                    <td>{getMarcaName(producto.id_marca)}</td>
                    <td>
                        <div className="action-buttons">
                            <button
                                onClick={() => openModal(producto)}
                                className="btn-edit"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => remove(producto.id)}
                                className="btn-delete"
                            >
                                Eliminar
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
                        <h2>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                isEditing ? update() : create();
                            }}
                        >
                            <div className="form-group">
                                <label htmlFor="nombre">Nombre</label>
                                <input
                                    id="nombre"
                                    name="nombre"
                                    value={currentProducto.nombre}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="descripcion">Descripción</label>
                                <input
                                    id="descripcion"
                                    name="descripcion"
                                    value={currentProducto.descripcion}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="precio">Precio</label>
                                <input
                                    id="precio"
                                    name="precio"
                                    type="number"
                                    value={currentProducto.precio}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="id_categoria">Categoría</label>
                                <select
                                    id="id_categoria"
                                    name="id_categoria"
                                    value={currentProducto.id_categoria}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione Categoría</option>
                                    {categorias.map((categoria) => (
                                        <option key={categoria.id} value={categoria.id}>
                                            {categoria.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="id_marca">Marca</label>
                                <select
                                    id="id_marca"
                                    name="id_marca"
                                    value={currentProducto.id_marca}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione Marca</option>
                                    {marcas.map((marca) => (
                                        <option key={marca.id} value={marca.id}>
                                            {marca.nombre}
                                        </option>
                                    ))}
                                </select>
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
                                    {isEditing ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductoComponent;