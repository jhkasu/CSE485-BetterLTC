import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiFetch from './api';
import HELP_TYPES from './helpTypes';
import SK_CITIES from './saskatchewanCities';
import './VolunteerMatchingProfile.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIMES = ['Morning', 'Afternoon', 'Evening'];
const LANGUAGES = ['English', 'French', 'Spanish', 'Other'];

export function isMatchingProfileComplete(volunteer) {
  return !!volunteer?.city && (volunteer.availableDays || []).length > 0;
}

function toForm(volunteer) {
  return {
    city: volunteer?.city || '',
    availableDays: volunteer?.availableDays || [],
    availableTimes: volunteer?.availableTimes || [],
    interests: volunteer?.interests || [],
    languages: volunteer?.languages || [],
    recommendationConsent: !!volunteer?.recommendationConsent,
  };
}

function VolunteerMatchingProfile({ volunteer, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() => toForm(volunteer));
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(toForm(volunteer));
  }, [volunteer]);

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
    if (!form.city) {
      setError('dashboard.matching.errors.city');
      return;
    }
    if (form.availableDays.length === 0) {
      setError('dashboard.matching.errors.days');
      return;
    }
    setStatus('saving');
    apiFetch(`/api/volunteers/${volunteer.id}/matching-profile`, {
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
        setError('dashboard.matching.errors.saveFailed');
      });
  };

  const checks = (field, options, legendKey, required = false) => (
    <fieldset className="vmp-group">
      <legend>{t(legendKey)} {required && <span aria-hidden="true">*</span>}</legend>
      <div className="vmp-checks">
        {options.map(option => (
          <label key={option.value} className="vmp-check">
            <input type="checkbox" checked={form[field].includes(option.value)} onChange={() => toggle(field, option.value)} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <>
      <h2 className="dashboard-section-title">{t('dashboard.nav.matching')}</h2>
      <p className="vmp-lead">{t('dashboard.matching.lead')}</p>

      <form className="vmp-card" onSubmit={handleSubmit}>
        <label className="vmp-label" htmlFor="vmp-city">{t('dashboard.matching.city')} <span aria-hidden="true">*</span></label>
        <select id="vmp-city" className="vmp-select" value={form.city} onChange={e => update({ city: e.target.value })}>
          <option value="">{t('dashboard.matching.selectCity')}</option>
          {SK_CITIES.map(city => <option key={city} value={city}>{city === 'Other' ? t('volunteer.otherCity') : city}</option>)}
        </select>

        {checks('availableDays', DAYS.map(day => ({ value: day, label: t(`options.days.${day.toLowerCase()}`) })), 'dashboard.matching.days', true)}
        {checks('availableTimes', TIMES.map(time => ({ value: time, label: t(`dashboard.matching.times.${time.toLowerCase()}`) })), 'dashboard.matching.time')}

        <div className="vmp-split">
          {checks('interests', HELP_TYPES.map(type => ({ value: type.value, label: t(type.labelKey) })), 'dashboard.matching.interests')}
          {checks('languages', LANGUAGES.map(lang => ({ value: lang, label: t(`dashboard.matching.languageOptions.${lang.toLowerCase()}`) })), 'dashboard.matching.languages')}
        </div>

        <label className="vmp-consent">
          <input type="checkbox" checked={form.recommendationConsent} onChange={e => update({ recommendationConsent: e.target.checked })} />
          <span>{t('dashboard.matching.consent')}</span>
        </label>

        {error && <p className="vmp-error" role="alert">{t(error)}</p>}

        <div className="vmp-actions">
          <button type="submit" className="vmp-save" disabled={status === 'saving'}>{t('dashboard.matching.save')}</button>
          {status === 'saved' && <span className="vmp-saved" role="status">{t('dashboard.profile.saved')}</span>}
        </div>
      </form>
    </>
  );
}

export default VolunteerMatchingProfile;
