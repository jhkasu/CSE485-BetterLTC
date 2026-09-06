import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import mockUsers from './mockUsers';
import './SignupForm.css';

const API_BASE = 'http://localhost:5184';

const SigninForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.success || null;
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email address.';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const adminUser = mockUsers.find(u => u.email === formData.email && u.password === formData.password && u.role === 'admin');
    if (adminUser) {
      const { password, ...safeUser } = adminUser;
      localStorage.setItem('currentUser', JSON.stringify(safeUser));
      navigate('/admin');
      return;
    }

    const body = JSON.stringify({ email: formData.email, password: formData.password });
    const headers = { 'Content-Type': 'application/json' };

    const volunteerRes = await fetch(`${API_BASE}/api/volunteers/signin`, { method: 'POST', headers, body });
    if (volunteerRes.ok) {
      const volunteer = await volunteerRes.json();
      localStorage.setItem('currentUser', JSON.stringify({ ...volunteer, role: 'volunteer' }));
      navigate('/dashboard');
      return;
    }

    const orgRes = await fetch(`${API_BASE}/api/organizations/signin`, { method: 'POST', headers, body });
    if (orgRes.ok) {
      const org = await orgRes.json();
      localStorage.setItem('currentUser', JSON.stringify({ ...org, role: 'organization', orgName: org.orgName }));
      navigate('/org-dashboard');
      return;
    }

    setErrors({ auth: 'Invalid email or password.' });
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Sign In</h2>
          {successMessage && <p className="success-message">{successMessage}</p>}
        <form onSubmit={handleSubmit} noValidate>

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
          {errors.email && <p className="error">{errors.email}</p>}

          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
            <span className="toggle-password" onClick={() => setShowPassword(prev => !prev)}>
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>
          {errors.password && <p className="error">{errors.password}</p>}
          {errors.auth && <p className="error">{errors.auth}</p>}

          <p className="forgot-password" onClick={() => navigate('/forgot-password')}>
            Forgot Password?
          </p>

          <button type="submit">Sign In</button>

          <p className="redirect-signup">
            Don't have an account?{' '}
            <span onClick={() => navigate('/signup')}>Sign Up</span>
          </p>

        </form>
      </div>
    </div>
  );
};

export default SigninForm;
