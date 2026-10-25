import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import Footer from './Footer';
import apiFetch from './api';
import usePageTitle from './usePageTitle';
import './SignupForm.css';
import './PasswordReset.css';

function ResetPasswordPage() {
  const { t } = useTranslation();
  usePageTitle(t('reset.resetHeading'));
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token') || '';
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [invalidLink, setInvalidLink] = useState(!token);
  const [saving, setSaving] = useState(false);

  const update = (changes) => {
    setForm(current => ({ ...current, ...changes }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError('auth.errors.passwordShort');
      return;
    }
    if (form.password !== form.confirm) {
      setError('auth.errors.passwordMismatch');
      return;
    }
    setSaving(true);
    apiFetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: form.password }),
    })
      .then(res => {
        if (res.status === 400) {
          setInvalidLink(true);
          return;
        }
        if (!res.ok) throw new Error('failed');
        navigate('/signin', { state: { success: 'reset.done' } });
      })
      .catch(() => setError('common.genericError'))
      .finally(() => setSaving(false));
  };

  return (
    <div>
      <Navbar />
      <div className="signup-container">
        <div className="signup-box">
          <h2>{t('reset.resetHeading')}</h2>
          {invalidLink ? (
            <div role="alert">
              <p className="reset-lead">{t('reset.invalid')}</p>
              <Link className="reset-again" to="/forgot-password">{t('reset.requestNew')}</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <p className="reset-lead">{t('reset.resetLead')}</p>
              <label htmlFor="reset-password">{t('reset.newPassword')}</label>
              <div className="password-wrapper">
                <input
                  id="reset-password"
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  autoComplete="new-password"
                  placeholder={t('auth.placeholders.password')}
                  onChange={e => update({ password: e.target.value })}
                />
                <button type="button" className="toggle-password reset-toggle" onClick={() => setShow(value => !value)}>
                  {show ? t('common.hide') : t('common.show')}
                </button>
              </div>
              <label htmlFor="reset-confirm">{t('auth.confirmPassword')}</label>
              <input
                id="reset-confirm"
                type={show ? 'text' : 'password'}
                value={form.confirm}
                autoComplete="new-password"
                placeholder={t('auth.placeholders.confirmPassword')}
                onChange={e => update({ confirm: e.target.value })}
              />
              {error && <p className="error" role="alert">{t(error)}</p>}
              <button type="submit" disabled={saving}>{t('reset.save')}</button>
            </form>
          )}
          <p className="redirect-signup"><Link to="/signin">{t('reset.backToSignIn')}</Link></p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ResetPasswordPage;
