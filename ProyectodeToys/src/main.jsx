import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './AuthContext.jsx'; // Importa el proveedor del contexto

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App /> {/* Aquí envolvemos nuestra aplicación en el AuthProvider */}
  </AuthProvider>
);

