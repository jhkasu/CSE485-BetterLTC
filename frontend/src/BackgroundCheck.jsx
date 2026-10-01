import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdCheck, MdVerifiedUser, MdCloudUpload, MdDescription, MdHourglassTop, MdErrorOutline } from 'react-icons/md';
import apiFetch from './api';
import './BackgroundCheck.css';

const STEPS = ['consent', 'apply', 'upload', 'review', 'approved'];
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png'];
const EXPIRING_DAYS = 30;

export function daysUntil(dateText) {
  if (!dateText) return null;
  const [y, m, d] = dateText.split('-').map(Number);
  const target = Date.UTC(y, m - 1, d);
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((target - today) / 86400000);
}

export function backgroundCheckStep(status, showUpload) {
  switch (status) {
    case 'ConsentGiven': return showUpload ? 2 : 1;
    case 'Rejected':
    case 'Expired': return 2;
    case 'Submitted': return 3;
    case 'Approved': return 4;
    default: return 0;
  }
}

function BackgroundCheck({ onChange }) {
  const { t, i18n } = useTranslation();
  const [check, setCheck] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    apiFetch('/api/background-checks/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => setCheck(data || { status: 'NotStarted' }))
      .catch(() => setCheck({ status: 'NotStarted' }));
  }, []);

  const updateCheck = (data) => {
    setCheck(data);
    if (onChange) onChange(data);
  };

  const formatDate = (value) => (value
    ? new Date(value.length === 10 ? `${value}T12:00:00Z` : value).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' })
    : '');

  const giveConsent = () => {
    setBusy(true);
    setError('');
    apiFetch('/api/background-checks/me/consent', { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error('consent failed');
        return res.json();
      })
      .then(updateCheck)
      .catch(() => setError('common.genericError'))
      .finally(() => setBusy(false));
  };

  const chooseFile = (e) => {
    const chosen = e.target.files[0];
    setError('');
    if (!chosen) return;
    if (!ACCEPTED.includes(chosen.type)) {
      setError('dashboard.bgCheck.errors.type');
      setFile(null);
      return;
    }
    if (chosen.size > MAX_SIZE) {
      setError('dashboard.bgCheck.errors.size');
      setFile(null);
      return;
    }
    setFile(chosen);
  };

  const upload = () => {
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    setBusy(true);
    setError('');
    apiFetch('/api/background-checks/me/document', { method: 'POST', body })
      .then(res => {
        if (!res.ok) throw new Error('upload failed');
        return res.json();
      })
      .then(data => {
        setFile(null);
        setShowUpload(false);
        updateCheck(data);
      })
      .catch(() => setError('dashboard.bgCheck.errors.upload'))
      .finally(() => setBusy(false));
  };

  const removeDocument = () => {
    setBusy(true);
    setError('');
    apiFetch('/api/background-checks/me/document', { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('remove failed');
        return res.json();
      })
      .then(data => {
        setConfirmRemove(false);
        setShowUpload(true);
        updateCheck(data);
      })
      .catch(() => setError('dashboard.bgCheck.errors.remove'))
      .finally(() => setBusy(false));
  };

  if (!check) return <p className="dashboard-placeholder">{t('common.loading')}</p>;

  const step = backgroundCheckStep(check.status, showUpload);
  const daysLeft = daysUntil(check.expiresOn);
  const expiringSoon = check.status === 'Approved' && daysLeft !== null && daysLeft <= EXPIRING_DAYS;

  const uploadCard = (
    <div className="bgc-card">
      <div className="bgc-card-icon" aria-hidden="true"><MdCloudUpload /></div>
      <div className="bgc-card-body">
        <h3>{t('dashboard.bgCheck.steps.upload')}</h3>
        {check.status === 'Rejected' && (
          <p className="bgc-alert" role="alert"><MdErrorOutline aria-hidden="true" /> {t('dashboard.bgCheck.rejected', { reason: check.rejectionReason })}</p>
        )}
        {check.status === 'Expired' && (
          <p className="bgc-alert" role="alert"><MdErrorOutline aria-hidden="true" /> {t('dashboard.bgCheck.expired', { date: formatDate(check.expiresOn) })}</p>
        )}
        <p>{t('dashboard.bgCheck.uploadText')}</p>
        <label className="bgc-file" htmlFor="bgc-file-input">
          <MdDescription aria-hidden="true" />
          <span>{file ? file.name : t('dashboard.bgCheck.selectFile')}</span>
        </label>
        <input id="bgc-file-input" className="visually-hidden" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={chooseFile} />
        <button type="button" className="bgc-btn" onClick={upload} disabled={!file || busy}>
          {busy ? t('dashboard.bgCheck.uploading') : t('dashboard.bgCheck.submit')}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <h2 className="dashboard-section-title">{t('dashboard.nav.bgCheck')}</h2>
      <p className="bgc-lead">{t('dashboard.bgCheck.lead')}</p>

      <ol className="bgc-steps">
        {STEPS.map((key, i) => {
          const done = i < step || (i === 4 && check.status === 'Approved');
          const current = i === step && !done;
          return (
            <li key={key} className={`bgc-step${done ? ' bgc-step--done' : ''}${current ? ' bgc-step--current' : ''}`} aria-current={current ? 'step' : undefined}>
              <span className="bgc-step-dot" aria-hidden="true">{done ? <MdCheck /> : i + 1}</span>
              <span className="bgc-step-label">{t(`dashboard.bgCheck.steps.${key}`)}</span>
            </li>
          );
        })}
      </ol>

      {error && <p className="bgc-error" role="alert">{t(error)}</p>}

      {check.status === 'NotStarted' && (
        <div className="bgc-card">
          <div className="bgc-card-icon" aria-hidden="true"><MdVerifiedUser /></div>
          <div className="bgc-card-body">
            <h3>{t('dashboard.bgCheck.steps.consent')}</h3>
            <p>{t('dashboard.bgCheck.consentText')}</p>
            <button type="button" className="bgc-btn" onClick={giveConsent} disabled={busy}>{t('dashboard.bgCheck.start')}</button>
          </div>
        </div>
      )}

      {check.status === 'ConsentGiven' && !showUpload && (
        <div className="bgc-card">
          <div className="bgc-card-icon" aria-hidden="true"><MdDescription /></div>
          <div className="bgc-card-body">
            <h3>{t('dashboard.bgCheck.steps.apply')}</h3>
            <p>{t('dashboard.bgCheck.applyText')}</p>
            <ul className="bgc-list">
              <li>{t('dashboard.bgCheck.applyItem1')}</li>
              <li>{t('dashboard.bgCheck.applyItem2')}</li>
              <li>{t('dashboard.bgCheck.applyItem3')}</li>
            </ul>
            <button type="button" className="bgc-btn" onClick={() => setShowUpload(true)}>{t('dashboard.bgCheck.haveDocument')}</button>
          </div>
        </div>
      )}

      {((check.status === 'ConsentGiven' && showUpload) || check.status === 'Rejected' || check.status === 'Expired') && uploadCard}

      {check.status === 'Submitted' && (
        <div className="bgc-card">
          <div className="bgc-card-icon bgc-card-icon--waiting" aria-hidden="true"><MdHourglassTop /></div>
          <div className="bgc-card-body">
            <h3>{t('dashboard.bgCheck.steps.review')}</h3>
            <p>{t('dashboard.bgCheck.reviewText', { file: check.fileName, date: formatDate(check.submittedAt) })}</p>
            {confirmRemove ? (
              <div className="bgc-confirm" role="alertdialog" aria-label={t('dashboard.bgCheck.removeConfirm')}>
                <p>{t('dashboard.bgCheck.removeConfirm')}</p>
                <button type="button" className="bgc-btn bgc-btn--danger" onClick={removeDocument} disabled={busy}>{t('dashboard.bgCheck.removeYes')}</button>
                <button type="button" className="bgc-btn-link" onClick={() => setConfirmRemove(false)}>{t('common.cancel')}</button>
              </div>
            ) : (
              <button type="button" className="bgc-btn-link" onClick={() => setConfirmRemove(true)}>{t('dashboard.bgCheck.remove')}</button>
            )}
          </div>
        </div>
      )}

      {check.status === 'Approved' && (
        <div className="bgc-card bgc-card--approved">
          <div className="bgc-card-icon" aria-hidden="true"><MdVerifiedUser /></div>
          <div className="bgc-card-body">
            <h3>{t('dashboard.bgCheck.approvedTitle')}</h3>
            <p>{t('dashboard.bgCheck.approvedText', { date: formatDate(check.expiresOn) })}</p>
            {expiringSoon && (
              <p className="bgc-alert" role="alert"><MdErrorOutline aria-hidden="true" /> {t('dashboard.bgCheck.expiringSoon', { count: daysLeft })}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default BackgroundCheck;
