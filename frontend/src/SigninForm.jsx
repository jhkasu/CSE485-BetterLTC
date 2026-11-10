import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const { t, i18n } = useTranslation();
  const successMessage = location.state?.success || null;
  const successEmail = location.state?.email || '';
  const sessionExpired = new URLSearchParams(location.search).get('expired') === '1';
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resent, setResent] = useState(false);

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
    setUnverified(false);
    setResent(false);

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

    if (res.status === 403) {
      setUnverified(true);
      setErrors({ auth: 'auth.errors.emailNotVerified' });
      return;
    }

    if (res.status !== 401) {
      setErrors({ auth: 'common.genericError' });
      return;
    }

    setErrors({ auth: 'auth.errors.invalidCredentials' });
  };

  const resendVerification = async () => {
    try {
      const res = await apiFetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim(), language: i18n.resolvedLanguage || i18n.language || 'en' }),
      });
      if (!res.ok) throw new Error('failed');
      setResent(true);
    } catch {
      setErrors({ auth: 'common.genericError' });
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>{t('auth.signInHeading')}</h2>
          {successMessage && <p className="success-message">{t(successMessage, { email: successEmail })}</p>}
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
          {unverified && (
            resent
              ? <p className="success-message" role="status">{t('auth.verificationSent', { email: formData.email.trim() })}</p>
              : <button type="button" className="resend-verification" onClick={resendVerification}>{t('auth.resendVerification')}</button>
          )}

          <p className="forgot-password">
            <Link to="/forgot-password">{t('auth.forgotPassword')}</Link>
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
