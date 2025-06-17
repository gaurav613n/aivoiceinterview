import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute: React.FC = () => {
  const { user } = useAuth();

  // For development, allowing access without authentication
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;