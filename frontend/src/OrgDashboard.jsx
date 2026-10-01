import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdDashboard, MdVolunteerActivism, MdLogout, MdAdd, MdEdit, MdDelete, MdClose, MdOpenInNew, MdPeople, MdLock } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import AccessibilityMenu from './accessibility/AccessibilityMenu';
import LanguageToggle from './i18n/LanguageToggle';
import './OrgDashboard.css';
import apiFetch from './api';
import { clearSession, getCurrentUser } from './auth/session';
import ChangePasswordForm from './auth/ChangePasswordForm';

const SK_CITIES = [
  'Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current',
  'Yorkton', 'North Battleford', 'Estevan', 'Weyburn', 'Lloydminster',
  'Humboldt', 'Melfort', 'Melville', 'Kindersley', 'Tisdale', 'Other',
];

const DAYS_OF_WEEK = [
  { value: 'Monday', labelKey: 'options.days.monday' },
  { value: 'Tuesday', labelKey: 'options.days.tuesday' },
  { value: 'Wednesday', labelKey: 'options.days.wednesday' },
  { value: 'Thursday', labelKey: 'options.days.thursday' },
  { value: 'Friday', labelKey: 'options.days.friday' },
  { value: 'Saturday', labelKey: 'options.days.saturday' },
  { value: 'Sunday', labelKey: 'options.days.sunday' },
];

const DAY_LABEL_KEYS = Object.fromEntries(DAYS_OF_WEEK.map(d => [d.value, d.labelKey]));

const CATEGORIES = [
  { value: 'Senior Care Support', labelKey: 'options.helpTypes.seniorCare' },
  { value: 'Meal Assistance', labelKey: 'options.helpTypes.meal' },
  { value: 'Transportation Support', labelKey: 'options.helpTypes.transportation' },
  { value: 'Medical Assistance', labelKey: 'options.helpTypes.medical' },
  { value: 'Mental Health Support', labelKey: 'options.helpTypes.mentalHealth' },
  { value: 'Housing Support', labelKey: 'options.helpTypes.housing' },
  { value: 'Other', labelKey: 'options.helpTypes.other' },
];

const LISTING_STATUSES = [
  { value: 'Is Ongoing', labelKey: 'options.listingStatus.ongoing' },
  { value: 'One-time', labelKey: 'options.listingStatus.oneTime' },
  { value: 'Completed', labelKey: 'options.listingStatus.completed' },
];

const LISTING_STATUS_KEYS = Object.fromEntries(LISTING_STATUSES.map(s => [s.value, s.labelKey]));

const REGISTRATION_STATUS_KEYS = {
  Pending: 'options.applicationStatus.pending',
  Approved: 'options.applicationStatus.approved',
  Rejected: 'options.applicationStatus.rejected',
  Completed: 'options.applicationStatus.completed',
};

const NAV_ITEMS = [
  { id: 'overview', labelKey: 'common.overview', icon: <MdDashboard /> },
  { id: 'listings', labelKey: 'orgDashboard.nav.listings', icon: <MdVolunteerActivism /> },
  { id: 'applicants', labelKey: 'orgDashboard.nav.applicants', icon: <MdPeople /> },
  { id: 'account', labelKey: 'common.account', icon: <MdLock /> },
];

function Modal({ title, onClose, children }) {
  return (
    <div className="org-modal-overlay" onClick={onClose}>
      <div className="org-modal" onClick={e => e.stopPropagation()}>
        <div className="org-modal-header">
          <h3>{title}</h3>
          <button className="org-modal-close" onClick={onClose}><MdClose /></button>
        </div>
        <div className="org-modal-body">{children}</div>
      </div>
    </div>
  );
}

function DeleteConfirm({ onConfirm, onCancel }) {
  const { t } = useTranslation();
  return (
    <div className="delete-confirm-row">
      <span>{t('orgDashboard.listings.deleteConfirm')}</span>
      <button className="confirm-yes" onClick={onConfirm}>{t('common.delete')}</button>
      <button className="confirm-no" onClick={onCancel}>{t('common.cancel')}</button>
    </div>
  );
}

function OrgDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getCurrentUser());
  const [activeSection, setActiveSection] = useState('overview');
  const [listings, setListings] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ listingTitle: '', description: '', location: '', days: [], category: '', status: 'Is Ongoing', startDate: '', endDate: '' });
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [completing, setCompleting] = useState(null);
  const [hoursInput, setHoursInput] = useState('');
  const [hoursError, setHoursError] = useState('');

  useEffect(() => {
    if (user?.id) {
      apiFetch(`/api/organizations/${user.id}`)
        .then(res => res.json())
        .then(data => {
          const updated = { ...user, isApproved: data.isApproved };
          localStorage.setItem('currentUser', JSON.stringify(updated));
          setUser(updated);
        })
        .catch(() => {});
    }
  }, [user?.id]);

  useEffect(() => {
    apiFetch(`/api/listings`)
      .then(res => res.json())
      .then(data => setListings(data.filter(l => l.organizationId === user?.id)))
      .catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    apiFetch(`/api/registrations`)
      .then(res => res.json())
      .then(data => setRegistrations(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [user?.id]);

  const handleLogout = () => {
    clearSession();
    navigate('/signin');
  };

  const openAdd = () => {
    setForm({ listingTitle: '', description: '', location: '', days: [], category: '', status: 'Is Ongoing', startDate: '', endDate: '' });
    setModal({ mode: 'add' });
  };

  const openEdit = (item) => {
    setForm({
      listingTitle: item.listingTitle,
      description: item.description,
      location: item.location,
      days: item.days ? item.days.split(', ').filter(Boolean) : [],
      category: item.category || '',
      status: item.status,
      startDate: item.startDate,
      endDate: item.endDate,
    });
    setModal({ mode: 'edit', item });
  };

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day],
    }));
  };

  const saveListing = () => {

    if (!form.listingTitle.trim() || !form.category || !form.location) {
      setFormError('orgDashboard.listings.requiredError');
      return;
    }
    setFormError('');
    const payload = { ...form, days: form.days.join(', '), orgName: user?.orgName || '' };
    if (modal.mode === 'add') {
      apiFetch(`/api/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => res.json())
        .then(created => { setListings([created, ...listings]); setModal(null); })
        .catch(() => {});
    } else {
      apiFetch(`/api/listings/${modal.item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, id: modal.item.id }),
      })
        .then(res => res.json())
        .then(updated => { setListings(listings.map(l => l.id === updated.id ? updated : l)); setModal(null); })
        .catch(() => {});
    }
  };

  const updateRegistrationStatus = (id, status) => {
    apiFetch(`/api/registrations/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(status),
    })
      .then(res => res.json())
      .then(updated => setRegistrations(registrations.map(r => r.id === updated.id ? updated : r)))
      .catch(() => {});
  };

  const openComplete = (reg) => {
    setCompleting(reg);
    setHoursInput(reg.hoursServed ? String(reg.hoursServed) : '');
    setHoursError('');
  };

  const saveCompletion = () => {
    const hours = Number(hoursInput);
    if (!hoursInput || !Number.isFinite(hours) || hours < 0.25 || hours > 1000) {
      setHoursError('orgDashboard.applicants.invalidHours');
      return;
    }
    apiFetch(`/api/registrations/${completing.id}/complete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hours }),
    })
      .then(res => {
        if (!res.ok) throw new Error('complete failed');
        return res.json();
      })
      .then(updated => {
        setRegistrations(registrations.map(r => r.id === updated.id ? updated : r));
        setCompleting(null);
      })
      .catch(() => setHoursError('orgDashboard.applicants.completeFailed'));
  };

  const deleteListing = (id) => {
    apiFetch(`/api/listings/${id}`, { method: 'DELETE' })
      .then(() => { setListings(listings.filter(l => l.id !== id)); setDeleteId(null); })
      .catch(() => {});
  };

  const renderOverview = () => (
    <div>
      <h2 className="org-section-title">{t('common.overview')}</h2>
      <div className="org-stats-grid">
        <div className="org-stat-card">
          <div className="org-stat-number">{listings.length}</div>
          <div className="org-stat-label">{t('orgDashboard.stats.activeListings')}</div>
        </div>
        <div className="org-stat-card">
          <div className="org-stat-number">{listings.filter(l => l.status === 'Is Ongoing').length}</div>
          <div className="org-stat-label">{t('orgDashboard.stats.ongoing')}</div>
        </div>
        <div className="org-stat-card">
          <div className="org-stat-number">{registrations.length}</div>
          <div className="org-stat-label">{t('orgDashboard.stats.totalApplicants')}</div>
        </div>
        <div className="org-stat-card">
          <div className="org-stat-number">{registrations.filter(r => r.status === 'Pending').length}</div>
          <div className="org-stat-label">{t('orgDashboard.stats.pendingReview')}</div>
        </div>
      </div>
    </div>
  );

  const renderApplicants = () => (
    <div>
      <h2 className="org-section-title">{t('orgDashboard.nav.applicants')}</h2>
      {registrations.length === 0 ? (
        <p className="org-empty">{t('orgDashboard.applicants.empty')}</p>
      ) : (
        <table className="org-table">
          <thead>
            <tr>
              <th>{t('common.name')}</th>
              <th>{t('common.email')}</th>
              <th>{t('orgDashboard.applicants.listing')}</th>
              <th>{t('common.date')}</th>
              <th>{t('common.status')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map(r => (
              <tr key={r.id}>
                <td>{r.volunteerName}</td>
                <td>{r.volunteerEmail}</td>
                <td>{r.listingTitle}</td>
                <td>{r.registeredAt}</td>
                <td>
                  <span className={`org-reg-badge ${r.status.toLowerCase()}`}>{REGISTRATION_STATUS_KEYS[r.status] ? t(REGISTRATION_STATUS_KEYS[r.status]) : r.status}</span>
                  {r.status === 'Completed' && <div className="org-reg-hours">{t('dashboard.history.hours', { hours: r.hoursServed })}</div>}
                </td>
                <td>
                  <div className="org-action-cell">
                    {r.status === 'Pending' && (
                      <>
                        <button className="admin-action-btn approve" onClick={() => updateRegistrationStatus(r.id, 'Approved')}>{t('orgDashboard.applicants.approve')}</button>
                        <button className="admin-action-btn revoke" onClick={() => updateRegistrationStatus(r.id, 'Rejected')}>{t('orgDashboard.applicants.reject')}</button>
                      </>
                    )}
                    {r.status === 'Approved' && (
                      <>
                        <button className="admin-action-btn approve" onClick={() => openComplete(r)}>{t('orgDashboard.applicants.markCompleted')}</button>
                        <button className="admin-action-btn revoke" onClick={() => updateRegistrationStatus(r.id, 'Rejected')}>{t('orgDashboard.applicants.reject')}</button>
                      </>
                    )}
                    {r.status === 'Completed' && (
                      <button className="admin-action-btn approve" onClick={() => openComplete(r)}>{t('orgDashboard.applicants.editHours')}</button>
                    )}
                    {r.status === 'Rejected' && (
                      <button className="admin-action-btn approve" onClick={() => updateRegistrationStatus(r.id, 'Approved')}>{t('orgDashboard.applicants.approve')}</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {completing && (
        <Modal title={t('orgDashboard.applicants.completeTitle')} onClose={() => setCompleting(null)}>
          <div className="org-form">
            <p className="org-complete-summary">{completing.volunteerName} · {completing.listingTitle}</p>
            <label htmlFor="hours-served">{t('orgDashboard.applicants.hoursServed')}</label>
            <input
              id="hours-served"
              type="number"
              min="0.25"
              max="1000"
              step="0.25"
              value={hoursInput}
              onChange={e => { setHoursInput(e.target.value); setHoursError(''); }}
            />
            {hoursError && <p className="org-form-error">{t(hoursError)}</p>}
            <div className="org-form-actions">
              <button className="org-save-btn" onClick={saveCompletion}>{t('common.save')}</button>
              <button className="org-cancel-btn" onClick={() => setCompleting(null)}>{t('common.cancel')}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );

  const renderListings = () => (
    <div>
      <div className="org-section-header">
        <h2 className="org-section-title">{t('orgDashboard.nav.listings')}</h2>
        <button className="org-add-btn" onClick={openAdd}><MdAdd /> {t('orgDashboard.listings.add')}</button>
      </div>
      {listings.length === 0 ? (
        <p className="org-empty">{t('orgDashboard.listings.empty')}</p>
      ) : (
        <table className="org-table">
          <thead>
            <tr>
              <th>{t('common.title')}</th>
              <th>{t('common.location')}</th>
              <th>{t('common.schedule')}</th>
              <th>{t('common.status')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {listings.map(l => (
              <tr key={l.id}>
                <td>{l.listingTitle}</td>
                <td>{l.location}</td>
                <td>{l.days ? l.days.split(', ').map(d => (DAY_LABEL_KEYS[d] ? t(DAY_LABEL_KEYS[d]) : d)).join(', ') : l.days}</td>
                <td><span className="org-status-badge">{LISTING_STATUS_KEYS[l.status] ? t(LISTING_STATUS_KEYS[l.status]) : l.status}</span></td>
                <td>
                  <div className="org-action-cell">
                    {deleteId === l.id ? (
                      <DeleteConfirm onConfirm={() => deleteListing(l.id)} onCancel={() => setDeleteId(null)} />
                    ) : (
                      <>
                        <button className="org-action-btn edit" onClick={() => openEdit(l)}><MdEdit /></button>
                        <button className="org-action-btn delete" onClick={() => setDeleteId(l.id)}><MdDelete /></button>
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
        <Modal title={modal.mode === 'add' ? t('orgDashboard.listings.add') : t('orgDashboard.listings.editTitle')} onClose={() => setModal(null)}>
          <div className="org-form">
            <label>{t('common.title')}</label>
            <input value={form.listingTitle} onChange={e => setForm({ ...form, listingTitle: e.target.value })} placeholder={t('orgDashboard.listings.titlePlaceholder')} />
            <label>{t('common.category')}</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="">{t('orgDashboard.listings.selectCategory')}</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{t(c.labelKey)}</option>)}
            </select>
            <label>{t('common.description')}</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={t('orgDashboard.listings.descriptionPlaceholder')} rows={3} />
            <label>{t('common.location')}</label>
            <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}>
              <option value="">{t('orgDashboard.listings.selectCity')}</option>
              {SK_CITIES.map(city => <option key={city} value={city}>{city === 'Other' ? t('volunteer.otherCity') : city}</option>)}
            </select>
            <label>{t('common.schedule')}</label>
            <div className="org-days-grid">
              {DAYS_OF_WEEK.map(day => (
                <label key={day.value} className="org-day-checkbox">
                  <input
                    type="checkbox"
                    checked={form.days.includes(day.value)}
                    onChange={() => toggleDay(day.value)}
                  />
                  {t(day.labelKey)}
                </label>
              ))}
            </div>
            <label>{t('common.status')}</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {LISTING_STATUSES.map(s => <option key={s.value} value={s.value}>{t(s.labelKey)}</option>)}
            </select>
            <label>{t('orgDashboard.listings.startDate')}</label>
            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            <label>{t('orgDashboard.listings.endDate')}</label>
            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            {formError && <p className="org-form-error">{t(formError)}</p>}
            <div className="org-form-actions">
              <button className="org-save-btn" onClick={saveListing}>{t('common.save')}</button>
              <button className="org-cancel-btn" onClick={() => setModal(null)}>{t('common.cancel')}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );

  if (!user?.isApproved) {
    return (
      <div className="org-page">
        <div className="org-pending-wrap">
          <div className="org-pending-box">
            <h2>{t('orgDashboard.pending.heading')}</h2>
            <p>{t('orgDashboard.pending.text')}</p>
            <p>{t('orgDashboard.pending.notify')}</p>
            <button className="org-cancel-btn" onClick={handleLogout}>{t('common.logOut')}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="org-page">
      <div className="org-layout">
        <aside className="org-sidebar">
          <div className="org-sidebar-header">
            <div className="org-sidebar-title">{t('orgDashboard.role')}</div>
            <div className="org-sidebar-name">{user?.orgName}</div>
          </div>
          <div className="org-sidebar-nav">
            {NAV_ITEMS.map(item => (
              <div
                key={item.id}
                className={`org-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="org-nav-icon">{item.icon}</span>
                {t(item.labelKey)}
              </div>
            ))}
          </div>
          <div className="org-sidebar-display">
            <AccessibilityMenu placement="above" className="a11y-menu-sidebar" />
            <LanguageToggle className="language-toggle-sidebar" />
          </div>
          <div className="org-sidebar-viewsite" onClick={() => navigate('/')}>
            <MdOpenInNew /> {t('common.viewSite')}
          </div>
          <div className="org-sidebar-logout" onClick={handleLogout}>
            <MdLogout /> {t('common.logOut')}
          </div>
        </aside>
        <main className="org-main">
          {activeSection === 'overview' && renderOverview()}
          {activeSection === 'listings' && renderListings()}
          {activeSection === 'applicants' && renderApplicants()}
          {activeSection === 'account' && (
            <div>
              <h2 className="org-section-title">{t('common.account')}</h2>
              <ChangePasswordForm />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default OrgDashboard;
