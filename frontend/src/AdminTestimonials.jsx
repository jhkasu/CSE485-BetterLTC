import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd, MdClose, MdDelete, MdEdit } from 'react-icons/md';
import apiFetch from './api';

export const TESTIMONIAL_ROLES = ['Volunteer', 'Organization', 'Family'];
const PHOTO_TYPES = ['image/jpeg', 'image/png'];
const PHOTO_MAX_SIZE = 2 * 1024 * 1024;
const EMPTY_FORM = { quoteEn: '', quoteFr: '', name: '', role: 'Volunteer', city: '', isVisible: true };

function AdminTestimonials() {
  const { t } = useTranslation();
  const [items, setItems] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photo, setPhoto] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = () => {
    apiFetch('/api/testimonials/all')
      .then(res => (res.ok ? res.json() : []))
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  };

  useEffect(load, []);

  const open = (item) => {
    setForm(item ? { quoteEn: item.quoteEn, quoteFr: item.quoteFr, name: item.name, role: item.role, city: item.city, isVisible: item.isVisible } : EMPTY_FORM);
    setPhoto(null);
    setRemovePhoto(false);
    setError('');
    setModal(item ? { mode: 'edit', item } : { mode: 'add' });
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const choosePhoto = (e) => {
    const file = e.target.files[0] || null;
    if (file && !PHOTO_TYPES.includes(file.type)) {
      setError('testimonials.admin.errors.photoType');
      setPhoto(null);
      return;
    }
    if (file && file.size > PHOTO_MAX_SIZE) {
      setError('testimonials.admin.errors.photoSize');
      setPhoto(null);
      return;
    }
    setError('');
    setPhoto(file);
    setRemovePhoto(false);
  };

  const save = async () => {
    if (!form.quoteEn.trim() || !form.name.trim()) {
      setError('testimonials.admin.errors.required');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = modal.mode === 'add'
        ? await apiFetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        : await apiFetch(`/api/testimonials/${modal.item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('save failed');
      const saved = await res.json();
      if (photo) {
        const body = new FormData();
        body.append('file', photo);
        const photoRes = await apiFetch(`/api/testimonials/${saved.id}/photo`, { method: 'PUT', body });
        if (!photoRes.ok) throw new Error('photo failed');
      } else if (removePhoto) {
        await apiFetch(`/api/testimonials/${saved.id}/photo`, { method: 'DELETE' });
      }
      setModal(null);
      load();
    } catch {
      setError('common.genericError');
    } finally {
      setBusy(false);
    }
  };

  const toggleVisible = (item) => {
    const body = { quoteEn: item.quoteEn, quoteFr: item.quoteFr, name: item.name, role: item.role, city: item.city, isVisible: !item.isVisible };
    const setVisible = (visible) => setItems(list => list.map(i => (i.id === item.id ? { ...i, isVisible: visible } : i)));
    setVisible(!item.isVisible);
    apiFetch(`/api/testimonials/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(res => { if (!res.ok) throw new Error('toggle failed'); })
      .catch(() => setVisible(item.isVisible));
  };

  const remove = (id) => {
    apiFetch(`/api/testimonials/${id}`, { method: 'DELETE' })
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
          <h2 className="admin-section-title">{t('testimonials.admin.heading')}</h2>
          <p className="admin-section-lead">{t('testimonials.admin.lead')}</p>
        </div>
        <button className="admin-add-btn" onClick={() => open(null)}><MdAdd /> {t('testimonials.admin.add')}</button>
      </div>

      {items === null ? (
        <p className="admin-empty">{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <p className="admin-empty">{t('testimonials.admin.empty')}</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('testimonials.admin.quote')}</th>
              <th>{t('testimonials.admin.person')}</th>
              <th>{t('testimonials.admin.shown')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td className="admin-quote-cell">“{item.quoteEn}”</td>
                <td>
                  {item.name}
                  <div className="admin-help-senior">{[t(`testimonials.roles.${item.role}`), item.city].filter(Boolean).join(' · ')}</div>
                </td>
                <td>
                  <label className="admin-toggle">
                    <input type="checkbox" checked={item.isVisible} onChange={() => toggleVisible(item)} aria-label={t('testimonials.admin.showOf', { name: item.name })} />
                    <span>{item.isVisible ? t('testimonials.admin.visible') : t('testimonials.admin.hidden')}</span>
                  </label>
                </td>
                <td>
                  <div className="admin-action-cell">
                    {deleteId === item.id ? (
                      <div className="delete-confirm-row">
                        <span>{t('testimonials.admin.deleteConfirm')}</span>
                        <button className="confirm-yes" onClick={() => remove(item.id)}>{t('common.delete')}</button>
                        <button className="confirm-no" onClick={() => setDeleteId(null)}>{t('common.cancel')}</button>
                      </div>
                    ) : (
                      <>
                        <button className="admin-action-btn edit" onClick={() => open(item)} aria-label={t('testimonials.admin.editOf', { name: item.name })}><MdEdit /></button>
                        <button className="admin-action-btn delete" onClick={() => setDeleteId(item.id)} aria-label={t('testimonials.admin.deleteOf', { name: item.name })}><MdDelete /></button>
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
          <div className="admin-modal admin-modal-wide" role="dialog" aria-modal="true" aria-labelledby="testimonial-modal-title" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 id="testimonial-modal-title">{modal.mode === 'add' ? t('testimonials.admin.add') : t('testimonials.admin.edit')}</h3>
              <button className="admin-modal-close" onClick={() => setModal(null)} aria-label={t('common.cancel')}><MdClose /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form">
                <label htmlFor="t-quote-en">{t('testimonials.admin.quoteEn')}</label>
                <textarea id="t-quote-en" rows={3} maxLength={500} value={form.quoteEn} onChange={update('quoteEn')} />
                <label htmlFor="t-quote-fr">{t('testimonials.admin.quoteFr')}</label>
                <textarea id="t-quote-fr" rows={3} maxLength={500} value={form.quoteFr} onChange={update('quoteFr')} />
                <label htmlFor="t-name">{t('testimonials.admin.name')}</label>
                <input id="t-name" maxLength={100} value={form.name} onChange={update('name')} />
                <label htmlFor="t-role">{t('testimonials.admin.role')}</label>
                <select id="t-role" value={form.role} onChange={update('role')}>
                  {TESTIMONIAL_ROLES.map(role => <option key={role} value={role}>{t(`testimonials.roles.${role}`)}</option>)}
                </select>
                <label htmlFor="t-city">{t('testimonials.admin.city')}</label>
                <input id="t-city" maxLength={100} value={form.city} onChange={update('city')} />
                <label htmlFor="t-photo">{t('testimonials.admin.photo')}</label>
                <input id="t-photo" type="file" accept=".jpg,.jpeg,.png" onChange={choosePhoto} />
                {modal.mode === 'edit' && modal.item.photoVersion && !photo && (
                  <label className="admin-toggle">
                    <input type="checkbox" checked={removePhoto} onChange={e => setRemovePhoto(e.target.checked)} />
                    <span>{t('testimonials.admin.removePhoto')}</span>
                  </label>
                )}
                <label className="admin-toggle">
                  <input type="checkbox" checked={form.isVisible} onChange={update('isVisible')} />
                  <span>{t('testimonials.admin.showOnSite')}</span>
                </label>
                <p className="admin-help-senior">{t('testimonials.admin.consentHint')}</p>
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

export default AdminTestimonials;
