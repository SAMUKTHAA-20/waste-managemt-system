import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { MapPin, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="brand">
          <MapPin color="var(--accent-color)" size={28} />
          EcoSync Manager
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/dashboard" style={{ fontWeight: 500 }}>Dashboard</Link>
              <span style={{ fontWeight: 500, borderLeft: '1px solid #ccc', paddingLeft: '1.5rem' }}>{user.name} ({user.role})</span>
              <button className="btn btn-primary" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn" style={{ fontWeight: 600 }}>Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
