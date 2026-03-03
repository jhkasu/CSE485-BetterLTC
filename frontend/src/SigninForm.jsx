import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupForm.css';

const SigninForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email))
      newErrors.email = 'Please enter a valid email address.';
    if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: Connect to backend API later
    console.log('Submitted Data:', formData);
    alert('Check console for data structure');
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Sign In</h2>
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
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
          />
          {errors.password && <p className="error">{errors.password}</p>}

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
