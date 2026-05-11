import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axios.post('http://localhost:5001/api/auth/register', formData);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Back
        </button>
        <div className="auth-header">
          <Crown size={32} className="auth-logo" />
          <h2>Create Account</h2>
          <p>Join us to start planning your perfect wedding.</p>
        </div>
        {error && <div style={{ color: 'red', marginBottom: '16px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}
        <form className="auth-form" onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="John & Jane" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required 
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required 
            />
          </div>
          <button type="submit" className="auth-submit-btn">Register</button>
        </form>
        <div className="auth-footer">
          Already have an account? <span onClick={() => navigate('/login')}>Login</span>
        </div>
      </div>
    </div>
  );
}
