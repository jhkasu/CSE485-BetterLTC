import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './SignupForm.css';
import apiFetch from './api';
import { setSession } from './auth/session';

const HOME_BY_ROLE = {
  admin: '/admin',
  volunteer: '/dashboard',
  organization: '/org-dashboard',
};

const SigninForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const successMessage = location.state?.success || null;
  const sessionExpired = new URLSearchParams(location.search).get('expired') === '1';
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
    if (!emailRegex.test(formData.email.trim())) newErrors.email = 'auth.errors.emailInvalid';
    if (formData.password.length < 8) newErrors.password = 'auth.errors.passwordShort';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    let res;
    try {
      res = await apiFetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim(), password: formData.password }),
      });
    } catch {
      setErrors({ auth: 'common.serverUnreachable' });
      return;
    }

    if (res.ok) {
      const { token, user } = await res.json();
      setSession(token, user);
      navigate(HOME_BY_ROLE[user.role] || '/');
      return;
    }

    if (res.status !== 401) {
      setErrors({ auth: 'common.genericError' });
      return;
    }

    setErrors({ auth: 'auth.errors.invalidCredentials' });
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>{t('auth.signInHeading')}</h2>
          {successMessage && <p className="success-message">{t(successMessage)}</p>}
          {sessionExpired && !successMessage && <p className="error" role="status">{t('auth.sessionExpired')}</p>}
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
