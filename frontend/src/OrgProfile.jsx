import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdOpenInNew } from 'react-icons/md';
import apiFetch from './api';
import HELP_TYPES from './helpTypes';
import SK_CITIES from './saskatchewanCities';
import ORG_CATEGORIES from './orgCategories';
import './OrgProfile.css';

const DESCRIPTION_LIMIT = 500;
const LOGO_MAX_SIZE = 2 * 1024 * 1024;
const LOGO_TYPES = ['image/jpeg', 'image/png'];

export function normalizeWebsite(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function isValidWebsite(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.includes('.');
  } catch {
    return false;
  }
}

function toForm(org) {
  return {
    orgName: org?.orgName || '',
    description: org?.description || '',
    serviceAreas: org?.serviceAreas || [],
    helpTypes: org?.helpTypes || [],
    categories: org?.categories || [],
    offersIntergenerational: !!org?.offersIntergenerational,
    notificationEmail: org?.notificationEmail || '',
    website: org?.website || '',
  };
}

function OrgProfile({ org, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() => toForm(org));
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoError, setLogoError] = useState('');
  const [formOrgId, setFormOrgId] = useState(org?.id);

  if (org?.id !== formOrgId) {
    setFormOrgId(org?.id);
    setForm(toForm(org));
  }

  const orgId = org?.id;
  const logoVersion = org?.logoVersion;
  useEffect(() => {
    if (!orgId || !logoVersion) {
      setLogoPreview(null);
      return undefined;
    }
    let objectUrl = null;
    let cancelled = false;
    apiFetch(`/api/organizations/${orgId}/logo?v=${logoVersion}`)
      .then(res => (res.ok ? res.blob() : null))
      .then(blob => {
        if (!blob || cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setLogoPreview(objectUrl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [orgId, logoVersion]);

  const chooseLogo = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    setLogoError('');
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type)) {
      setLogoError('orgDashboard.profile.logoErrors.type');
      return;
    }
    if (file.size > LOGO_MAX_SIZE) {
      setLogoError('orgDashboard.profile.logoErrors.size');
      return;
    }
    const body = new FormData();
    body.append('file', file);
    setLogoBusy(true);
    apiFetch(`/api/organizations/${org.id}/logo`, { method: 'PUT', body })
      .then(res => {
        if (!res.ok) throw new Error('upload failed');
        return res.json();
      })
      .then(onSaved)
      .catch(() => setLogoError('orgDashboard.profile.logoErrors.upload'))
      .finally(() => setLogoBusy(false));
  };

  const removeLogo = () => {
    setLogoBusy(true);
    setLogoError('');
    apiFetch(`/api/organizations/${org.id}/logo`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('remove failed');
        return res.json();
      })
      .then(onSaved)
      .catch(() => setLogoError('common.genericError'))
      .finally(() => setLogoBusy(false));
  };

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
    const website = normalizeWebsite(form.website);
    if (website && !isValidWebsite(website)) {
      setError('orgDashboard.profile.websiteInvalid');
      return;
    }
    setStatus('saving');
    apiFetch(`/api/organizations/${org.id}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, website }),
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
      {org?.isApproved ? (
        <Link className="org-profile-public" to={`/organizations/${org.id}`} target="_blank" rel="noopener noreferrer">
          {t('orgDashboard.profile.viewPublic')} <MdOpenInNew aria-hidden="true" />
        </Link>
      ) : (
        <p className="org-profile-hint">{t('orgDashboard.profile.publicPending')}</p>
      )}

      <form className="org-profile-card" onSubmit={handleSubmit}>
        <div className="org-profile-grid">
          <div className="org-profile-column">
            <span className="org-profile-label" id="org-logo-label">{t('orgDashboard.profile.logo')}</span>
            <div className="org-profile-logo" aria-labelledby="org-logo-label" role="group">
              <div className="org-profile-logo-preview">
                {logoPreview
                  ? <img src={logoPreview} alt={t('orgDashboard.profile.logoPreview')} />
                  : <span>{t('orgDashboard.profile.noLogo')}</span>}
              </div>
              <div className="org-profile-logo-actions">
                <input id="org-logo-input" className="visually-hidden" type="file" accept=".jpg,.jpeg,.png" onChange={chooseLogo} disabled={logoBusy} />
                <label className="org-profile-logo-btn" htmlFor="org-logo-input">
                  {logoPreview ? t('orgDashboard.profile.changeLogo') : t('orgDashboard.profile.uploadLogo')}
                </label>
                {logoPreview && (
                  <button type="button" className="org-profile-logo-remove" onClick={removeLogo} disabled={logoBusy}>{t('orgDashboard.profile.removeLogo')}</button>
                )}
                <p className="org-profile-hint">{t('orgDashboard.profile.logoHint')}</p>
              </div>
            </div>
            {logoError && <p className="org-profile-error" role="alert">{t(logoError)}</p>}

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

            <label className="org-profile-label" htmlFor="org-website">{t('orgDashboard.profile.website')}</label>
            <input
              id="org-website"
              className="org-profile-input"
              type="text"
              inputMode="url"
              value={form.website}
              maxLength={300}
              onChange={e => update({ website: e.target.value })}
              placeholder="https://www.example.org"
            />

            {checkboxGroup(
              'serviceAreas',
              SK_CITIES.map(city => ({ value: city, label: city === 'Other' ? t('volunteer.otherCity') : city })),
              'orgDashboard.profile.serviceAreas',
              'orgDashboard.profile.serviceAreasHint',
            )}
          </div>

          <div className="org-profile-column">
            {checkboxGroup(
              'categories',
              ORG_CATEGORIES.map(category => ({ value: category.value, label: t(category.labelKey) })),
              'orgDashboard.profile.categories',
              'orgDashboard.profile.categoriesHint',
            )}

            <label className="org-profile-check org-profile-intergen">
              <input
                type="checkbox"
                checked={form.offersIntergenerational}
                onChange={e => update({ offersIntergenerational: e.target.checked })}
              />
              <span>
                {t('orgDashboard.profile.intergenerational')}
                <span className="org-profile-hint">{t('orgDashboard.profile.intergenerationalHint')}</span>
              </span>
            </label>

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
