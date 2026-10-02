import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd, MdClose, MdDelete, MdEdit } from 'react-icons/md';
import apiFetch from './api';
import { RESOURCE_AUDIENCES, RESOURCE_TOPICS, formatFileSize, resourceFileError } from './resourceOptions';

const EMPTY_FORM = { title: '', description: '', audience: 'Organizations', topic: 'Onboarding', file: null };

function AdminResources() {
  const { t } = useTranslation();
  const [resources, setResources] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = () => {
    apiFetch('/api/resources')
      .then(res => (res.ok ? res.json() : []))
      .then(data => setResources(Array.isArray(data) ? data : []))
      .catch(() => setResources([]));
  };

  useEffect(load, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setError('');
    setModal({ mode: 'add' });
  };

  const openEdit = (item) => {
    setForm({ title: item.title, description: item.description, audience: item.audience, topic: item.topic, file: null });
    setError('');
    setModal({ mode: 'edit', item });
  };

  const chooseFile = (e) => {
    const file = e.target.files[0] || null;
    const fileError = resourceFileError(file);
    setError(fileError);
    setForm(f => ({ ...f, file: fileError ? null : file }));
  };

  const save = () => {
    if (!form.title.trim()) {
      setError('resources.errors.title');
      return;
    }
    if (modal.mode === 'add' && !form.file) {
      setError('resources.errors.file');
      return;
    }
    const body = new FormData();
    body.append('title', form.title.trim());
    body.append('description', form.description.trim());
    body.append('audience', form.audience);
    body.append('topic', form.topic);
    if (form.file) body.append('file', form.file);
    setBusy(true);
    setError('');
    const request = modal.mode === 'add'
      ? apiFetch('/api/resources', { method: 'POST', body })
      : apiFetch(`/api/resources/${modal.item.id}`, { method: 'PUT', body });
    request
      .then(res => {
        if (!res.ok) throw new Error('save failed');
        setModal(null);
        load();
      })
      .catch(() => setError('resources.errors.save'))
      .finally(() => setBusy(false));
  };

  const remove = (id) => {
    apiFetch(`/api/resources/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('delete failed');
        setDeleteId(null);
        load();
      })
      .catch(() => {});
  };

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">{t('resources.admin.heading')}</h2>
          <p className="admin-section-lead">{t('resources.admin.lead')}</p>
        </div>
        <button className="admin-add-btn" onClick={openAdd}><MdAdd /> {t('resources.admin.add')}</button>
      </div>

      {resources === null ? (
        <p className="admin-empty">{t('common.loading')}</p>
      ) : resources.length === 0 ? (
        <p className="admin-empty">{t('resources.empty')}</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('common.title')}</th>
              <th>{t('resources.audience')}</th>
              <th>{t('resources.topic')}</th>
              <th>{t('resources.file')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(r => (
              <tr key={r.id}>
                <td>{r.title}</td>
                <td>{t(`resources.audiences.${r.audience}`)}</td>
                <td>{t(`resources.topics.${r.topic}`)}</td>
                <td>{r.fileName}<div className="admin-help-senior">{r.fileType} · {formatFileSize(r.fileSize)}</div></td>
                <td>
                  <div className="admin-action-cell">
                    {deleteId === r.id ? (
                      <div className="delete-confirm-row">
                        <span>{t('resources.admin.deleteConfirm')}</span>
                        <button className="confirm-yes" onClick={() => remove(r.id)}>{t('common.delete')}</button>
                        <button className="confirm-no" onClick={() => setDeleteId(null)}>{t('common.cancel')}</button>
                      </div>
                    ) : (
                      <>
                        <button className="admin-action-btn edit" onClick={() => openEdit(r)} aria-label={t('resources.admin.editOf', { title: r.title })}><MdEdit /></button>
                        <button className="admin-action-btn delete" onClick={() => setDeleteId(r.id)} aria-label={t('resources.admin.deleteOf', { title: r.title })}><MdDelete /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="resource-modal-title" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 id="resource-modal-title">{modal.mode === 'add' ? t('resources.admin.add') : t('resources.admin.edit')}</h3>
              <button className="admin-modal-close" onClick={() => setModal(null)} aria-label={t('common.cancel')}><MdClose /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form">
                <label htmlFor="resource-title">{t('common.title')}</label>
                <input id="resource-title" value={form.title} maxLength={200} onChange={e => setForm({ ...form, title: e.target.value })} />
                <label htmlFor="resource-description">{t('common.description')}</label>
                <textarea id="resource-description" rows={3} maxLength={500} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <label htmlFor="resource-audience">{t('resources.audience')}</label>
                <select id="resource-audience" value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}>
                  {RESOURCE_AUDIENCES.map(a => <option key={a} value={a}>{t(`resources.audiences.${a}`)}</option>)}
                </select>
                <label htmlFor="resource-topic">{t('resources.topic')}</label>
                <select id="resource-topic" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}>
                  {RESOURCE_TOPICS.map(topic => <option key={topic} value={topic}>{t(`resources.topics.${topic}`)}</option>)}
                </select>
                <label htmlFor="resource-file">{modal.mode === 'add' ? t('resources.file') : t('resources.admin.replaceFile')}</label>
                <input id="resource-file" type="file" accept=".pdf,.docx" onChange={chooseFile} />
                <p className="admin-help-senior">{modal.mode === 'edit' ? t('resources.admin.currentFile', { name: modal.item.fileName }) : t('resources.admin.fileHint')}</p>
                {error && <p className="admin-error" role="alert">{t(error)}</p>}
                <div className="admin-form-actions">
                  <button className="admin-save-btn" onClick={save} disabled={busy}>{t('common.save')}</button>
                  <button className="admin-cancel-btn" onClick={() => setModal(null)}>{t('common.cancel')}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminResources;
