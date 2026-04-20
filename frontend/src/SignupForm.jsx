import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupForm.css';

const API_BASE = 'http://localhost:5184';

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'volunteer',
    orgName: '',
    contactName: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[A-Za-z\s\-']+$/;

    if (!formData.firstName) newErrors.firstName = 'First name is required.';
    else if (!nameRegex.test(formData.firstName)) newErrors.firstName = 'Please use English letters only.';

    if (!formData.lastName) newErrors.lastName = 'Last name is required.';
    else if (!nameRegex.test(formData.lastName)) newErrors.lastName = 'Please use English letters only.';

    if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email address.';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';

    if (formData.role === 'organization') {
      if (!formData.orgName) newErrors.orgName = 'Organization name is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (formData.role === 'volunteer') {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      };
      const res = await fetch(`${API_BASE}/api/volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        navigate('/signin', { state: { success: 'Account created successfully. Please sign in.' } });
      } else {
        setErrors({ submit: 'Sign up failed. Please try again.' });
      }
    } else {
      const payload = {
        orgName: formData.orgName,
        contactName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        isApproved: false,
      };
      const res = await fetch(`${API_BASE}/api/organizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        navigate('/signin', { state: { success: 'Account created successfully. Please sign in.' } });
      } else {
        setErrors({ submit: 'Sign up failed. Please try again.' });
      }
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit} noValidate>

          <div className="role-toggle">
            <button
              type="button"
              className={`role-btn ${formData.role === 'volunteer' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, role: 'volunteer' }))}
            >
              I want to volunteer
            </button>
            <button
              type="button"
              className={`role-btn ${formData.role === 'organization' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, role: 'organization' }))}
            >
              I represent an organization
            </button>
          </div>

          {formData.role === 'organization' && (
            <>
              <label>Organization Name</label>
              <input
                type="text"
                name="orgName"
                value={formData.orgName}
                onChange={handleChange}
                placeholder="Enter your organization name"
              />
              {errors.orgName && <p className="error">{errors.orgName}</p>}
            </>
          )}

          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter your first name"
          />
          {errors.firstName && <p className="error">{errors.firstName}</p>}

          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter your last name"
          />
          {errors.lastName && <p className="error">{errors.lastName}</p>}

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

          <label>Confirm Password</label>
          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Re-enter your password"
            />
            <span className="toggle-password" onClick={() => setShowConfirmPassword(prev => !prev)}>
              {showConfirmPassword ? 'Hide' : 'Show'}
            </span>
          </div>
          {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}

          {errors.submit && <p className="error">{errors.submit}</p>}
          <button type="submit">Sign Up</button>

        </form>
      </div>
    </div>
  );
};

export default SignupForm;
