import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import DashboardUser from './DashboardUser';
import DashboardAdmin from './DashboardAdmin';
import DashboardSweeper from './DashboardSweeper';
import { Navigate } from 'react-router-dom';

const UnifiedDashboard = () => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'Admin') return <DashboardAdmin />;
  if (user.role === 'Sweeper') return <DashboardSweeper />;
  
  return <DashboardUser />;
};

export default UnifiedDashboard;
