import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd } from 'react-icons/md';
import apiFetch from './api';
import './OrgRoles.css';

export const MAX_ROLES = 10;
const DESCRIPTION_LIMIT = 500;
const EMPTY = { title: '', timeCommitment: '', description: '' };

function OrgRoles({ orgId }) {
  const { t } = useTranslation();
  const [roles, setRoles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const titleRef = useRef(null);

  useEffect(() => {
    apiFetch(`/api/organizations/${orgId}/roles`)
      .then(res => (res.ok ? res.json() : []))
      .then(setRoles)
      .catch(() => {});
  }, [orgId]);

  useEffect(() => {
    if (editingId !== null) titleRef.current?.focus();
  }, [editingId]);

  const startEdit = (role) => {
    setEditingId(role ? role.id : 'new');
    setForm(role ? { title: role.title, timeCommitment: role.timeCommitment, description: role.description } : EMPTY);
    setError('');
    setConfirmId(null);
  };

  const cancel = () => {
    setEditingId(null);
    setError('');
  };

  const save = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('orgDashboard.roles.titleRequired');
      return;
    }
    const isNew = editingId === 'new';
    setSaving(true);
    apiFetch(`/api/organizations/${orgId}/roles${isNew ? '' : `/${editingId}`}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then(res => {
        if (!res.ok) throw new Error('save failed');
        return res.json();
      })
      .then(saved => {
        setRoles(current => (isNew ? [...current, saved] : current.map(r => (r.id === saved.id ? saved : r))));
        setEditingId(null);
      })
      .catch(() => setError('orgDashboard.roles.saveFailed'))
      .finally(() => setSaving(false));
  };

  const remove = (id) => {
    apiFetch(`/api/organizations/${orgId}/roles/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('delete failed');
        setRoles(current => current.filter(r => r.id !== id));
        setConfirmId(null);
      })
      .catch(() => setError('common.genericError'));
  };

  const renderForm = () => (
    <form className="org-roles-form" onSubmit={save}>
      <label className="org-profile-label" htmlFor="role-title">
        {t('orgDashboard.roles.title')} <span aria-hidden="true">*</span>
      </label>
      <input
        id="role-title"
        ref={titleRef}
        className="org-profile-input"
        value={form.title}
        maxLength={100}
        required
        placeholder={t('orgDashboard.roles.titlePlaceholder')}
        onChange={e => setForm({ ...form, title: e.target.value })}
      />
      <label className="org-profile-label" htmlFor="role-time">{t('orgDashboard.roles.time')}</label>
      <input
        id="role-time"
        className="org-profile-input"
        value={form.timeCommitment}
        maxLength={100}
        placeholder={t('orgDashboard.roles.timePlaceholder')}
        onChange={e => setForm({ ...form, timeCommitment: e.target.value })}
      />
      <label className="org-profile-label" htmlFor="role-description">{t('orgDashboard.roles.description')}</label>
      <textarea
        id="role-description"
        className="org-profile-input"
        rows={3}
        value={form.description}
        maxLength={DESCRIPTION_LIMIT}
        placeholder={t('orgDashboard.roles.descriptionPlaceholder')}
        onChange={e => setForm({ ...form, description: e.target.value })}
      />
      <p className="org-roles-count">{form.description.length}/{DESCRIPTION_LIMIT}</p>
      {error && <p className="org-profile-error" role="alert">{t(error)}</p>}
      <div className="org-roles-form-actions">
        <button type="button" className="org-roles-secondary" onClick={cancel}>{t('common.cancel')}</button>
        <button type="submit" className="org-profile-save" disabled={saving}>{t('orgDashboard.roles.save')}</button>
      </div>
    </form>
  );

  return (
    <section className="org-roles" aria-labelledby="org-roles-title">
      <h2 id="org-roles-title" className="org-section-title org-profile-title">{t('orgDashboard.roles.heading')}</h2>
      <p className="org-profile-lead">{t('orgDashboard.roles.lead')}</p>
      <div className="org-profile-card">
        {roles.length === 0 && editingId === null && <p className="org-roles-empty">{t('orgDashboard.roles.empty')}</p>}
        {roles.length > 0 && (
          <ul className="org-roles-list">
            {roles.map(role => (
              <li key={role.id} className="org-role">
                {editingId === role.id ? renderForm() : (
                  <>
                    <div className="org-role-text">
                      <h3>{role.title}</h3>
                      {role.timeCommitment && <p className="org-role-time">{role.timeCommitment}</p>}
                      {role.description && <p className="org-role-description">{role.description}</p>}
                    </div>
                    <div className="org-role-actions">
                      {confirmId === role.id ? (
                        <>
                          <span>{t('orgDashboard.roles.deleteConfirm')}</span>
                          <button type="button" className="org-roles-danger" onClick={() => remove(role.id)}>{t('common.delete')}</button>
                          <button type="button" className="org-roles-secondary" onClick={() => setConfirmId(null)}>{t('common.cancel')}</button>
                        </>
                      ) : (
                        <>
                          <button type="button" className="org-roles-secondary" onClick={() => startEdit(role)} aria-label={t('orgDashboard.roles.editLabel', { title: role.title })}>
                            {t('common.edit')}
                          </button>
                          <button type="button" className="org-roles-secondary" onClick={() => setConfirmId(role.id)} aria-label={t('orgDashboard.roles.deleteLabel', { title: role.title })}>
                            {t('common.delete')}
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
        {editingId === 'new' && renderForm()}
        {editingId === null && (roles.length < MAX_ROLES ? (
          <button type="button" className="org-roles-add" onClick={() => startEdit(null)}>
            <MdAdd aria-hidden="true" /> {t('orgDashboard.roles.add')}
          </button>
        ) : <p className="org-profile-hint">{t('orgDashboard.roles.limit', { count: MAX_ROLES })}</p>)}
        {editingId === null && error && <p className="org-profile-error" role="alert">{t(error)}</p>}
      </div>
    </section>
  );
}

export default OrgRoles;
