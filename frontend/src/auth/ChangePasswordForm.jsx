import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiFetch from '../api';
import './ChangePasswordForm.css';

const EMPTY = { current: '', newPass: '', confirm: '' };

function ChangePasswordForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.current) {
      setMessage({ type: 'error', key: 'dashboard.profile.errors.currentRequired' });
      return;
    }
    if (form.newPass.length < 8) {
      setMessage({ type: 'error', key: 'dashboard.profile.errors.newShort' });
      return;
    }
    if (form.newPass !== form.confirm) {
      setMessage({ type: 'error', key: 'dashboard.profile.errors.newMismatch' });
      return;
    }
    apiFetch('/api/auth/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: form.current, newPassword: form.newPass }),
    })
      .then(res => {
        if (res.ok) {
          setMessage({ type: 'success', key: 'dashboard.profile.passwordUpdated' });
          setForm(EMPTY);
        } else if (res.status === 400) {
          setMessage({ type: 'error', key: 'dashboard.profile.errors.currentIncorrect' });
        } else {
          setMessage({ type: 'error', key: 'dashboard.profile.errors.passwordFailed' });
        }
      })
      .catch(() => setMessage({ type: 'error', key: 'dashboard.profile.errors.passwordFailed' }));
  };

  return (
    <section className="change-password">
      <h3 className="change-password-title">{t('dashboard.profile.changePassword')}</h3>
      <form className="change-password-form" onSubmit={handleSubmit}>
        <div className="change-password-field">
          <label htmlFor="current-password">{t('dashboard.profile.currentPassword')}</label>
          <input
            id="current-password"
            type="password"
            name="current"
            autoComplete="current-password"
            value={form.current}
            onChange={handleChange}
            placeholder={t('dashboard.profile.placeholders.currentPassword')}
          />
        </div>
        <div className="change-password-row">
          <div className="change-password-field">
            <label htmlFor="new-password">{t('dashboard.profile.newPassword')}</label>
            <input
              id="new-password"
              type="password"
              name="newPass"
              autoComplete="new-password"
              value={form.newPass}
              onChange={handleChange}
              placeholder={t('dashboard.profile.placeholders.newPassword')}
            />
          </div>
          <div className="change-password-field">
            <label htmlFor="confirm-password">{t('dashboard.profile.confirmNewPassword')}</label>
            <input
              id="confirm-password"
              type="password"
              name="confirm"
              autoComplete="new-password"
              value={form.confirm}
              onChange={handleChange}
              placeholder={t('dashboard.profile.placeholders.confirmNewPassword')}
            />
          </div>
        </div>
        {message && (
          <div className={`change-password-msg ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>
            {t(message.key)}
          </div>
        )}
        <div>
          <button type="submit" className="change-password-btn">{t('dashboard.profile.updatePassword')}</button>
        </div>
      </form>
    </section>
  );
}

export default ChangePasswordForm;
