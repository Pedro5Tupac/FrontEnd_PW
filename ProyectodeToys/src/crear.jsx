import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/web/Header';
import './crear.css';
const CrearCuenta = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Fetch existing users to help with ID generation
  const fetchUsers = async () => {
    try {
      const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/usuario');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Validate email existence
  const validateEmail = async () => {
  try {
    // Trim the email and convert to lowercase for consistent comparison
    const trimmedEmail = email.trim().toLowerCase();

    // Fetch all existing users to check email uniqueness
    const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/usuario');
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const usuarios = await response.json();

    // Check if the email already exists (case-insensitive)
    const emailExists = usuarios.some(
      usuario => usuario.email.trim().toLowerCase() === trimmedEmail
    );

    return emailExists;
  } catch (err) {
    console.error('Error validating email:', err);
    setError('Error al verificar el correo electrónico');
    return true; // Treat as existing to prevent account creation
  }
};
  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);


// Modify handleSubmit to use this validation
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  // Validate email before proceeding
  const emailExists = await validateEmail();
  if (emailExists) {
    setError('El correo electrónico ya está registrado');
    return;
  }

    try {
      
      // Create the new user
      const newUsuario = {
       
        nombre,
        apellido,
        email,
        password,
        rol: 'cliente' // Fixed role as requested
      };

      const response = await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUsuario)
      });

      if (response.ok) {
        setShowModal(true);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al crear la cuenta');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/login');
  };
  const handleVolver = () => {
    navigate('/login');
  };

  return (
    <div className="header">
    
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Crear Cuenta</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Apellido:</label>
          <input
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Correo Electrónico:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
        <div className="flex items-center justify-center">
          <button 
            type="submit" 
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Crear Cuenta
          </button>
          <button 
              className="editarperfil" 
              onClick={handleVolver}
            >
              Iniciar Sesion
          </button>
          
        </div>
      </form>

      {/* Modal de Confirmación */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h3 className="text-xl font-bold mb-4">Cuenta Creada</h3>
            <p className="mb-4">Tu cuenta ha sido creada exitosamente.</p>
            <button 
              onClick={handleModalClose}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default CrearCuenta;