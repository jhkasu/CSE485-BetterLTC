import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import mockUsers from './mockUsers';
import './SignupForm.css';
import API_BASE from './config';

const SigninForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
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
    if (!emailRegex.test(formData.email)) newErrors.email = 'auth.errors.emailInvalid';
    if (formData.password.length < 8) newErrors.password = 'auth.errors.passwordShort';
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

    setErrors({ auth: 'auth.errors.invalidCredentials' });
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>{t('auth.signInHeading')}</h2>
          {successMessage && <p className="success-message">{t(successMessage)}</p>}
        <form onSubmit={handleSubmit} noValidate>

          <label>{t('common.email')}</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder={t('auth.placeholders.email')}
          />
          {errors.email && <p className="error">{t(errors.email)}</p>}

          <label>{t('common.password')}</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder={t('auth.placeholders.password')}
            />
            <span className="toggle-password" onClick={() => setShowPassword(prev => !prev)}>
              {showPassword ? t('common.hide') : t('common.show')}
            </span>
          </div>
          {errors.password && <p className="error">{t(errors.password)}</p>}
          {errors.auth && <p className="error">{t(errors.auth)}</p>}

          <p className="forgot-password" onClick={() => navigate('/forgot-password')}>
            {t('auth.forgotPassword')}
          </p>

          <button type="submit">{t('nav.signIn')}</button>

          <p className="redirect-signup">
            {t('auth.noAccount')}{' '}
            <span onClick={() => navigate('/signup')}>{t('nav.signUp')}</span>
          </p>

        </form>
      </div>
    </div>
  );
};

export default SigninForm;
