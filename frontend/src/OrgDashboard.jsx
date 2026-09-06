import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdDashboard, MdVolunteerActivism, MdLogout, MdAdd, MdEdit, MdDelete, MdClose, MdOpenInNew, MdPeople } from 'react-icons/md';
import './OrgDashboard.css';

const API_BASE = 'http://localhost:5184';

const SK_CITIES = [
  'Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current',
  'Yorkton', 'North Battleford', 'Estevan', 'Weyburn', 'Lloydminster',
  'Humboldt', 'Melfort', 'Melville', 'Kindersley', 'Tisdale', 'Other',
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CATEGORIES = [
  'Senior Care Support',
  'Meal Assistance',
  'Transportation Support',
  'Medical Assistance',
  'Mental Health Support',
  'Housing Support',
  'Other',
];

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: <MdDashboard /> },
  { id: 'listings', label: 'My Listings', icon: <MdVolunteerActivism /> },
  { id: 'applicants', label: 'Applicants', icon: <MdPeople /> },
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
  return (
    <div className="delete-confirm-row">
      <span>Delete this listing?</span>
      <button className="confirm-yes" onClick={onConfirm}>Delete</button>
      <button className="confirm-no" onClick={onCancel}>Cancel</button>
    </div>
  );
}

function OrgDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('currentUser')));
  const [activeSection, setActiveSection] = useState('overview');
  const [listings, setListings] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ listingTitle: '', description: '', location: '', days: [], category: '', status: 'Is Ongoing', startDate: '', endDate: '' });
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetch(`${API_BASE}/api/organizations/${user.id}`)
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
    fetch(`${API_BASE}/api/listings`)
      .then(res => res.json())
      .then(data => setListings(data.filter(l => l.orgName === user?.orgName)))
      .catch(() => {});
  }, [user?.orgName]);

  useEffect(() => {
    fetch(`${API_BASE}/api/registrations`)
      .then(res => res.json())
      .then(data => setRegistrations(data.filter(r => r.orgName === user?.orgName)))
      .catch(() => {});
  }, [user?.orgName]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
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
    const payload = { ...form, days: form.days.join(', '), orgName: user?.orgName || '' };
    if (modal.mode === 'add') {
      fetch(`${API_BASE}/api/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(res => res.json())
        .then(created => { setListings([created, ...listings]); setModal(null); })
        .catch(() => {});
    } else {
      fetch(`${API_BASE}/api/listings/${modal.item.id}`, {
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
    fetch(`${API_BASE}/api/registrations/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(status),
    })
      .then(res => res.json())
      .then(updated => setRegistrations(registrations.map(r => r.id === updated.id ? updated : r)))
      .catch(() => {});
  };

  const deleteListing = (id) => {
    fetch(`${API_BASE}/api/listings/${id}`, { method: 'DELETE' })
      .then(() => { setListings(listings.filter(l => l.id !== id)); setDeleteId(null); })
      .catch(() => {});
  };

  const renderOverview = () => (
    <div>
      <h2 className="org-section-title">Overview</h2>
      <div className="org-stats-grid">
        <div className="org-stat-card">
          <div className="org-stat-number">{listings.length}</div>
          <div className="org-stat-label">Active Listings</div>
        </div>
        <div className="org-stat-card">
          <div className="org-stat-number">{listings.filter(l => l.status === 'Is Ongoing').length}</div>
          <div className="org-stat-label">Ongoing</div>
        </div>
        <div className="org-stat-card">
          <div className="org-stat-number">{registrations.length}</div>
          <div className="org-stat-label">Total Applicants</div>
        </div>
        <div className="org-stat-card">
          <div className="org-stat-number">{registrations.filter(r => r.status === 'Pending').length}</div>
          <div className="org-stat-label">Pending Review</div>
        </div>
      </div>
    </div>
  );

  const renderApplicants = () => (
    <div>
      <h2 className="org-section-title">Applicants</h2>
      {registrations.length === 0 ? (
        <p className="org-empty">No applicants yet.</p>
      ) : (
        <table className="org-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Listing</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map(r => (
              <tr key={r.id}>
                <td>{r.volunteerName}</td>
                <td>{r.volunteerEmail}</td>
                <td>{r.listingTitle}</td>
                <td>{r.registeredAt}</td>
                <td><span className={`org-reg-badge ${r.status.toLowerCase()}`}>{r.status}</span></td>
                <td>
                  <div className="org-action-cell">
                    {r.status === 'Pending' && (
                      <>
                        <button className="admin-action-btn approve" onClick={() => updateRegistrationStatus(r.id, 'Approved')}>Approve</button>
                        <button className="admin-action-btn revoke" onClick={() => updateRegistrationStatus(r.id, 'Rejected')}>Reject</button>
                      </>
                    )}
                    {r.status === 'Approved' && (
                      <button className="admin-action-btn revoke" onClick={() => updateRegistrationStatus(r.id, 'Rejected')}>Reject</button>
                    )}
                    {r.status === 'Rejected' && (
                      <button className="admin-action-btn approve" onClick={() => updateRegistrationStatus(r.id, 'Approved')}>Approve</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderListings = () => (
    <div>
      <div className="org-section-header">
        <h2 className="org-section-title">My Listings</h2>
        <button className="org-add-btn" onClick={openAdd}><MdAdd /> Add Listing</button>
      </div>
      {listings.length === 0 ? (
        <p className="org-empty">No listings yet. Add your first volunteer opportunity.</p>
      ) : (
        <table className="org-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Schedule</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.map(l => (
              <tr key={l.id}>
                <td>{l.listingTitle}</td>
                <td>{l.location}</td>
                <td>{l.days}</td>
                <td><span className="org-status-badge">{l.status}</span></td>
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
        <Modal title={modal.mode === 'add' ? 'Add Listing' : 'Edit Listing'} onClose={() => setModal(null)}>
          <div className="org-form">
            <label>Title</label>
            <input value={form.listingTitle} onChange={e => setForm({ ...form, listingTitle: e.target.value })} placeholder="Opportunity title" />
            <label>Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the opportunity" rows={3} />
            <label>Location</label>
            <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}>
              <option value="">Select a city</option>
              {SK_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
            <label>Schedule</label>
            <div className="org-days-grid">
              {DAYS_OF_WEEK.map(day => (
                <label key={day} className="org-day-checkbox">
                  <input
                    type="checkbox"
                    checked={form.days.includes(day)}
                    onChange={() => toggleDay(day)}
                  />
                  {day}
                </label>
              ))}
            </div>
            <label>Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option>Is Ongoing</option>
              <option>One-time</option>
              <option>Completed</option>
            </select>
            <label>Start Date</label>
            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            <label>End Date</label>
            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            <div className="org-form-actions">
              <button className="org-save-btn" onClick={saveListing}>Save</button>
              <button className="org-cancel-btn" onClick={() => setModal(null)}>Cancel</button>
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
            <h2>Account Pending Approval</h2>
            <p>Your organization account is currently under review. An admin will approve your account before you can post listings.</p>
            <p>We will notify you once your account has been approved.</p>
            <button className="org-cancel-btn" onClick={handleLogout}>Log Out</button>
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
            <div className="org-sidebar-title">Organization</div>
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
                {item.label}
              </div>
            ))}
          </div>
          <div className="org-sidebar-viewsite" onClick={() => navigate('/')}>
            <MdOpenInNew /> View Site
          </div>
          <div className="org-sidebar-logout" onClick={handleLogout}>
            <MdLogout /> Log Out
          </div>
        </aside>
        <main className="org-main">
          {activeSection === 'overview' && renderOverview()}
          {activeSection === 'listings' && renderListings()}
          {activeSection === 'applicants' && renderApplicants()}
        </main>
      </div>
    </div>
  );
}

export default OrgDashboard;
