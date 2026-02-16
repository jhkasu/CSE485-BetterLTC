import React, { useState } from 'react';

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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Email Input */}
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </label>

        {/* Password Input */}
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </label>

        {/* Task #10: Role Selection Dropdown */}
        <label>
          Role:
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="volunteer">Volunteer</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <button type="submit" style={{ padding: '10px', background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Sign Up
        </button>

      </form>
    </div>
  );
};

export default SignupForm;