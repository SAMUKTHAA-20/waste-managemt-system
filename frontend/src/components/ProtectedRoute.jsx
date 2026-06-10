import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect if role doesn't match
    if (user.role === 'Admin') return <Navigate to="/dashboard-admin" replace />;
    if (user.role === 'Sweeper') return <Navigate to="/dashboard-sweeper" replace />;
    return <Navigate to="/dashboard-user" replace />;
  }

  return children;
};

export default ProtectedRoute;
