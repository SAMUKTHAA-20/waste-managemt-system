import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardUser from './pages/DashboardUser';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardSweeper from './pages/DashboardSweeper';
import ProtectedRoute from './components/ProtectedRoute';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="main-container">
          <Routes>
            <Route path="/" element={<Navigate to="/login/user" />} />
            <Route path="/login" element={<Navigate to="/login/user" />} />
            <Route path="/login/:roleType" element={<Login />} />
            <Route path="/register/:roleType" element={<Register />} />
            <Route path="/register" element={<Navigate to="/register/user" />} />
            
            {/* Exposed endpoints tightly secured to assigned roles */}
            <Route path="/dashboard-user" element={<ProtectedRoute roles={['User']}><DashboardUser /></ProtectedRoute>} />
            <Route path="/dashboard-admin" element={<ProtectedRoute roles={['Admin']}><DashboardAdmin /></ProtectedRoute>} />
            <Route path="/dashboard-sweeper" element={<ProtectedRoute roles={['Sweeper']}><DashboardSweeper /></ProtectedRoute>} />
            <Route path="/dashboard" element={<Navigate to="/dashboard-admin" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
