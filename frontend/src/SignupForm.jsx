import React, { useState } from 'react';
import './SignupForm.css';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'volunteer' // Default role
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Connect to backend API later
    console.log('Submitted Data:', formData);
    alert('Check console for data structure');
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
          />

          <label>Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="volunteer">Volunteer</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit">Sign Up</button>

        </form>
      </div>
    </div>
  );
};

export default SignupForm;