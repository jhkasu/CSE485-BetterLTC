import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose, MdWarning } from 'react-icons/md';
import apiFetch from './api';
import { HELP_TYPE_KEYS } from './helpTypes';

const TABS = ['all', 'New', 'Accepted', 'Contacted', 'attention'];
const STATUS_BADGE = { New: 'pending', Accepted: 'pending', Contacted: 'approved' };

export function requestNumber(id) {
  return `REQ-${String(id).padStart(3, '0')}`;
}

function AdminMatchingStatus() {
  const { t, i18n } = useTranslation();
  const [requests, setRequests] = useState(null);
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    apiFetch('/api/help-requests')
      .then(res => (res.ok ? res.json() : []))
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]));
  };

  useEffect(load, []);

  const formatDate = (value) => (value
    ? new Date(value).toLocaleDateString(i18n.language, { year: 'numeric', month: 'short', day: 'numeric' })
    : '—');
  const helpType = (value) => (HELP_TYPE_KEYS[value] ? t(HELP_TYPE_KEYS[value]) : value);
  const city = (value) => (value === 'Other' ? t('volunteer.otherCity') : value || '—');

  const counts = {
    all: requests?.length || 0,
    New: (requests || []).filter(r => r.status === 'New').length,
    Accepted: (requests || []).filter(r => r.status === 'Accepted').length,
    Contacted: (requests || []).filter(r => r.status === 'Contacted').length,
    attention: (requests || []).filter(r => r.alert).length,
  };
  const visible = (requests || []).filter(r => (
    tab === 'all' ? true : tab === 'attention' ? !!r.alert : r.status === tab
  ));

  const runAction = () => {
    const { action, request } = confirm;
    const call = action === 'release'
      ? apiFetch(`/api/help-requests/${request.id}/release`, { method: 'PUT' })
      : apiFetch(`/api/help-requests/${request.id}`, { method: 'DELETE' });
    call
      .then(res => {
        if (!res.ok) throw new Error('action failed');
        setConfirm(null);
        setSelected(null);
        load();
      })
      .catch(() => setError('common.genericError'));
  };

  const timeline = (r) => [
    { key: 'received', date: r.submittedAt },
    { key: 'accepted', date: r.acceptedAt },
    { key: 'contacted', date: r.contactedAt },
  ];

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">{t('adminDashboard.matching.heading')}</h2>
          <p className="admin-section-lead">{t('adminDashboard.matching.lead')}</p>
        </div>
      </div>

      <div className="admin-tabs" role="tablist" aria-label={t('adminDashboard.matching.heading')}>
        {TABS.map(key => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`admin-tab${tab === key ? ' admin-tab--active' : ''}${key === 'attention' && counts.attention > 0 ? ' admin-tab--alert' : ''}`}
            onClick={() => setTab(key)}
          >
            {t(`adminDashboard.matching.tabs.${key}`)} ({counts[key]})
          </button>
        ))}
      </div>

      {error && !confirm && <p className="admin-error" role="alert">{t(error)}</p>}

      {requests === null ? (
        <p className="admin-empty">{t('common.loading')}</p>
      ) : visible.length === 0 ? (
        <p className="admin-empty">{t('adminDashboard.matching.empty')}</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('adminDashboard.matching.request')}</th>
              <th>{t('adminDashboard.help.city')}</th>
              <th>{t('adminDashboard.help.helpType')}</th>
              <th>{t('common.status')}</th>
              <th>{t('adminDashboard.matching.organization')}</th>
              <th>{t('adminDashboard.help.submitted')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(r => (
              <tr key={r.id}>
                <td>
                  <strong>{requestNumber(r.id)}</strong>
                  <div className="admin-help-senior">{r.firstName} {r.lastName}</div>
                </td>
                <td>{city(r.city)}</td>
                <td>{helpType(r.helpType)}</td>
                <td>
                  <span className={`bg-badge ${STATUS_BADGE[r.status] || 'pending'}`}>
                    {t(`options.helpRequestStatus.${(r.status || 'New').toLowerCase()}`, { defaultValue: r.status })}
                  </span>
                  {r.alert && (
                    <div className="admin-alert-tag"><MdWarning aria-hidden="true" /> {t(`adminDashboard.matching.alerts.${r.alert}`)}</div>
                  )}
                </td>
                <td>{r.organizationName || '—'}</td>
                <td>{formatDate(r.submittedAt)}</td>
                <td>
                  <div className="admin-action-cell">
                    <button type="button" className="admin-action-btn approve" onClick={() => { setSelected(r); setError(''); }}>
                      {t('adminDashboard.matching.view')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal admin-modal-wide" role="dialog" aria-modal="true" aria-labelledby="match-detail-title" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 id="match-detail-title">{requestNumber(selected.id)} · {helpType(selected.helpType)}</h3>
              <button className="admin-modal-close" onClick={() => setSelected(null)} aria-label={t('common.cancel')}><MdClose /></button>
            </div>
            <div className="admin-modal-body">
              {selected.alert && (
                <p className="admin-alert-box"><MdWarning aria-hidden="true" /> {t(`adminDashboard.matching.alertHelp.${selected.alert}`)}</p>
              )}
              <dl className="admin-detail-list">
                <dt>{t('adminDashboard.matching.requester')}</dt>
                <dd>{selected.firstName} {selected.lastName}{selected.forFamilyMember && selected.seniorName ? ` · ${t('adminDashboard.help.forSenior', { name: selected.seniorName })}` : ''}</dd>
                <dt>{t('adminDashboard.help.contact')}</dt>
                <dd>
                  {selected.phone && <div><a href={`tel:${selected.phone.replace(/\D/g, '')}`}>{selected.phone}</a></div>}
                  {selected.email && <div><a href={`mailto:${selected.email}`}>{selected.email}</a></div>}
                  <div className="admin-help-senior">{t('orgDashboard.detail.preferred', { method: t(`getHelp.request.methods.${(selected.contactMethod || '').toLowerCase()}`, { defaultValue: selected.contactMethod }) })}</div>
                </dd>
                <dt>{t('adminDashboard.help.city')}</dt>
                <dd>{city(selected.city)}</dd>
                <dt>{t('adminDashboard.matching.organization')}</dt>
                <dd>{selected.organizationName || '—'}</dd>
                <dt>{t('adminDashboard.matching.history')}</dt>
                <dd>
                  <ul className="admin-timeline">
                    {timeline(selected).map(step => (
                      <li key={step.key} className={step.date ? 'admin-timeline--done' : ''}>
                        {t(`orgDashboard.detail.steps.${step.key}`)}: {formatDate(step.date)}
                      </li>
                    ))}
                  </ul>
                </dd>
              </dl>

              {confirm ? (
                <div className="admin-confirm-box">
                  <p>{t(`adminDashboard.matching.confirm.${confirm.action}`)}</p>
                  {error && <p className="admin-error" role="alert">{t(error)}</p>}
                  <div className="admin-form-actions">
                    <button className={`admin-save-btn${confirm.action === 'delete' ? ' admin-save-btn--danger' : ''}`} onClick={runAction}>
                      {t(`adminDashboard.matching.${confirm.action}`)}
                    </button>
                    <button className="admin-cancel-btn" onClick={() => setConfirm(null)}>{t('common.cancel')}</button>
                  </div>
                </div>
              ) : (
                <div className="admin-form-actions">
                  {selected.organizationId && (
                    <button className="admin-save-btn" onClick={() => setConfirm({ action: 'release', request: selected })}>{t('adminDashboard.matching.release')}</button>
                  )}
                  <button className="admin-cancel-btn admin-cancel-btn--danger" onClick={() => setConfirm({ action: 'delete', request: selected })}>{t('adminDashboard.matching.delete')}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMatchingStatus;
