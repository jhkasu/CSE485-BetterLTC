import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import Footer from './Footer';
import apiFetch from './api';
import usePageTitle from './usePageTitle';
import './SignupForm.css';
import './PasswordReset.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPasswordPage() {
  const { t, i18n } = useTranslation();
  usePageTitle(t('reset.forgotHeading'));
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('auth.errors.emailInvalid');
      return;
    }
    setStatus('sending');
    apiFetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), language: i18n.resolvedLanguage || i18n.language || 'en' }),
    })
      .then(res => {
        if (!res.ok) throw new Error('failed');
        setStatus('sent');
      })
      .catch(() => {
        setStatus(null);
        setError('common.genericError');
      });
  };

  return (
    <div>
      <Navbar />
      <div className="signup-container">
        <div className="signup-box">
          <h2>{t('reset.forgotHeading')}</h2>
          {status === 'sent' ? (
            <div role="status">
              <p className="success-message">{t('reset.sent', { email: email.trim() })}</p>
              <p className="reset-note">{t('reset.sentNote')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <p className="reset-lead">{t('reset.forgotLead')}</p>
              <label htmlFor="forgot-email">{t('common.email')}</label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                autoComplete="email"
                placeholder={t('auth.placeholders.email')}
                onChange={e => { setEmail(e.target.value); setError(''); }}
              />
              {error && <p className="error" role="alert">{t(error)}</p>}
              <button type="submit" disabled={status === 'sending'}>{t('reset.sendLink')}</button>
            </form>
          )}
          <p className="redirect-signup"><Link to="/signin">{t('reset.backToSignIn')}</Link></p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ForgotPasswordPage;
