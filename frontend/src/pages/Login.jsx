import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

const Login = () => {
  const { roleType } = useParams();
  const displayRole = roleType ? roleType.charAt(0).toUpperCase() + roleType.slice(1) : 'User';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Direct API hit to intercept before setting global context
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      // Enforce the specific portal constraints
      if (data.role !== displayRole) {
        alert(`Access Denied! You are trying to login to the ${displayRole} portal with a ${data.role} account.`);
        return;
      }
      
      // If it matches, login properly
      localStorage.setItem('userInfo', JSON.stringify(data));
      window.location.href = `/dashboard-${data.role.toLowerCase()}`;
    } catch (err) {
      alert('Invalid Credentials');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--primary-color)' }}>{displayRole} Portal Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="admin@ecosync.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>Login securely</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          Don't have an account? <Link to={`/register/${roleType || 'user'}`} style={{ fontWeight: 600 }}>Create {displayRole} Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
