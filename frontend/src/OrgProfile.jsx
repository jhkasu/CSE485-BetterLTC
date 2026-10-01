import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiFetch from './api';
import HELP_TYPES from './helpTypes';
import SK_CITIES from './saskatchewanCities';
import './OrgProfile.css';

const DESCRIPTION_LIMIT = 500;

function toForm(org) {
  return {
    orgName: org?.orgName || '',
    description: org?.description || '',
    serviceAreas: org?.serviceAreas || [],
    helpTypes: org?.helpTypes || [],
    notificationEmail: org?.notificationEmail || '',
  };
}

function OrgProfile({ org, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() => toForm(org));
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(toForm(org));
  }, [org]);

  const update = (changes) => {
    setForm(current => ({ ...current, ...changes }));
    setStatus(null);
    setError('');
  };

  const toggle = (field, value) => {
    const list = form[field];
    update({ [field]: list.includes(value) ? list.filter(v => v !== value) : [...list, value] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.orgName.trim()) {
      setError('orgDashboard.profile.nameRequired');
      return;
    }
    setStatus('saving');
    apiFetch(`/api/organizations/${org.id}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then(res => {
        if (!res.ok) throw new Error('save failed');
        return res.json();
      })
      .then(saved => {
        setStatus('saved');
        onSaved(saved);
      })
      .catch(() => {
        setStatus(null);
        setError('orgDashboard.profile.saveFailed');
      });
  };

  const checkboxGroup = (field, options, legendKey, hintKey) => (
    <fieldset className="org-profile-group">
      <legend>{t(legendKey)}</legend>
      <p className="org-profile-hint">{t(hintKey)}</p>
      <div className="org-profile-checks">
        {options.map(option => (
          <label key={option.value} className="org-profile-check">
            <input
              type="checkbox"
              checked={form[field].includes(option.value)}
              onChange={() => toggle(field, option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div className="org-profile">
      <h2 className="org-section-title org-profile-title">{t('orgDashboard.profile.heading')}</h2>
      <p className="org-profile-lead">{t('orgDashboard.profile.lead')}</p>

      <form className="org-profile-card" onSubmit={handleSubmit}>
        <div className="org-profile-grid">
          <div className="org-profile-column">
            <label className="org-profile-label" htmlFor="org-name">
              {t('orgDashboard.profile.name')} <span aria-hidden="true">*</span>
            </label>
            <input
              id="org-name"
              className="org-profile-input"
              value={form.orgName}
              onChange={e => update({ orgName: e.target.value })}
              maxLength={200}
              required
            />

            <label className="org-profile-label" htmlFor="org-description">{t('orgDashboard.profile.description')}</label>
            <textarea
              id="org-description"
              className="org-profile-input"
              rows={4}
              value={form.description}
              maxLength={DESCRIPTION_LIMIT}
              onChange={e => update({ description: e.target.value })}
              placeholder={t('orgDashboard.profile.descriptionPlaceholder')}
            />
            <p className="org-profile-count">{form.description.length}/{DESCRIPTION_LIMIT}</p>

            {checkboxGroup(
              'serviceAreas',
              SK_CITIES.map(city => ({ value: city, label: city === 'Other' ? t('volunteer.otherCity') : city })),
              'orgDashboard.profile.serviceAreas',
              'orgDashboard.profile.serviceAreasHint',
            )}
          </div>

          <div className="org-profile-column">
            {checkboxGroup(
              'helpTypes',
              HELP_TYPES.map(type => ({ value: type.value, label: t(type.labelKey) })),
              'orgDashboard.profile.helpTypes',
              'orgDashboard.profile.helpTypesHint',
            )}

            <label className="org-profile-label" htmlFor="org-notification-email">{t('orgDashboard.profile.notificationEmail')}</label>
            <input
              id="org-notification-email"
              className="org-profile-input"
              type="email"
              value={form.notificationEmail}
              onChange={e => update({ notificationEmail: e.target.value })}
              placeholder={org?.email || ''}
            />
            <p className="org-profile-hint">{t('orgDashboard.profile.notificationEmailHint')}</p>
          </div>
        </div>

        {error && <p className="org-profile-error" role="alert">{t(error)}</p>}

        <div className="org-profile-actions">
          {status === 'saved' && <span className="org-profile-saved" role="status">{t('orgDashboard.profile.saved')}</span>}
          <button type="submit" className="hr-accept-btn" disabled={status === 'saving'}>
            {t('orgDashboard.profile.save')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OrgProfile;
