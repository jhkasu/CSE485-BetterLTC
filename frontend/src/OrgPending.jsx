import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiFetch from './api';
import RegistryFields from './RegistryFields';
import { REGISTRY_TYPES, normalizeRegistryNumber, registryError } from './registry';
import './OrgPending.css';

function OrgPending({ org, onUpdated, onLogout }) {
  const { t } = useTranslation();
  const rejected = !!org?.rejectionReason;
  const missing = !!org && !org.registryNumber;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const showForm = !!org && (editing || rejected || missing);
  const typeOption = REGISTRY_TYPES.find(option => option.value === org?.registryType);
  const values = form || { registryType: org?.registryType || '', registryNumber: org?.registryNumber || '' };

  const startEdit = () => {
    setForm(null);
    setEditing(true);
    setSent(false);
  };

  const submit = (e) => {
    e.preventDefault();
    const problem = registryError(values.registryType, values.registryNumber);
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    apiFetch(`/api/organizations/${org.id}/registry`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registryType: values.registryType, registryNumber: normalizeRegistryNumber(values.registryNumber) }),
    })
      .then(res => {
        if (!res.ok) throw new Error('save failed');
        return res.json();
      })
      .then(saved => {
        onUpdated(saved);
        setForm(null);
        setEditing(false);
        setSent(true);
      })
      .catch(() => setError('common.genericError'))
      .finally(() => setSaving(false));
  };

  return (
    <div className="org-page">
      <div className="org-pending-wrap">
        <div className="org-pending-box">
          <h2>{t(rejected ? 'orgDashboard.pending.rejectedHeading' : 'orgDashboard.pending.heading')}</h2>
          {rejected ? (
            <>
              <p>{t('orgDashboard.pending.rejectedText')}</p>
              <p className="org-pending-reason"><strong>{t('orgDashboard.pending.reason')}</strong> {org.rejectionReason}</p>
            </>
          ) : (
            <>
              <p>{t('orgDashboard.pending.text')}</p>
              <p>{t('orgDashboard.pending.notify')}</p>
            </>
          )}

          {sent && <p className="org-pending-sent" role="status">{t('orgDashboard.pending.sent')}</p>}

          {org && !showForm && (
            <div className="org-pending-registry">
              <p>
                <strong>{t('registry.numberLabel')}:</strong> {org.registryNumber}
                {typeOption && <> ({t(typeOption.labelKey)})</>}
              </p>
              <button type="button" className="org-pending-link" onClick={startEdit}>{t('orgDashboard.pending.change')}</button>
            </div>
          )}

          {showForm && (
            <form className="org-pending-form" onSubmit={submit} noValidate>
              {missing && !rejected && <p>{t('orgDashboard.pending.missing')}</p>}
              <RegistryFields
                idPrefix="pending-registry"
                type={values.registryType}
                number={values.registryNumber}
                error={error}
                onChange={changes => { setForm({ ...values, ...changes }); setError(''); }}
              />
              <button type="submit" className="org-pending-submit" disabled={saving}>{t('orgDashboard.pending.submit')}</button>
            </form>
          )}

          <button className="org-cancel-btn" onClick={onLogout}>{t('common.logOut')}</button>
        </div>
      </div>
    </div>
  );
}

export default OrgPending;
