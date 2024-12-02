// PrivateRoute.js
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
    const { user } = useAuth();  // Obtén el usuario del contexto

    if (!user) {
        return <Navigate to="/login" />;
    }

    // Si se requiere un rol específico y el usuario no lo tiene
    if (requiredRole && user.rol !== requiredRole) {
        return <Navigate to="/" />;  // Redirige si no tiene el rol necesario
    }

    return children;  // Si tiene el rol adecuado, renderiza el contenido
};

export default PrivateRoute;
