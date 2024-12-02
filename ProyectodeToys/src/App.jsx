import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext'; // Importa el AuthProvider
import Header from './components/web/Header.jsx';
import Inicio from './components/web/Inicio.jsx';
import Sesion from './sesion.jsx';
import CrearCuenta from './crear.jsx';
import Categorias from './components/web/Categorias.jsx';
import ProductosCategoria from './components/web/ProductosCategoria.jsx';
import Productos from './components/web/Productos.jsx';
import PrivateRoute from './PrivateRoute.jsx';
import Layout from './components/administrador/Layout.jsx';
import Usuarios from './components/administrador/TablaUsuarios.jsx';
import ProductoComponent from './components/administrador/TablaProductos.jsx';
import CarritoComponent from './components/administrador/TablaCarritos.jsx';
import PedidoComponent from './components/administrador/TablaPedidos.jsx';
import CompraComponent from './components/administrador/TablaCompras.jsx';
import CarritoItemsComponent from './components/administrador/TablaItemCarrito.jsx';
import GestionImagenesProductos from './components/administrador/TablaImagenes.jsx';
import UserProfile from './components/web/Perfil.jsx';
import PurchaseHistory from './components/web/Historial.jsx';
import OrderHistory from './components/web/Pedidos.jsx';
import EditarPerfil from './components/web/EditarPerfil.jsx';
import SearchResults from './components/web/ResultadosBusqueda.jsx';
import FormularioPago from './components/web/FormularioPago.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const [showSearchModal, setShowSearchModal] = useState(false); // Maneja el estado del modal de búsqueda
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {/* Pasa tanto el estado como la función setShowSearchModal al componente Header */}
      {!isAdminRoute && <Header showSearchModal={showSearchModal} setShowSearchModal={setShowSearchModal} />}

      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Sesion />} />
        <Route path="/crear-cuenta" element={<CrearCuenta />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/categorias/:nombreCategoria" element={<ProductosCategoria />} />
        <Route path="/productos/:nombreProducto" element={<Productos />} />
        <Route path="/resultados" element={<SearchResults />} />

        {/* Rutas privadas (usuarios logueados) */}
        <Route path="/perfil" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
        <Route path="/historial" element={<PrivateRoute><PurchaseHistory /></PrivateRoute>} />
        <Route path="/pedidos" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
        <Route path="/editar-perfil" element={<PrivateRoute><EditarPerfil /></PrivateRoute>} />
        <Route path="/pago" element={<PrivateRoute><FormularioPago /></PrivateRoute>} />

        {/* Rutas de administrador */}
        <Route path="/admin" element={<PrivateRoute requiredRole="admin"><Layout /></PrivateRoute>}>
          <Route index element={<Usuarios />} />
          <Route path="/admin/usuarios" element={<Usuarios />} />
          <Route path="/admin/productos" element={<ProductoComponent />} />
          <Route path="/admin/carritos" element={<CarritoComponent />} />
          <Route path="/admin/pedidos" element={<PedidoComponent />} />
          <Route path="/admin/compras" element={<CompraComponent />} />
          <Route path="/admin/itemcarrito/:id" element={<CarritoItemsComponent />} />
          <Route path="/admin/imagenes" element={<GestionImagenesProductos />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;

