import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiFetch from './api';
import { getCurrentUser, getSessionRole } from './auth/session';

const MESSAGE_LIMIT = 1000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function initialForm() {
  const user = getSessionRole() === 'volunteer' ? getCurrentUser() : null;
  return {
    name: user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : '',
    email: user?.email || '',
    phone: user?.phone || '',
    message: '',
    consent: false,
    website: '',
  };
}

function ExpressInterestForm({ org, roles, roleId, onRoleChange }) {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  const update = (changes) => {
    setForm(current => ({ ...current, ...changes }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('orgPage.interest.errors.required');
      return;
    }
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      setError('orgPage.interest.errors.email');
      return;
    }
    if (!form.consent) {
      setError('orgPage.interest.errors.consent');
      return;
    }
    setStatus('sending');
    apiFetch(`/api/organizations/${org.id}/interest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone,
        roleId: roleId ? Number(roleId) : null,
        message: form.message,
        consentGiven: form.consent,
        language: i18n.resolvedLanguage || i18n.language || 'en',
        website: form.website,
      }),
    })
      .then(res => {
        if (res.status === 503) throw new Error('unavailable');
        if (!res.ok) throw new Error('failed');
        setStatus('sent');
      })
      .catch(err => {
        setStatus(null);
        setError(err.message === 'unavailable' ? 'orgPage.interest.errors.unavailable' : 'common.genericError');
      });
  };

  if (status === 'sent') {
    return (
      <div className="orgp-interest-sent" role="status">
        <h3>{t('orgPage.interest.sentHeading')}</h3>
        <p>{t('orgPage.interest.sentText', { name: org.orgName })}</p>
        <button
          type="button"
          className="orgp-interest-again"
          onClick={() => { setForm(current => ({ ...current, message: '', consent: false })); setStatus(null); }}
        >
          {t('orgPage.interest.another')}
        </button>
      </div>
    );
  }

  return (
    <form className="orgp-interest-form" onSubmit={handleSubmit} noValidate>
      <div className="orgp-interest-row">
        <div className="orgp-field">
          <label htmlFor="interest-name">{t('orgPage.interest.name')} <span aria-hidden="true">*</span></label>
          <input id="interest-name" value={form.name} maxLength={100} autoComplete="name" required onChange={e => update({ name: e.target.value })} />
        </div>
        <div className="orgp-field">
          <label htmlFor="interest-email">{t('common.email')} <span aria-hidden="true">*</span></label>
          <input id="interest-email" type="email" value={form.email} maxLength={200} autoComplete="email" required onChange={e => update({ email: e.target.value })} />
        </div>
      </div>
      <div className="orgp-interest-row">
        <div className="orgp-field">
          <label htmlFor="interest-phone">{t('orgPage.interest.phone')}</label>
          <input id="interest-phone" type="tel" value={form.phone} maxLength={30} autoComplete="tel" onChange={e => update({ phone: e.target.value })} />
        </div>
        {roles.length > 0 && (
          <div className="orgp-field">
            <label htmlFor="interest-role">{t('orgPage.interest.role')}</label>
            <select id="interest-role" value={roleId} onChange={e => onRoleChange(e.target.value)}>
              <option value="">{t('orgPage.interest.anyRole')}</option>
              {roles.map(role => <option key={role.id} value={String(role.id)}>{role.title}</option>)}
            </select>
          </div>
        )}
      </div>
      <div className="orgp-field">
        <label htmlFor="interest-message">{t('orgPage.interest.message')}</label>
        <textarea
          id="interest-message"
          rows={4}
          value={form.message}
          maxLength={MESSAGE_LIMIT}
          placeholder={t('orgPage.interest.messagePlaceholder')}
          onChange={e => update({ message: e.target.value })}
        />
        <p className="orgp-interest-count">{form.message.length}/{MESSAGE_LIMIT}</p>
      </div>
      <div className="orgp-interest-trap" aria-hidden="true">
        <label htmlFor="interest-website">Website</label>
        <input id="interest-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={e => update({ website: e.target.value })} />
      </div>
      <label className="orgp-interest-consent">
        <input type="checkbox" checked={form.consent} onChange={e => update({ consent: e.target.checked })} />
        <span>{t('orgPage.interest.consent', { name: org.orgName })}</span>
      </label>
      {error && <p className="orgp-interest-error" role="alert">{t(error)}</p>}
      <button type="submit" className="btn btn-primary orgp-interest-submit" disabled={status === 'sending'}>
        {status === 'sending' ? t('orgPage.interest.sending') : t('orgPage.interest.send')}
      </button>
    </form>
  );
}

export default ExpressInterestForm;
