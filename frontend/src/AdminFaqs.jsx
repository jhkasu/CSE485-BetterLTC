import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd, MdArrowDownward, MdArrowUpward, MdClose, MdDelete, MdEdit } from 'react-icons/md';
import apiFetch from './api';
import { FAQ_TOPICS } from './faqOptions';

const EMPTY_FORM = { topic: FAQ_TOPICS[0], questionEn: '', answerEn: '', questionFr: '', answerFr: '' };

function AdminFaqs() {
  const { t } = useTranslation();
  const [items, setItems] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const load = () => {
    apiFetch('/api/faqs')
      .then(res => (res.ok ? res.json() : []))
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  };

  useEffect(load, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setError('');
    setModal({ mode: 'add' });
  };

  const openEdit = (item) => {
    setForm({ topic: item.topic, questionEn: item.questionEn, answerEn: item.answerEn, questionFr: item.questionFr, answerFr: item.answerFr });
    setError('');
    setModal({ mode: 'edit', item });
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const save = () => {
    if (!form.questionEn.trim() || !form.answerEn.trim()) {
      setError('faq.admin.englishRequired');
      return;
    }
    const request = modal.mode === 'add'
      ? apiFetch('/api/faqs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      : apiFetch(`/api/faqs/${modal.item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    request
      .then(res => {
        if (!res.ok) throw new Error('save failed');
        setModal(null);
        load();
      })
      .catch(() => setError('common.genericError'));
  };

  const move = (item, direction) => {
    apiFetch(`/api/faqs/${item.id}/move`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ direction }) })
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (Array.isArray(data)) setItems(data); })
      .catch(() => {});
  };

  const remove = (id) => {
    apiFetch(`/api/faqs/${id}`, { method: 'DELETE' })
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
          <h2 className="admin-section-title">{t('faq.admin.heading')}</h2>
          <p className="admin-section-lead">{t('faq.admin.lead')}</p>
        </div>
        <button className="admin-add-btn" onClick={openAdd}><MdAdd /> {t('faq.admin.add')}</button>
      </div>

      {items === null ? (
        <p className="admin-empty">{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <p className="admin-empty">{t('faq.empty')}</p>
      ) : FAQ_TOPICS.map(topic => {
        const group = items.filter(item => item.topic === topic);
        if (group.length === 0) return null;
        return (
          <section key={topic} className="admin-faq-group" aria-labelledby={`admin-faq-${topic}`}>
            <h3 id={`admin-faq-${topic}`} className="admin-faq-topic">{t(`faq.topicNames.${topic}`)}</h3>
            <table className="admin-table">
              <tbody>
                {group.map((item, i) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.questionEn}</strong>
                      <div className="admin-help-senior">{item.questionFr || t('faq.admin.noFrench')}</div>
                    </td>
                    <td className="admin-faq-actions">
                      {deleteId === item.id ? (
                        <div className="delete-confirm-row">
                          <span>{t('faq.admin.deleteConfirm')}</span>
                          <button className="confirm-yes" onClick={() => remove(item.id)}>{t('common.delete')}</button>
                          <button className="confirm-no" onClick={() => setDeleteId(null)}>{t('common.cancel')}</button>
                        </div>
                      ) : (
                        <div className="admin-action-cell">
                          <button className="admin-action-btn edit" onClick={() => move(item, 'up')} disabled={i === 0} aria-label={t('faq.admin.moveUp', { question: item.questionEn })}><MdArrowUpward /></button>
                          <button className="admin-action-btn edit" onClick={() => move(item, 'down')} disabled={i === group.length - 1} aria-label={t('faq.admin.moveDown', { question: item.questionEn })}><MdArrowDownward /></button>
                          <button className="admin-action-btn edit" onClick={() => openEdit(item)} aria-label={t('faq.admin.editOf', { question: item.questionEn })}><MdEdit /></button>
                          <button className="admin-action-btn delete" onClick={() => setDeleteId(item.id)} aria-label={t('faq.admin.deleteOf', { question: item.questionEn })}><MdDelete /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })}

      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal admin-modal-wide" role="dialog" aria-modal="true" aria-labelledby="faq-modal-title" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 id="faq-modal-title">{modal.mode === 'add' ? t('faq.admin.add') : t('faq.admin.edit')}</h3>
              <button className="admin-modal-close" onClick={() => setModal(null)} aria-label={t('common.cancel')}><MdClose /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form">
                <label htmlFor="faq-topic">{t('faq.topic')}</label>
                <select id="faq-topic" value={form.topic} onChange={update('topic')}>
                  {FAQ_TOPICS.map(topic => <option key={topic} value={topic}>{t(`faq.topicNames.${topic}`)}</option>)}
                </select>
                <label htmlFor="faq-question-en">{t('faq.admin.questionEn')}</label>
                <input id="faq-question-en" value={form.questionEn} maxLength={300} onChange={update('questionEn')} />
                <label htmlFor="faq-answer-en">{t('faq.admin.answerEn')}</label>
                <textarea id="faq-answer-en" rows={4} maxLength={2000} value={form.answerEn} onChange={update('answerEn')} />
                <label htmlFor="faq-question-fr">{t('faq.admin.questionFr')}</label>
                <input id="faq-question-fr" value={form.questionFr} maxLength={300} onChange={update('questionFr')} />
                <label htmlFor="faq-answer-fr">{t('faq.admin.answerFr')}</label>
                <textarea id="faq-answer-fr" rows={4} maxLength={2000} value={form.answerFr} onChange={update('answerFr')} />
                <p className="admin-help-senior">{t('faq.admin.frenchHint')}</p>
                {error && <p className="admin-error" role="alert">{t(error)}</p>}
                <div className="admin-form-actions">
                  <button className="admin-save-btn" onClick={save}>{t('common.save')}</button>
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

export default AdminFaqs;
