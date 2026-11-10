import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import Footer from './Footer';
import apiFetch from './api';
import usePageTitle from './usePageTitle';
import './SignupForm.css';
import './PasswordReset.css';

function VerifyEmailPage() {
  const { t } = useTranslation();
  usePageTitle(t('verify.heading'));
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token') || '';
  const [status, setStatus] = useState(token ? 'checking' : 'invalid');
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    apiFetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => {
        if (res.ok) setStatus('done');
        else if (res.status === 400) setStatus('invalid');
        else setStatus('error');
      })
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div>
      <Navbar />
      <div className="signup-container">
        <div className="signup-box">
          <h2>{t('verify.heading')}</h2>
          {status === 'checking' && <p className="reset-lead" role="status">{t('verify.checking')}</p>}
          {status === 'done' && (
            <div role="status">
              <p className="success-message">{t('verify.done')}</p>
              <Link className="reset-again" to="/signin">{t('nav.signIn')}</Link>
            </div>
          )}
          {status === 'invalid' && (
            <div role="alert">
              <p className="reset-lead">{t('verify.invalid')}</p>
              <p className="reset-note">{t('verify.invalidNote')}</p>
            </div>
          )}
          {status === 'error' && <p className="error" role="alert">{t('common.genericError')}</p>}
          {status !== 'done' && <p className="redirect-signup"><Link to="/signin">{t('reset.backToSignIn')}</Link></p>}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default VerifyEmailPage;
