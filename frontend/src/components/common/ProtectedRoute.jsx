import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-height-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
