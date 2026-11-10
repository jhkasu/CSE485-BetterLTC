import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdOpenInNew } from 'react-icons/md';
import apiFetch from './api';
import SK_CITIES from './saskatchewanCities';
import ORG_CATEGORIES from './orgCategories';
import {
  ENGAGEMENT_INTERESTS, GEOGRAPHIC_SCOPES, ORG_TYPES, POPULATIONS, REVIEW_FREQUENCIES, SERVICE_LANGUAGES, UPDATE_CONTACTS,
} from './orgProfileOptions';
import './OrgProfile.css';

const LOGO_MAX_SIZE = 2 * 1024 * 1024;
const LOGO_TYPES = ['image/jpeg', 'image/png'];
const SHORT_MIN_WORDS = 50;
const SHORT_MAX_WORDS = 100;
const SOCIAL_FIELDS = [
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
  ['linkedIn', 'LinkedIn'],
  ['youTube', 'YouTube'],
  ['tikTok', 'TikTok'],
];
const CONSENTS = [
  ['confirmAuthorized', 'orgForm.consentAuthorized'],
  ['confirmAccurate', 'orgForm.consentAccurate'],
  ['confirmPublication', 'orgForm.consentPublication'],
  ['confirmMedia', 'orgForm.consentMedia'],
  ['confirmUpdates', 'orgForm.consentUpdates'],
];

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

export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function toForm(org) {
  const consented = !!org?.consentedAt;
  return {
    orgName: org?.orgName && org.orgName !== org.legalName ? org.orgName : '',
    legalName: org?.legalName || org?.orgName || '',
    orgType: org?.orgType || '',
    orgTypeOther: org?.orgTypeOther || '',
    yearEstablished: org?.yearEstablished ? String(org.yearEstablished) : '',
    geographicScope: org?.geographicScope || [],
    communitiesServed: org?.communitiesServed || '',
    serviceAreas: org?.serviceAreas || [],
    streetAddress: org?.streetAddress || '',
    city: org?.city || '',
    province: org?.province || 'Saskatchewan',
    postalCode: org?.postalCode || '',
    additionalLocations: org?.additionalLocations || '',
    website: org?.website || '',
    facebook: org?.facebook || '',
    instagram: org?.instagram || '',
    linkedIn: org?.linkedIn || '',
    youTube: org?.youTube || '',
    tikTok: org?.tikTok || '',
    otherSocial: org?.otherSocial || '',
    tagline: org?.tagline || '',
    shortDescription: org?.shortDescription || '',
    description: org?.description || '',
    mission: org?.mission || '',
    vision: org?.vision || '',
    coreValues: org?.coreValues || '',
    story: org?.story || '',
    uniqueness: org?.uniqueness || '',
    goals: org?.goals || '',
    categories: org?.categories || [],
    categoryOther: org?.categoryOther || '',
    populationsServed: org?.populationsServed || [],
    populationOther: org?.populationOther || '',
    serviceLanguages: org?.serviceLanguages || [],
    serviceLanguageOther: org?.serviceLanguageOther || '',
    languageServices: org?.languageServices || '',
    offersIntergenerational: !!org?.offersIntergenerational,
    contactName: org?.contactName || '',
    contactPosition: org?.contactPosition || '',
    contactPhone: org?.contactPhone || '',
    notificationEmail: org?.notificationEmail || '',
    updateContact: org?.updateContact || '',
    updateContactDetails: org?.updateContactDetails || '',
    reviewFrequency: org?.reviewFrequency || '',
    engagementInterests: org?.engagementInterests || [],
    adminComments: org?.adminComments || '',
    confirmAuthorized: consented,
    confirmAccurate: consented,
    confirmPublication: consented,
    confirmMedia: consented,
    confirmUpdates: consented,
    representativeName: org?.representativeName || '',
  };
}

function validate(form, links) {
  if (!form.legalName.trim()) return 'orgForm.errors.legalNameRequired';
  if (!form.orgType) return 'orgForm.errors.orgTypeRequired';
  const year = form.yearEstablished.trim();
  if (year && (!/^\d{4}$/.test(year) || Number(year) < 1800 || Number(year) > new Date().getFullYear())) return 'orgForm.errors.yearInvalid';
  if (form.geographicScope.length === 0) return 'orgForm.errors.geoRequired';
  if (![form.streetAddress, form.city, form.province, form.postalCode].every(value => value.trim())) return 'orgForm.errors.addressRequired';
  if (!isValidWebsite(links.website)) return 'orgDashboard.profile.websiteInvalid';
  if (SOCIAL_FIELDS.map(([field]) => field).concat('otherSocial').some(field => links[field] && !isValidWebsite(links[field]))) {
    return 'orgForm.errors.socialInvalid';
  }
  const words = countWords(form.shortDescription);
  if (words < SHORT_MIN_WORDS || words > SHORT_MAX_WORDS) return 'orgForm.errors.shortDescriptionWords';
  if (form.categories.length === 0) return 'orgForm.errors.focusRequired';
  if (form.populationsServed.length === 0) return 'orgForm.errors.populationRequired';
  const missingOther = (form.orgType === 'Other' && !form.orgTypeOther.trim())
    || (form.categories.includes('Other') && !form.categoryOther.trim())
    || (form.populationsServed.includes('Other') && !form.populationOther.trim())
    || (form.serviceLanguages.includes('Other') && !form.serviceLanguageOther.trim());
  if (missingOther) return 'orgForm.errors.otherRequired';
  if (!form.contactName.trim()) return 'orgForm.errors.submitterRequired';
  if (CONSENTS.some(([field]) => !form[field])) return 'orgForm.errors.consentRequired';
  if (!form.representativeName.trim()) return 'orgForm.errors.representativeRequired';
  return null;
}

function OrgProfile({ org, onSaved }) {
  const { t, i18n } = useTranslation();
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
    const links = Object.fromEntries(
      ['website', 'facebook', 'instagram', 'linkedIn', 'youTube', 'tikTok', 'otherSocial'].map(field => [field, normalizeWebsite(form[field])]),
    );
    const problem = validate(form, links);
    if (problem) {
      setError(problem);
      return;
    }
    const year = form.yearEstablished.trim();
    setStatus('saving');
    apiFetch(`/api/organizations/${org.id}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, ...links, yearEstablished: year ? Number(year) : null }),
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

  const required = <span aria-hidden="true"> *</span>;

  const textField = (field, labelKey, options = {}) => (
    <>
      <label className="org-profile-label" htmlFor={`org-${field}`}>
        {options.label || t(labelKey)}{options.required && required}
      </label>
      {options.hintKey && <p className="org-profile-hint" id={`org-${field}-hint`}>{t(options.hintKey)}</p>}
      {options.rows ? (
        <textarea
          id={`org-${field}`}
          className="org-profile-input"
          rows={options.rows}
          value={form[field]}
          maxLength={options.maxLength || 2000}
          aria-describedby={options.hintKey ? `org-${field}-hint` : undefined}
          onChange={e => update({ [field]: e.target.value })}
        />
      ) : (
        <input
          id={`org-${field}`}
          className="org-profile-input"
          type={options.type || 'text'}
          inputMode={options.inputMode}
          value={form[field]}
          maxLength={options.maxLength || 200}
          placeholder={options.placeholder}
          aria-describedby={options.hintKey ? `org-${field}-hint` : undefined}
          onChange={e => update({ [field]: e.target.value })}
        />
      )}
      {options.wordCount && <p className="org-profile-count">{t('orgForm.wordCount', { count: countWords(form[field]) })}</p>}
    </>
  );

  const otherField = (field) => (
    <div className="org-form-other">
      <label className="org-profile-label" htmlFor={`org-${field}`}>{t('orgForm.otherSpecify')}</label>
      <input
        id={`org-${field}`}
        className="org-profile-input"
        value={form[field]}
        maxLength={200}
        onChange={e => update({ [field]: e.target.value })}
      />
    </div>
  );

  const checkboxGroup = (field, options, legend, extra = {}) => (
    <fieldset className="org-profile-group">
      <legend>{legend}{extra.required && required}</legend>
      {extra.hint && <p className="org-profile-hint">{extra.hint}</p>}
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
      {extra.otherField && form[field].includes('Other') && otherField(extra.otherField)}
    </fieldset>
  );

  const radioGroup = (field, options, legend, extra = {}) => (
    <fieldset className="org-profile-group">
      <legend>{legend}{extra.required && required}</legend>
      <div className="org-profile-checks">
        {options.map(option => (
          <label key={option.value} className="org-profile-check">
            <input
              type="radio"
              name={`org-${field}`}
              checked={form[field] === option.value}
              onChange={() => update({ [field]: option.value })}
            />
            <span>{t(option.labelKey)}</span>
          </label>
        ))}
      </div>
      {extra.otherField && form[field] === 'Other' && otherField(extra.otherField)}
    </fieldset>
  );

  const translated = (list) => list.map(option => ({ value: option.value, label: t(option.labelKey) }));
  const registry = org?.registryNumber ? `${org.registryType}: ${org.registryNumber}` : t('orgForm.registrationNone');
  const consentDate = org?.consentedAt
    ? new Date(org.consentedAt).toLocaleDateString(i18n.resolvedLanguage || i18n.language || 'en', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

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

      <form className="org-profile-card" onSubmit={handleSubmit} noValidate>
        <section className="org-form-section" aria-labelledby="org-section-identification">
          <h3 id="org-section-identification" className="org-form-heading">{t('orgForm.sections.identification')}</h3>

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

          <div className="org-form-pair">
            <div>{textField('legalName', 'orgForm.legalName', { required: true })}</div>
            <div>{textField('orgName', 'orgForm.publicName', { hintKey: 'orgForm.publicNameHint' })}</div>
          </div>

          {radioGroup('orgType', ORG_TYPES, t('orgForm.orgType'), { required: true, otherField: 'orgTypeOther' })}

          <div className="org-form-pair">
            <div>{textField('yearEstablished', 'orgForm.yearEstablished', { inputMode: 'numeric', maxLength: 4 })}</div>
            <div>
              <span className="org-profile-label">{t('orgForm.registration')}</span>
              <p className="org-form-readonly">{registry}</p>
              <p className="org-profile-hint">{t('orgForm.registrationHint')}</p>
            </div>
          </div>

          {checkboxGroup('geographicScope', translated(GEOGRAPHIC_SCOPES), t('orgForm.geoScope'), { required: true })}
          {checkboxGroup(
            'serviceAreas',
            SK_CITIES.map(city => ({ value: city, label: city === 'Other' ? t('volunteer.otherCity') : city })),
            t('orgDashboard.profile.serviceAreas'),
            { hint: t('orgDashboard.profile.serviceAreasHint') },
          )}
          {textField('communitiesServed', 'orgForm.communitiesServed', { maxLength: 500 })}

          <fieldset className="org-profile-group">
            <legend>{t('orgForm.address')}{required}</legend>
            {textField('streetAddress', 'orgForm.street')}
            <div className="org-form-trio">
              <div>{textField('city', 'orgForm.city', { maxLength: 100 })}</div>
              <div>{textField('province', 'orgForm.province', { maxLength: 100 })}</div>
              <div>{textField('postalCode', 'orgForm.postalCode', { maxLength: 20 })}</div>
            </div>
          </fieldset>
          {textField('additionalLocations', 'orgForm.additionalLocations', { rows: 2, maxLength: 500 })}

          {textField('website', 'orgDashboard.profile.website', { required: true, inputMode: 'url', maxLength: 300, placeholder: 'https://www.example.org' })}

          <fieldset className="org-profile-group">
            <legend>{t('orgForm.social')}</legend>
            <div className="org-form-pair org-form-pair-wrap">
              {SOCIAL_FIELDS.map(([field, name]) => (
                <div key={field}>{textField(field, null, { label: name, inputMode: 'url', maxLength: 300, placeholder: 'https://' })}</div>
              ))}
              <div>{textField('otherSocial', 'orgForm.socialOther', { inputMode: 'url', maxLength: 300, placeholder: 'https://' })}</div>
            </div>
          </fieldset>
        </section>

        <section className="org-form-section" aria-labelledby="org-section-about">
          <h3 id="org-section-about" className="org-form-heading">{t('orgForm.sections.about')}</h3>
          <p className="org-profile-hint">{t('orgForm.sections.aboutLead')}</p>
          {textField('tagline', 'orgForm.tagline')}
          {textField('shortDescription', 'orgForm.shortDescription', { required: true, rows: 4, maxLength: 1000, hintKey: 'orgForm.shortDescriptionHint', wordCount: true })}
          {textField('description', 'orgForm.fullDescription', { rows: 8, maxLength: 3000, hintKey: 'orgForm.fullDescriptionHint', wordCount: true })}
          {textField('mission', 'orgForm.mission', { rows: 3 })}
          {textField('vision', 'orgForm.vision', { rows: 3 })}
          {textField('coreValues', 'orgForm.values', { rows: 3 })}
          {textField('story', 'orgForm.story', { rows: 3, hintKey: 'orgForm.storyHint' })}
          {textField('uniqueness', 'orgForm.unique', { rows: 3, hintKey: 'orgForm.uniqueHint' })}
          {textField('goals', 'orgForm.goals', { rows: 3 })}
        </section>

        <section className="org-form-section" aria-labelledby="org-section-focus">
          <h3 id="org-section-focus" className="org-form-heading">{t('orgForm.sections.focus')}</h3>
          {checkboxGroup('categories', translated(ORG_CATEGORIES), t('orgForm.focusAreas'), { required: true, hint: t('orgForm.focusAreasHint'), otherField: 'categoryOther' })}
          {checkboxGroup('populationsServed', translated(POPULATIONS), t('orgForm.populations'), { required: true, hint: t('orgForm.populationsHint'), otherField: 'populationOther' })}
          {checkboxGroup('serviceLanguages', translated(SERVICE_LANGUAGES), t('orgForm.languages'), { otherField: 'serviceLanguageOther' })}
          {form.serviceLanguages.length > 0 && textField('languageServices', 'orgForm.languageServices', { rows: 2, maxLength: 1000 })}

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
        </section>

        <section className="org-form-section" aria-labelledby="org-section-admin">
          <h3 id="org-section-admin" className="org-form-heading">{t('orgForm.sections.admin')}</h3>
          <p className="org-profile-hint">{t('orgForm.sections.adminLead')}</p>
          <div className="org-form-pair">
            <div>{textField('contactName', 'orgForm.submitter', { required: true })}</div>
            <div>{textField('contactPosition', 'orgForm.position')}</div>
          </div>
          <div className="org-form-pair">
            <div>
              <span className="org-profile-label">{t('orgForm.adminEmail')}</span>
              <p className="org-form-readonly">{org?.email}</p>
              <p className="org-profile-hint">{t('orgForm.adminEmailHint')}</p>
            </div>
            <div>{textField('contactPhone', 'orgForm.adminPhone', { type: 'tel', maxLength: 40 })}</div>
          </div>
          {textField('notificationEmail', 'orgDashboard.profile.notificationEmail', { type: 'email', hintKey: 'orgDashboard.profile.notificationEmailHint', placeholder: org?.email || '' })}
          {radioGroup('updateContact', UPDATE_CONTACTS, t('orgForm.updateContact'))}
          {form.updateContact && form.updateContact !== UPDATE_CONTACTS[0].value && textField('updateContactDetails', 'orgForm.updateContactDetails', { maxLength: 300 })}
          {radioGroup('reviewFrequency', REVIEW_FREQUENCIES, t('orgForm.reviewFrequency'))}
          {checkboxGroup('engagementInterests', translated(ENGAGEMENT_INTERESTS), t('orgForm.engagement'))}
          {textField('adminComments', 'orgForm.comments', { rows: 3 })}
        </section>

        <section className="org-form-section" aria-labelledby="org-section-consent">
          <h3 id="org-section-consent" className="org-form-heading">{t('orgForm.sections.consent')}{required}</h3>
          <div className="org-form-consents">
            {CONSENTS.map(([field, key]) => (
              <label key={field} className="org-profile-check">
                <input type="checkbox" checked={form[field]} onChange={e => update({ [field]: e.target.checked })} />
                <span>{t(key)}</span>
              </label>
            ))}
          </div>
          {textField('representativeName', 'orgForm.representative', { required: true })}
          {consentDate && <p className="org-profile-hint">{t('orgForm.lastConfirmed', { date: consentDate })}</p>}
        </section>

        {error && <p className="org-profile-error" role="alert">{t(error)}</p>}

        <div className="org-profile-actions">
          {status === 'saved' && <span className="org-profile-saved" role="status">{t('orgDashboard.profile.saved')}</span>}
          <button type="submit" className="org-profile-save" disabled={status === 'saving'}>
            {t('orgDashboard.profile.save')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OrgProfile;
