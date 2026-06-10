import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Shield, Briefcase, MapPin } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = React.useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handlePortalSwitch = (e, targetRole) => {
    e.preventDefault();
    if (user) {
      if (user.role === targetRole) {
        navigate(`/dashboard-${targetRole.toLowerCase()}`);
      } else {
        logout();
        navigate(`/login/${targetRole.toLowerCase()}`);
      }
    } else {
      navigate(`/login/${targetRole.toLowerCase()}`);
    }
  };

  const getLinkClass = (role) => {
    const currentPath = location.pathname;
    const r = role.toLowerCase();
    const isDashboard = currentPath === `/dashboard-${r}`;
    const isLogin = currentPath === `/login/${r}`;
    const isRegister = currentPath === `/register/${r}`;
    return (isDashboard || isLogin || isRegister) ? "sidebar-link active" : "sidebar-link";
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <MapPin color="var(--accent-color)" size={28} />
        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>EcoSync</span>
      </div>
      
      <div className="sidebar-menu">
        <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', paddingLeft: '1.5rem' }}>
          Platform Navigation
        </h4>
        
        <div onClick={(e) => handlePortalSwitch(e, 'User')} className={getLinkClass('User')} style={{cursor: 'pointer'}}>
          <User size={20} />
          <span>User Portal</span>
        </div>
        
        <div onClick={(e) => handlePortalSwitch(e, 'Admin')} className={getLinkClass('Admin')} style={{cursor: 'pointer'}}>
          <Shield size={20} />
          <span>Admin Portal</span>
        </div>
        
        <div onClick={(e) => handlePortalSwitch(e, 'Sweeper')} className={getLinkClass('Sweeper')} style={{cursor: 'pointer'}}>
          <Briefcase size={20} />
          <span>Sweeper Portal</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
