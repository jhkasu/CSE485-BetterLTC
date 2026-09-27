import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './SignupForm.css';
import apiFetch from './api';

const SERVER_ERROR_KEYS = {
  'Volunteer with this email already exists.': 'auth.errors.volunteerEmailExists',
  'Organization with this email already exists.': 'auth.errors.orgEmailExists',
};

const toSubmitError = (message) => {
  const trimmed = (message || '').trim();
  if (SERVER_ERROR_KEYS[trimmed]) return { key: SERVER_ERROR_KEYS[trimmed] };
  if (trimmed) return { text: message };
  return { key: 'auth.errors.signUpFailed' };
};

const SignupForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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

    if (!formData.firstName) newErrors.firstName = 'auth.errors.firstNameRequired';
    else if (!nameRegex.test(formData.firstName)) newErrors.firstName = 'auth.errors.lettersOnly';

    if (!formData.lastName) newErrors.lastName = 'auth.errors.lastNameRequired';
    else if (!nameRegex.test(formData.lastName)) newErrors.lastName = 'auth.errors.lettersOnly';

    if (!emailRegex.test(formData.email)) newErrors.email = 'auth.errors.emailInvalid';
    if (formData.password.length < 8) newErrors.password = 'auth.errors.passwordShort';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'auth.errors.passwordMismatch';

    if (formData.role === 'organization') {
      if (!formData.orgName) newErrors.orgName = 'auth.errors.orgNameRequired';
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
      try {
        const res = await apiFetch(`/api/volunteers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          navigate('/signin', { state: { success: 'auth.accountCreated' } });
        } else {
          const message = await res.text();
          setErrors({ submit: toSubmitError(message) });
        }
      } catch (err) {
        setErrors({ submit: { key: 'common.serverUnreachable' } });
      }
    } else {
      const payload = {
        orgName: formData.orgName,
        contactName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        isApproved: false,
      };
      try {
        const res = await apiFetch(`/api/organizations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          navigate('/signin', { state: { success: 'auth.accountCreated' } });
        } else {
          const message = await res.text();
          setErrors({ submit: toSubmitError(message) });
        }
      } catch (err) {
        setErrors({ submit: { key: 'common.serverUnreachable' } });
      }
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>{t('auth.createAccount')}</h2>
        <form onSubmit={handleSubmit} noValidate>

          <div className="role-toggle">
            <button
              type="button"
              className={`role-btn ${formData.role === 'volunteer' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, role: 'volunteer' }))}
            >
              {t('auth.roleVolunteer')}
            </button>
            <button
              type="button"
              className={`role-btn ${formData.role === 'organization' ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, role: 'organization' }))}
            >
              {t('auth.roleOrganization')}
            </button>
          </div>

          {formData.role === 'organization' && (
            <>
              <label>{t('auth.orgName')}</label>
              <input
                type="text"
                name="orgName"
                value={formData.orgName}
                onChange={handleChange}
                placeholder={t('auth.placeholders.orgName')}
              />
              {errors.orgName && <p className="error">{t(errors.orgName)}</p>}
            </>
          )}

          <label>{t('common.firstName')}</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder={t('auth.placeholders.firstName')}
          />
          {errors.firstName && <p className="error">{t(errors.firstName)}</p>}

          <label>{t('common.lastName')}</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder={t('auth.placeholders.lastName')}
          />
          {errors.lastName && <p className="error">{t(errors.lastName)}</p>}

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

          <label>{t('auth.confirmPassword')}</label>
          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder={t('auth.placeholders.confirmPassword')}
            />
            <span className="toggle-password" onClick={() => setShowConfirmPassword(prev => !prev)}>
              {showConfirmPassword ? t('common.hide') : t('common.show')}
            </span>
          </div>
          {errors.confirmPassword && <p className="error">{t(errors.confirmPassword)}</p>}

          {errors.submit && <p className="error">{errors.submit.key ? t(errors.submit.key) : errors.submit.text}</p>}
          <button type="submit">{t('nav.signUp')}</button>

        </form>
      </div>
    </div>
  );
};

export default SignupForm;
