import React, { useState, useEffect } from 'react';
import './imagenes.css';

const GestionImagenesProductos = () => {
  const [imagenes, setImagenes] = useState([]);
  const [imagenActual, setImagenActual] = useState({
    id_producto: '',
    url: ''
  });
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [error, setError] = useState(null);

  const URL_API = 'https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/imagenesproductos';

  useEffect(() => {
    obtenerImagenes();
  }, []);

  const obtenerImagenes = async () => {
    try {
      const respuesta = await fetch(URL_API);
      const datos = await respuesta.json();
      
      // Ordenar las imágenes por id_producto
      const imagenesOrdenadas = datos.sort((a, b) => a.id_producto - b.id_producto);
      
      setImagenes(imagenesOrdenadas);
    } catch (error) {
      setError('Error al obtener imágenes');
    }
  };

  const manejarCambioInput = (e) => {
    const { name, value } = e.target;
    setImagenActual({ ...imagenActual, [name]: value });
  };

  const abrirModalAgregar = () => {
    setImagenActual({ id_producto: '', url: '' });
    setModoEdicion(false);
    setModalAbierto(true);
  };

  const abrirModalEditar = (imagen) => {
    setImagenActual(imagen);
    setModoEdicion(true);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
  };

  const agregarImagen = async () => {
    try {
      // Obtener el ID máximo existente
      const maxId = imagenes.length > 0 
        ? Math.max(...imagenes.map(img => img.id)) 
        : 0;
      
      const nuevaImagen = {
        ...imagenActual,
        id: maxId + 1
      };

      const respuesta = await fetch(URL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaImagen)
      });

      if (!respuesta.ok) throw new Error('Error en la respuesta de red');
      
      obtenerImagenes();
      cerrarModal();
    } catch (error) {
      console.error('Error al crear imagen:', error);
      setError('No se pudo crear la imagen');
    }
  };

  const actualizarImagen = async () => {
    try {
      const respuesta = await fetch(URL_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(imagenActual)
      });

      if (!respuesta.ok) throw new Error('Error en la respuesta de red');

      // Actualizar la imagen en el estado sin alterar el orden
      setImagenes(imagenes.map(img => 
        img.id === imagenActual.id ? imagenActual : img
      ));

      cerrarModal();
    } catch (error) {
      console.error('Error al actualizar imagen:', error);
      setError('No se pudo actualizar la imagen');
    }
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    if (modoEdicion) {
      await actualizarImagen();
    } else {
      await agregarImagen();
    }
  };

  const eliminarImagen = async (id) => {
    try {
      const respuesta = await fetch(`${URL_API}/${id}`, {
        method: 'DELETE'
      });
      if (respuesta.ok) {
        obtenerImagenes();
      }
    } catch (error) {
      setError('Error al eliminar imagen');
    }
  };

  return (
    <div className="contenedor-gestion">
      <h1>Gestión de Imágenes de Productos</h1>
      
      <button onClick={abrirModalAgregar}>Agregar Nueva Imagen</button>

      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={cerrarModal}>×</button>
            <form onSubmit={enviarFormulario}>
              <h2>{modoEdicion ? 'Editar Imagen' : 'Agregar Imagen'}</h2>
              <input
                type="number"
                name="id_producto"
                placeholder="ID Producto"
                value={imagenActual.id_producto}
                onChange={manejarCambioInput}
                required
              />
              <input
                type="text"
                name="url"
                placeholder="URL de la Imagen"
                value={imagenActual.url}
                onChange={manejarCambioInput}
                required
              />
              <button type="submit">
                {modoEdicion ? 'Actualizar' : 'Agregar'}
              </button>
            </form>
          </div>
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>ID Producto</th>
            <th>Imagen</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {imagenes.map((imagen) => (
            <tr key={imagen.id}>
              <td>{imagen.id}</td>
              <td>{imagen.id_producto}</td>
              <td>
                <img 
                  src={imagen.url} 
                  alt={`Imagen de producto ${imagen.id_producto}`} 
                />
              </td>
              <td>
                <button onClick={() => abrirModalEditar(imagen)}>Editar</button>
                <button onClick={() => eliminarImagen(imagen.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default GestionImagenesProductos;
