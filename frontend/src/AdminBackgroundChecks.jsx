import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose, MdDescription } from 'react-icons/md';
import apiFetch from './api';

const STATUS_FILTERS = ['all', 'Submitted', 'Approved', 'Rejected', 'Expired'];
const BADGE_CLASS = { Approved: 'approved', Submitted: 'pending', ConsentGiven: 'pending', Rejected: 'rejected', Expired: 'rejected' };

function defaultExpiry() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 3);
  return date.toISOString().slice(0, 10);
}

function AdminBackgroundChecks() {
  const { t, i18n } = useTranslation();
  const [checks, setChecks] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dialog, setDialog] = useState(null);
  const [expiresOn, setExpiresOn] = useState(defaultExpiry);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    apiFetch('/api/background-checks')
      .then(res => (res.ok ? res.json() : []))
      .then(data => setChecks(Array.isArray(data) ? data : []))
      .catch(() => setChecks([]));
  };

  useEffect(load, []);

  const formatDate = (value) => (value
    ? new Date(value.length === 10 ? `${value}T12:00:00Z` : value).toLocaleDateString(i18n.language, { year: 'numeric', month: 'short', day: 'numeric' })
    : '—');

  const openDocument = (check) => {
    setError('');
    const tab = window.open('', '_blank');
    apiFetch(`/api/background-checks/${check.id}/document`)
      .then(res => {
        if (!res.ok) throw new Error('document failed');
        return res.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        if (tab) tab.location.href = url;
        else window.location.assign(url);
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      })
      .catch(() => {
        if (tab) tab.close();
        setError('adminDashboard.bgChecks.openFailed');
      });
  };

  const openDialog = (mode, check) => {
    setDialog({ mode, check });
    setExpiresOn(defaultExpiry());
    setReason('');
    setError('');
  };

  const submitDialog = () => {
    const { mode, check } = dialog;
    if (mode === 'reject' && !reason.trim()) {
      setError('adminDashboard.bgChecks.reasonRequired');
      return;
    }
    if (mode === 'approve' && (!expiresOn || expiresOn <= new Date().toISOString().slice(0, 10))) {
      setError('adminDashboard.bgChecks.expiryInFuture');
      return;
    }
    apiFetch(`/api/background-checks/${check.id}/${mode}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mode === 'approve' ? { expiresOn } : { reason: reason.trim() }),
    })
      .then(res => {
        if (!res.ok) throw new Error('review failed');
        setDialog(null);
        load();
      })
      .catch(() => setError('common.genericError'));
  };

  const visible = (checks || []).filter(c => filter === 'all' || c.status === filter);
  const counts = (checks || []).reduce((acc, c) => ({ ...acc, [c.status]: (acc[c.status] || 0) + 1 }), {});

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">{t('adminDashboard.bgChecks.heading')}</h2>
          <p className="admin-section-lead">{t('adminDashboard.bgChecks.lead')}</p>
        </div>
        <label className="admin-filter">
          <span>{t('adminDashboard.bgChecks.filter')}</span>
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            {STATUS_FILTERS.map(status => (
              <option key={status} value={status}>
                {status === 'all'
                  ? t('adminDashboard.bgChecks.all', { count: checks?.length || 0 })
                  : `${t(`dashboard.bgCheck.status.${status}`)} (${counts[status] || 0})`}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && !dialog && <p className="admin-error" role="alert">{t(error)}</p>}

      {checks === null ? (
        <p className="admin-empty">{t('common.loading')}</p>
      ) : visible.length === 0 ? (
        <p className="admin-empty">{t('adminDashboard.bgChecks.empty')}</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('common.name')}</th>
              <th>{t('adminDashboard.bgChecks.document')}</th>
              <th>{t('common.status')}</th>
              <th>{t('adminDashboard.bgChecks.submitted')}</th>
              <th>{t('adminDashboard.bgChecks.expires')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(check => (
              <tr key={check.id}>
                <td>
                  {check.volunteerName}
                  <div className="admin-help-senior">{check.volunteerEmail}</div>
                </td>
                <td>
                  {check.fileName ? (
                    <button type="button" className="admin-doc-link" onClick={() => openDocument(check)}>
                      <MdDescription aria-hidden="true" /> {check.fileName}
                    </button>
                  ) : '—'}
                </td>
                <td>
                  <span className={`bg-badge ${BADGE_CLASS[check.status] || 'pending'}`}>{t(`dashboard.bgCheck.status.${check.status}`)}</span>
                  {check.status === 'Rejected' && check.rejectionReason && (
                    <div className="admin-help-senior">{check.rejectionReason}</div>
                  )}
                </td>
                <td>{formatDate(check.submittedAt)}</td>
                <td>
                  {formatDate(check.expiresOn)}
                  {check.expiringSoon && <div><span className="bg-badge pending">{t('adminDashboard.bgChecks.expiringSoon')}</span></div>}
                </td>
                <td>
                  <div className="admin-action-cell">
                    {check.fileName && (check.status === 'Submitted' || check.status === 'Rejected') && (
                      <button type="button" className="admin-action-btn approve" onClick={() => openDialog('approve', check)}>{t('adminDashboard.bgChecks.approve')}</button>
                    )}
                    {check.fileName && (check.status === 'Submitted' || check.status === 'Approved') && (
                      <button type="button" className="admin-action-btn revoke" onClick={() => openDialog('reject', check)}>{t('adminDashboard.bgChecks.reject')}</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {dialog && (
        <div className="admin-modal-overlay" onClick={() => setDialog(null)}>
          <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="bgc-dialog-title" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 id="bgc-dialog-title">
                {t(dialog.mode === 'approve' ? 'adminDashboard.bgChecks.approveTitle' : 'adminDashboard.bgChecks.rejectTitle', { name: dialog.check.volunteerName })}
              </h3>
              <button className="admin-modal-close" onClick={() => setDialog(null)} aria-label={t('common.cancel')}><MdClose /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form">
                {dialog.mode === 'approve' ? (
                  <>
                    <label htmlFor="bgc-expires">{t('adminDashboard.bgChecks.expiresOn')}</label>
                    <input id="bgc-expires" type="date" value={expiresOn} onChange={e => { setExpiresOn(e.target.value); setError(''); }} />
                  </>
                ) : (
                  <>
                    <label htmlFor="bgc-reason">{t('adminDashboard.bgChecks.reason')}</label>
                    <textarea id="bgc-reason" rows={3} maxLength={500} value={reason} onChange={e => { setReason(e.target.value); setError(''); }} placeholder={t('adminDashboard.bgChecks.reasonPlaceholder')} />
                  </>
                )}
                {error && <p className="admin-error" role="alert">{t(error)}</p>}
                <div className="admin-form-actions">
                  <button className="admin-save-btn" onClick={submitDialog}>
                    {t(dialog.mode === 'approve' ? 'adminDashboard.bgChecks.approve' : 'adminDashboard.bgChecks.reject')}
                  </button>
                  <button className="admin-cancel-btn" onClick={() => setDialog(null)}>{t('common.cancel')}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBackgroundChecks;
