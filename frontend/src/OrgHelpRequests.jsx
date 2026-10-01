import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdElderly, MdRestaurant, MdDirectionsCar, MdLocalHospital, MdPsychology, MdHome, MdHelpOutline,
  MdArrowBack, MdCheck, MdPhone, MdEmail, MdVerifiedUser, MdSearch, MdPerson,
} from 'react-icons/md';
import apiFetch from './api';
import HELP_TYPES, { HELP_TYPE_KEYS } from './helpTypes';
import SK_CITIES from './saskatchewanCities';
import { matchReasons, languageList } from './matchReasons';
import './OrgHelpRequests.css';

const HELP_TYPE_ICONS = {
  'Senior Care Support': <MdElderly />,
  'Meal Assistance': <MdRestaurant />,
  'Transportation Support': <MdDirectionsCar />,
  'Medical Assistance': <MdLocalHospital />,
  'Mental Health Support': <MdPsychology />,
  'Housing Support': <MdHome />,
};

const STEPS = [
  { key: 'received', dateField: 'submittedAt' },
  { key: 'accepted', dateField: 'acceptedAt' },
  { key: 'contacted', dateField: 'contactedAt' },
  { key: 'volunteerAssigned' },
  { key: 'completed' },
];

function useHelpRequestLabels() {
  const { t, i18n } = useTranslation();
  return {
    t,
    helpType: (value) => (HELP_TYPE_KEYS[value] ? t(HELP_TYPE_KEYS[value]) : value),
    city: (value) => (value === 'Other' ? t('volunteer.otherCity') : value),
    method: (value) => t(`getHelp.request.methods.${(value || '').toLowerCase()}`, { defaultValue: value }),
    date: (value) => (value ? new Date(value).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' }) : ''),
  };
}

function HelpTypeIcon({ type }) {
  return <div className="hr-icon" aria-hidden="true">{HELP_TYPE_ICONS[type] || <MdHelpOutline />}</div>;
}

export function HelpRequestList({ onAccepted, needsProfile, onSetupProfile }) {
  const labels = useHelpRequestLabels();
  const { t } = labels;
  const [requests, setRequests] = useState(null);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('');
  const [type, setType] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiFetch('/api/help-requests/open')
      .then(res => (res.ok ? res.json() : []))
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]));
  }, []);

  const accept = (id) => {
    setBusyId(id);
    setMessage('');
    apiFetch(`/api/help-requests/${id}/accept`, { method: 'PUT' })
      .then(res => {
        if (res.status === 409) {
          setRequests(list => list.filter(r => r.id !== id));
          setMessage('orgDashboard.requests.alreadyTaken');
          return;
        }
        if (!res.ok) throw new Error('accept failed');
        onAccepted(id);
      })
      .catch(() => setMessage('orgDashboard.requests.acceptFailed'))
      .finally(() => setBusyId(null));
  };

  const query = search.trim().toLowerCase();
  const visible = (requests || []).filter(r =>
    (!area || r.city === area)
    && (!type || r.helpType === type)
    && (!query || `${labels.helpType(r.helpType)} ${labels.city(r.city)}`.toLowerCase().includes(query)));

  return (
    <div>
      <h2 className="org-section-title hr-title">{t('orgDashboard.requests.heading')}</h2>
      <p className="hr-lead">{t('orgDashboard.requests.lead')}</p>

      <div className="hr-filters">
        <label className="hr-search">
          <MdSearch aria-hidden="true" />
          <span className="visually-hidden">{t('orgDashboard.requests.searchLabel')}</span>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('orgDashboard.requests.searchPlaceholder')}
          />
        </label>
        <select aria-label={t('orgDashboard.requests.allAreas')} value={area} onChange={e => setArea(e.target.value)}>
          <option value="">{t('orgDashboard.requests.allAreas')}</option>
          {SK_CITIES.map(city => <option key={city} value={city}>{labels.city(city)}</option>)}
        </select>
        <select aria-label={t('orgDashboard.requests.allTypes')} value={type} onChange={e => setType(e.target.value)}>
          <option value="">{t('orgDashboard.requests.allTypes')}</option>
          {HELP_TYPES.map(h => <option key={h.value} value={h.value}>{t(h.labelKey)}</option>)}
        </select>
      </div>

      {message && <p className="hr-message" role="alert">{t(message)}</p>}

      {needsProfile && (
        <div className="hr-setup">
          <p>{t('orgDashboard.requests.setupNeeded')}</p>
          <button type="button" className="hr-accept-btn" onClick={onSetupProfile}>{t('orgDashboard.requests.setupButton')}</button>
        </div>
      )}

      {requests === null ? (
        <p className="org-empty">{t('common.loading')}</p>
      ) : needsProfile ? null : visible.length === 0 ? (
        <p className="org-empty">{t(requests.length === 0 ? 'orgDashboard.requests.empty' : 'orgDashboard.requests.noMatch')}</p>
      ) : (
        <ul className="hr-list">
          {visible.map(r => (
            <li key={r.id} className="hr-card">
              <HelpTypeIcon type={r.helpType} />
              <div className="hr-card-body">
                <h3 className="hr-card-title">{labels.helpType(r.helpType)}</h3>
                <p className="hr-card-meta">
                  {labels.city(r.city)} · {t('orgDashboard.requests.submitted', { date: labels.date(r.submittedAt) })}
                </p>
                <p className="hr-card-meta">
                  {t('orgDashboard.requests.prefers', { method: labels.method(r.contactMethod) })}
                  {r.forFamilyMember && ` · ${t('orgDashboard.requests.familyRequest')}`}
                </p>
              </div>
              <button
                type="button"
                className="hr-accept-btn"
                onClick={() => accept(r.id)}
                disabled={busyId === r.id}
              >
                {busyId === r.id ? t('orgDashboard.requests.accepting') : t('orgDashboard.requests.accept')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AcceptedRequestList({ onOpen }) {
  const labels = useHelpRequestLabels();
  const { t } = labels;
  const [requests, setRequests] = useState(null);

  useEffect(() => {
    apiFetch('/api/help-requests/accepted')
      .then(res => (res.ok ? res.json() : []))
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]));
  }, []);

  return (
    <div>
      <h2 className="org-section-title">{t('orgDashboard.accepted.heading')}</h2>
      {requests === null ? (
        <p className="org-empty">{t('common.loading')}</p>
      ) : requests.length === 0 ? (
        <p className="org-empty">{t('orgDashboard.accepted.empty')}</p>
      ) : (
        <ul className="hr-list">
          {requests.map(r => (
            <li key={r.id} className="hr-card">
              <HelpTypeIcon type={r.helpType} />
              <div className="hr-card-body">
                <h3 className="hr-card-title">{labels.helpType(r.helpType)}</h3>
                <p className="hr-card-meta">
                  {r.firstName} {r.lastName} · {labels.city(r.city)}
                </p>
                <span className={`hr-status hr-status--${r.status.toLowerCase()}`}>
                  {t(`options.helpRequestStatus.${r.status.toLowerCase()}`, { defaultValue: r.status })}
                </span>
              </div>
              <button type="button" className="hr-view-btn" onClick={() => onOpen(r.id)}>
                {t('orgDashboard.accepted.view')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function HelpRequestDetail({ id, onBack }) {
  const labels = useHelpRequestLabels();
  const { t } = labels;
  const [request, setRequest] = useState(null);
  const [error, setError] = useState('');
  const [confirmRelease, setConfirmRelease] = useState(false);

  useEffect(() => {
    apiFetch(`/api/help-requests/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('load failed');
        return res.json();
      })
      .then(setRequest)
      .catch(() => setError('common.genericError'));
  }, [id]);

  const markContacted = () => {
    setError('');
    apiFetch(`/api/help-requests/${id}/contacted`, { method: 'PUT' })
      .then(res => {
        if (!res.ok) throw new Error('update failed');
        return res.json();
      })
      .then(setRequest)
      .catch(() => setError('common.genericError'));
  };

  const release = () => {
    setError('');
    apiFetch(`/api/help-requests/${id}/release`, { method: 'PUT' })
      .then(res => {
        if (!res.ok) throw new Error('release failed');
        onBack();
      })
      .catch(() => setError('common.genericError'));
  };

  const backButton = (
    <button type="button" className="hr-back" onClick={onBack}>
      <MdArrowBack aria-hidden="true" /> {t('orgDashboard.detail.back')}
    </button>
  );

  if (!request) {
    return (
      <div>
        {backButton}
        <p className="org-empty">{error ? t(error) : t('common.loading')}</p>
      </div>
    );
  }

  const doneSteps = STEPS.filter(step => step.dateField && request[step.dateField]).length;
  const contactValue = request.contactMethod === 'Phone' ? request.phone : request.email;

  return (
    <div className="hr-detail">
      {backButton}
      <h2 className="org-section-title">{t('orgDashboard.detail.heading')}</h2>

      <ol className="hr-steps">
        {STEPS.map((step, i) => {
          const done = i < doneSteps;
          return (
            <li key={step.key} className={`hr-step${done ? ' hr-step--done' : ''}`}>
              <span className="hr-step-dot" aria-hidden="true">{done ? <MdCheck /> : i + 1}</span>
              <span className="hr-step-label">{t(`orgDashboard.detail.steps.${step.key}`)}</span>
              {done && <span className="hr-step-date">{labels.date(request[step.dateField])}</span>}
            </li>
          );
        })}
      </ol>

      <section className="hr-detail-card">
        <div className="hr-detail-head">
          <HelpTypeIcon type={request.helpType} />
          <div>
            <h3 className="hr-card-title">{labels.helpType(request.helpType)}</h3>
            <p className="hr-card-meta">{labels.city(request.city)} · {t('orgDashboard.requests.submitted', { date: labels.date(request.submittedAt) })}</p>
          </div>
        </div>

        <div className="hr-detail-grid">
          <div>
            <h4>{t('orgDashboard.detail.contactInfo')}</h4>
            <p className="hr-detail-line"><MdPerson aria-hidden="true" /> {request.firstName} {request.lastName}</p>
            <p className="hr-detail-line">
              {request.contactMethod === 'Phone' ? <MdPhone aria-hidden="true" /> : <MdEmail aria-hidden="true" />}
              {request.contactMethod === 'Phone'
                ? <a href={`tel:${contactValue.replace(/\D/g, '')}`}>{contactValue}</a>
                : <a href={`mailto:${contactValue}`}>{contactValue}</a>}
            </p>
            <p className="hr-detail-line hr-detail-muted">{t('orgDashboard.detail.preferred', { method: labels.method(request.contactMethod) })}</p>
          </div>
          <div>
            <h4>{t('orgDashboard.detail.additional')}</h4>
            {request.forFamilyMember ? (
              <>
                <p className="hr-detail-line">{t('orgDashboard.detail.requestFor', { name: request.seniorName })}</p>
                <p className="hr-detail-line hr-detail-muted">{t('orgDashboard.detail.familyNote')}</p>
              </>
            ) : (
              <p className="hr-detail-line hr-detail-muted">{t('orgDashboard.detail.selfNote')}</p>
            )}
          </div>
        </div>

        <div className={`hr-banner${request.status === 'Contacted' ? ' hr-banner--done' : ''}`}>
          <MdVerifiedUser aria-hidden="true" />
          <span>{t(request.status === 'Contacted' ? 'orgDashboard.detail.contactedBanner' : 'orgDashboard.detail.acceptedBanner')}</span>
        </div>

        {error && <p className="hr-message" role="alert">{t(error)}</p>}

        <div className="hr-detail-actions">
          {request.status === 'Accepted' && (
            <button type="button" className="hr-accept-btn" onClick={markContacted}>{t('orgDashboard.detail.markContacted')}</button>
          )}
          {confirmRelease ? (
            <span className="hr-confirm">
              {t('orgDashboard.detail.releaseConfirm')}
              <button type="button" className="confirm-yes" onClick={release}>{t('orgDashboard.detail.releaseYes')}</button>
              <button type="button" className="confirm-no" onClick={() => setConfirmRelease(false)}>{t('common.cancel')}</button>
            </span>
          ) : (
            <button type="button" className="hr-release-btn" onClick={() => setConfirmRelease(true)}>{t('orgDashboard.detail.release')}</button>
          )}
        </div>
      </section>

      <RecommendedVolunteers requestId={request.id} />
    </div>
  );
}

function RecommendedVolunteers({ requestId }) {
  const { t } = useTranslation();
  const [volunteers, setVolunteers] = useState(null);

  useEffect(() => {
    apiFetch(`/api/help-requests/${requestId}/recommended-volunteers`)
      .then(res => (res.ok ? res.json() : []))
      .then(data => setVolunteers(Array.isArray(data) ? data : []))
      .catch(() => setVolunteers([]));
  }, [requestId]);

  return (
    <section className="hr-recommended" aria-labelledby="hr-recommended-title">
      <h3 id="hr-recommended-title" className="hr-recommended-title">{t('orgDashboard.recommended.heading')}</h3>
      <p className="hr-recommended-lead">{t('orgDashboard.recommended.lead')}</p>
      {volunteers === null ? (
        <p className="org-empty">{t('common.loading')}</p>
      ) : volunteers.length === 0 ? (
        <p className="org-empty">{t('orgDashboard.recommended.empty')}</p>
      ) : (
        <ul className="hr-list">
          {volunteers.map(v => (
            <li key={v.id} className="hr-card hr-volunteer">
              <div className="hr-avatar" aria-hidden="true">{v.firstName?.[0]}{v.lastName?.[0]}</div>
              <div className="hr-card-body">
                <div className="hr-volunteer-head">
                  <h4 className="hr-card-title">{v.firstName} {v.lastName}</h4>
                  <span className="hr-badge"><MdVerifiedUser aria-hidden="true" /> {t('orgDashboard.recommended.checked')}</span>
                </div>
                <p className="hr-card-meta">{matchReasons(t, v.match, { availableDays: v.availableDays, forOrganization: true }).join(' · ')}</p>
                {v.languages?.length > 0 && (
                  <p className="hr-card-meta">{t('orgDashboard.recommended.languages', { languages: languageList(t, v.languages) })}</p>
                )}
              </div>
              <div className="hr-score">
                <span className="hr-score-value">{v.match.score}%</span>
                <span className="hr-score-label">{t('matching.match')}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
