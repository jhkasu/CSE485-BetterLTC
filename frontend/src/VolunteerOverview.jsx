import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MdRecommend, MdCalendarToday, MdAccessTime, MdNotifications, MdCheckCircle,
  MdCancel, MdVerifiedUser, MdErrorOutline, MdArrowForward,
} from 'react-icons/md';
import apiFetch from './api';
import { isMatchingProfileComplete } from './VolunteerMatchingProfile';
import { daysUntil } from './BackgroundCheck';
import { matchLabelKey } from './MatchPanel';
import './VolunteerOverview.css';

const RECOMMEND_MIN_SCORE = 50;
const EXPIRING_DAYS = 30;

const NOTIFICATION_ICONS = {
  ApplicationApproved: <MdCheckCircle />,
  ApplicationRejected: <MdCancel />,
  HoursRecorded: <MdAccessTime />,
  BackgroundCheckApproved: <MdVerifiedUser />,
  BackgroundCheckRejected: <MdErrorOutline />,
  BackgroundCheckExpiring: <MdErrorOutline />,
};

const SHORT_DAY_KEYS = {
  Monday: 'mon', Tuesday: 'tue', Wednesday: 'wed', Thursday: 'thu', Friday: 'fri', Saturday: 'sat', Sunday: 'sun',
};

function relativeTime(value, language) {
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const units = [['day', 86400], ['hour', 3600], ['minute', 60]];
  const format = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  }
  return format.format(0, 'minute');
}

function VolunteerOverview({ user, volunteer, applications, bgCheck, onNavigate }) {
  const { t, i18n } = useTranslation();
  const [recommended, setRecommended] = useState(null);
  const [notifications, setNotifications] = useState({ items: [], unread: 0 });

  useEffect(() => {
    Promise.all([
      apiFetch('/api/listings').then(res => (res.ok ? res.json() : [])),
      apiFetch('/api/listings/matches').then(res => (res.ok ? res.json() : [])),
    ])
      .then(([listings, matches]) => {
        const byId = Object.fromEntries((Array.isArray(listings) ? listings : []).map(l => [l.id, l]));
        const applied = new Set(applications.map(a => a.listingId));
        setRecommended((Array.isArray(matches) ? matches : [])
          .filter(m => m.match.score >= RECOMMEND_MIN_SCORE && byId[m.listingId] && !applied.has(m.listingId))
          .sort((a, b) => b.match.score - a.match.score)
          .map(m => ({ ...byId[m.listingId], score: m.match.score })));
      })
      .catch(() => setRecommended([]));
  }, [applications]);

  useEffect(() => {
    apiFetch('/api/notifications/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (data) setNotifications(data); })
      .catch(() => {});
  }, []);

  const markAllRead = () => {
    apiFetch('/api/notifications/me/read', { method: 'PUT' })
      .then(res => {
        if (res.ok) setNotifications(n => ({ unread: 0, items: n.items.map(item => ({ ...item, read: true })) }));
      })
      .catch(() => {});
  };

  const bgStatus = bgCheck?.status || 'NotStarted';
  const daysLeft = daysUntil(bgCheck?.expiresOn);
  const expiringSoon = bgStatus === 'Approved' && daysLeft !== null && daysLeft <= EXPIRING_DAYS;
  const upcoming = applications.filter(a => a.status === 'Approved');
  const totalHours = applications.filter(a => a.status === 'Completed').reduce((sum, a) => sum + (a.hoursServed || 0), 0);
  const formatDate = (value) => new Date(`${value}T12:00:00Z`).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' });
  const scheduleText = (a) => {
    const range = [a.startDate, a.endDate].filter(Boolean).map(formatDate).join(' – ');
    const days = (a.days || '').split(',').map(d => d.trim()).filter(Boolean)
      .map(d => t(`options.daysShort.${SHORT_DAY_KEYS[d]}`, { defaultValue: d })).join(', ');
    return [days, range].filter(Boolean).join(' · ') || t('dashboard.shifts.noSchedule');
  };

  const notificationText = (n) => {
    if (n.type === 'BackgroundCheckApproved') return t('dashboard.notifications.types.BackgroundCheckApproved', { date: formatDate(n.detail) });
    return t(`dashboard.notifications.types.${n.type}`, { subject: n.subject, detail: n.detail, defaultValue: n.subject });
  };

  const notificationItems = [
    ...(expiringSoon ? [{ id: 'expiring', type: 'BackgroundCheckExpiring', read: false, text: t('dashboard.bgCheck.expiringSoon', { count: daysLeft }) }] : []),
    ...notifications.items.map(n => ({ ...n, text: notificationText(n) })),
  ];

  return (
    <>
      <h2 className="dashboard-section-title">{t('dashboard.overview.welcome', { name: user?.firstName || '' })}</h2>
      <p className="vo-lead">{t('dashboard.overview.lead')}</p>

      {volunteer && !isMatchingProfileComplete(volunteer) && (
        <div className="vo-alert">
          <div>
            <strong>{t('dashboard.matching.reminderTitle')}</strong>
            <p>{t('dashboard.matching.reminderText')}</p>
          </div>
          <button type="button" className="overview-card-action" onClick={() => onNavigate('matching')}>{t('dashboard.matching.reminderButton')}</button>
        </div>
      )}

      {bgStatus !== 'Approved' && (
        <div className="vo-alert">
          <div>
            <strong>{t('dashboard.bgCheck.heading')}: {t(`dashboard.bgCheck.status.${bgStatus}`)}</strong>
            <p>{t(`dashboard.bgCheck.hint.${bgStatus}`)}</p>
          </div>
          {bgStatus !== 'Submitted' && (
            <button type="button" className="overview-card-action" onClick={() => onNavigate('bgCheck')}>{t('dashboard.bgCheck.goTo')}</button>
          )}
        </div>
      )}

      <div className="vo-stats">
        <div className="vo-stat">
          <span className="vo-stat-label"><MdRecommend aria-hidden="true" /> {t('dashboard.overview.recommended')}</span>
          <span className="vo-stat-value">{recommended === null ? '–' : recommended.length}</span>
          <Link className="vo-stat-link" to="/volunteer">{t('dashboard.overview.viewAll')}</Link>
        </div>
        <div className="vo-stat">
          <span className="vo-stat-label"><MdCalendarToday aria-hidden="true" /> {t('dashboard.nav.shifts')}</span>
          <span className="vo-stat-value">{upcoming.length}</span>
          <button type="button" className="vo-stat-link" onClick={() => onNavigate('shifts')}>{t('dashboard.overview.viewSchedule')}</button>
        </div>
        <div className="vo-stat">
          <span className="vo-stat-label"><MdAccessTime aria-hidden="true" /> {t('dashboard.history.totalHours')}</span>
          <span className="vo-stat-value">{totalHours}</span>
          <button type="button" className="vo-stat-link" onClick={() => onNavigate('history')}>{t('dashboard.overview.viewHistory')}</button>
        </div>
      </div>

      <div className="vo-panels">
        <section className="vo-panel" aria-labelledby="vo-upcoming-title">
          <h3 id="vo-upcoming-title" className="vo-panel-title">{t('dashboard.nav.shifts')}</h3>
          {upcoming.length === 0 ? (
            <p className="vo-empty">{t('dashboard.shifts.empty')}</p>
          ) : (
            <ul className="vo-list">
              {upcoming.slice(0, 3).map(a => (
                <li key={a.id}>
                  <strong>{a.listingTitle}</strong>
                  <span>{a.orgName}{a.location ? ` · ${a.location}` : ''}</span>
                  <span>{scheduleText(a)}</span>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="vo-panel-link" onClick={() => onNavigate('shifts')}>{t('dashboard.overview.viewAll')} <MdArrowForward aria-hidden="true" /></button>
        </section>

        <section className="vo-panel" aria-labelledby="vo-notifications-title">
          <div className="vo-panel-head">
            <h3 id="vo-notifications-title" className="vo-panel-title">
              <MdNotifications aria-hidden="true" /> {t('dashboard.notifications.heading')}
              {notifications.unread > 0 && <span className="vo-unread">{notifications.unread}</span>}
            </h3>
            {notifications.unread > 0 && (
              <button type="button" className="vo-panel-link" onClick={markAllRead}>{t('dashboard.notifications.markRead')}</button>
            )}
          </div>
          {notificationItems.length === 0 ? (
            <p className="vo-empty">{t('dashboard.notifications.empty')}</p>
          ) : (
            <ul className="vo-notifications">
              {notificationItems.map(n => (
                <li key={n.id} className={n.read ? '' : 'vo-notification--unread'}>
                  <span className={`vo-notification-icon vo-notification-icon--${n.type}`} aria-hidden="true">{NOTIFICATION_ICONS[n.type]}</span>
                  <span>
                    {n.text}
                    {n.createdAt && <span className="vo-time">{relativeTime(n.createdAt, i18n.language)}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="vo-panel vo-recommended" aria-labelledby="vo-recommended-title">
        <h3 id="vo-recommended-title" className="vo-panel-title">{t('dashboard.overview.recommended')}</h3>
        {recommended === null ? (
          <p className="vo-empty">{t('common.loading')}</p>
        ) : recommended.length === 0 ? (
          <p className="vo-empty">{t(volunteer && !isMatchingProfileComplete(volunteer) ? 'matching.setupPrompt' : 'dashboard.overview.noRecommendations')}</p>
        ) : (
          <ul className="vo-list vo-list--recommended">
            {recommended.slice(0, 3).map(l => (
              <li key={l.id}>
                <Link to={`/volunteer/${l.id}`} className="vo-rec-link">
                  <span className="vo-rec-score">{l.score}%</span>
                  <span className="vo-rec-body">
                    <strong>{l.listingTitle}</strong>
                    <span>{l.orgName} · {l.location} · {t(matchLabelKey(l.score))}</span>
                  </span>
                  <MdArrowForward aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export default VolunteerOverview;
