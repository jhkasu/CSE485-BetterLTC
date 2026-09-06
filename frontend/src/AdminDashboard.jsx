import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdDashboard, MdPeople, MdGroups, MdWork,
  MdHelpCenter, MdLogout, MdAdd, MdEdit, MdDelete,
  MdClose, MdVolunteerActivism, MdOpenInNew, MdBusiness,
} from 'react-icons/md';
import RichTextEditor from './RichTextEditor';
import './AdminDashboard.css';

const API_BASE = 'http://localhost:5184';


const INIT_OPPORTUNITIES = [
  { id: 1, title: 'Senior Companionship Program', description: 'Provide friendship and support to isolated seniors in long-term care facilities.', location: 'Toronto', days: 'Flexible' },
  { id: 2, title: 'Community Food Drive Support', description: 'Help sort and pack food donations for local families in need.', location: 'Vancouver', days: 'Weekends' },
  { id: 3, title: 'Memory Care Activities Assistant', description: 'Lead engaging activities for seniors living with dementia in care homes.', location: 'Montreal', days: 'Weekdays' },
  { id: 4, title: 'Transportation Volunteer', description: 'Drive seniors to medical appointments and community events.', location: 'Calgary', days: 'Flexible' },
];



const NAV_ITEMS = [
  { id: 'overview',       label: 'Overview',                icon: <MdDashboard /> },
  { id: 'users',          label: 'Users',                   icon: <MdPeople /> },
  { id: 'organizations',  label: 'Organizations',           icon: <MdBusiness /> },
  { id: 'team',           label: 'Our Team',                icon: <MdGroups /> },
  { id: 'opportunities',  label: 'Volunteer Opportunities', icon: <MdVolunteerActivism /> },
  { id: 'work',           label: 'Our Work',                icon: <MdWork /> },
  { id: 'help',           label: 'Get Help',                icon: <MdHelpCenter /> },
];

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="admin-modal-overlay" onClick={onClose || undefined}>
      <div className={`admin-modal${wide ? ' admin-modal-wide' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{title}</h3>
          <button className="admin-modal-close" onClick={onClose}><MdClose /></button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  );
}

function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <div className="delete-confirm-row">
      <span>Delete this item?</span>
      <button className="confirm-yes" onClick={onConfirm}>Delete</button>
      <button className="confirm-no" onClick={onCancel}>Cancel</button>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const [activeSection, setActiveSection] = useState('overview');

  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/volunteers`)
      .then(res => res.json())
      .then(data => setVolunteers(data))
      .catch(() => {});
  }, []);

  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/organizations`)
      .then(res => res.json())
      .then(data => setOrganizations(data))
      .catch(() => {});
  }, []);

  const [team, setTeam] = useState([]);
  const [teamModal, setTeamModal] = useState(null);
  const [teamForm, setTeamForm] = useState({ name: '', position: '', bio: '', imagePath: '' });
  const [teamImageUploading, setTeamImageUploading] = useState(false);
  const [teamDeleteId, setTeamDeleteId] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/team-members`)
      .then(res => res.json())
      .then(data => setTeam(data))
      .catch(() => {});
  }, []);

  const [opportunities, setOpportunities] = useState(INIT_OPPORTUNITIES);
  const [oppModal, setOppModal] = useState(null);
  const [oppForm, setOppForm] = useState({ title: '', description: '', location: '', days: '' });
  const [oppDeleteId, setOppDeleteId] = useState(null);

  const [work, setWork] = useState([]);
  const [workModal, setWorkModal] = useState(null);
  const [workForm, setWorkForm] = useState({ title: '', content: '', category: '', date: '' });
  const [workDeleteId, setWorkDeleteId] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/our-work`)
      .then(res => res.json())
      .then(data => setWork(data))
      .catch(() => {});
  }, []);

  const [helpRequests, setHelpRequests] = useState([]);
  const [helpDeleteId, setHelpDeleteId] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/help-requests`)
      .then(res => res.json())
      .then(data => setHelpRequests(data))
      .catch(() => {});
  }, []);

  const nextId = (list) => Math.max(0, ...list.map(i => i.id)) + 1;

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/signin');
  };

  const toggleBgCheck = (volunteer) => {
    const endpoint = volunteer.backgroundCheckApproved
      ? `${API_BASE}/api/volunteers/${volunteer.id}/revoke-bgcheck`
      : `${API_BASE}/api/volunteers/${volunteer.id}/approve-bgcheck`;
    fetch(endpoint, { method: 'PUT' })
      .then(res => res.json())
      .then(updated => setVolunteers(volunteers.map(v => v.id === updated.id ? updated : v)))
      .catch(() => {});
  };

  const openTeamAdd = () => { setTeamForm({ name: '', position: '', bio: '', imagePath: '' }); setTeamModal({ mode: 'add' }); };
  const openTeamEdit = (item) => { setTeamForm({ name: item.name, position: item.position, bio: item.bio, imagePath: item.imagePath }); setTeamModal({ mode: 'edit', item }); };
  const handleTeamImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    setTeamImageUploading(true);
    fetch(`${API_BASE}/api/team-members/upload`, { method: 'POST', body: data })
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(({ imagePath }) => { setTeamForm(f => ({ ...f, imagePath })); setTeamImageUploading(false); })
      .catch(err => { console.error('Upload failed:', err); setTeamImageUploading(false); });
  };
  const saveTeam = () => {
    if (teamModal.mode === 'add') {
      fetch(`${API_BASE}/api/team-members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamForm),
      })
        .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
        .then(created => { setTeam([...team, created]); setTeamModal(null); })
        .catch(err => console.error('POST team-member failed:', err));
    } else {
      fetch(`${API_BASE}/api/team-members/${teamModal.item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamForm),
      })
        .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
        .then(updated => { setTeam(team.map(t => t.id === updated.id ? updated : t)); setTeamModal(null); })
        .catch(err => console.error('PUT team-member failed:', err));
    }
  };
  const deleteTeam = (id) => {
    fetch(`${API_BASE}/api/team-members/${id}`, { method: 'DELETE' })
      .then(() => { setTeam(team.filter(t => t.id !== id)); setTeamDeleteId(null); })
      .catch(() => {});
  };

  const openOppAdd = () => { setOppForm({ title: '', description: '', location: '', days: '' }); setOppModal({ mode: 'add' }); };
  const openOppEdit = (item) => { setOppForm({ title: item.title, description: item.description, location: item.location, days: item.days }); setOppModal({ mode: 'edit', item }); };
  const saveOpp = () => {
    if (oppModal.mode === 'add') setOpportunities([...opportunities, { id: nextId(opportunities), ...oppForm }]);
    else setOpportunities(opportunities.map(o => o.id === oppModal.item.id ? { ...o, ...oppForm } : o));
    setOppModal(null);
  };
  const deleteOpp = (id) => { setOpportunities(opportunities.filter(o => o.id !== id)); setOppDeleteId(null); };

  const openWorkAdd = () => { setWorkForm({ title: '', content: '', category: '', date: '' }); setWorkModal({ mode: 'add' }); };
  const openWorkEdit = (item) => { setWorkForm({ title: item.title, content: item.content, category: item.category, date: item.date }); setWorkModal({ mode: 'edit', item }); };
  const saveWork = () => {
    if (workModal.mode === 'add') {
      fetch(`${API_BASE}/api/our-work`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workForm),
      })
        .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
        .then(created => { setWork([created, ...work]); setWorkModal(null); })
        .catch(err => console.error('POST our-work failed:', err));
    } else {
      fetch(`${API_BASE}/api/our-work/${workModal.item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workForm),
      })
        .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
        .then(updated => { setWork(work.map(w => w.id === updated.id ? updated : w)); setWorkModal(null); })
        .catch(err => console.error('PUT our-work failed:', err));
    }
  };
  const deleteWork = (id) => {
    fetch(`${API_BASE}/api/our-work/${id}`, { method: 'DELETE' })
      .then(() => { setWork(work.filter(w => w.id !== id)); setWorkDeleteId(null); })
      .catch(err => console.error('DELETE our-work failed:', err));
  };

  const deleteHelpRequest = (id) => {
    fetch(`${API_BASE}/api/help-requests/${id}`, { method: 'DELETE' })
      .then(() => { setHelpRequests(helpRequests.filter(r => r.id !== id)); setHelpDeleteId(null); })
      .catch(() => {});
  };

  const renderOverview = () => (
    <div>
      <h2 className="admin-section-title">Overview</h2>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-number">{volunteers.length}</div>
          <div className="admin-stat-label">Total Volunteers</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-number">{volunteers.filter(v => v.backgroundCheckApproved).length}</div>
          <div className="admin-stat-label">Background Approved</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-number">{opportunities.length}</div>
          <div className="admin-stat-label">Active Opportunities</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-number">{team.length}</div>
          <div className="admin-stat-label">Team Members</div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div>
      <h2 className="admin-section-title">Volunteers</h2>
      {volunteers.length === 0 ? (
        <p style={{ color: '#888', marginTop: 20 }}>No volunteers registered yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Background Check</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map(v => (
              <tr key={v.id}>
                <td>{v.firstName} {v.lastName}</td>
                <td>{v.email}</td>
                <td><span className={`bg-badge ${v.backgroundCheckApproved ? 'approved' : 'pending'}`}>{v.backgroundCheckApproved ? 'Approved' : 'Pending'}</span></td>
                <td>
                  <button className={`admin-action-btn ${v.backgroundCheckApproved ? 'revoke' : 'approve'}`} onClick={() => toggleBgCheck(v)}>
                    {v.backgroundCheckApproved ? 'Revoke' : 'Approve'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderTeam = () => (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Our Team</h2>
        <button className="admin-add-btn" onClick={openTeamAdd}><MdAdd /> Add Member</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Position</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {team.map(t => (
            <tr key={t.id}>
              <td>
                {t.imagePath
                  ? <img src={`${API_BASE}${t.imagePath}`} alt={t.name} className="admin-team-photo" />
                  : <div className="admin-team-photo-placeholder">{t.name.charAt(0)}</div>}
              </td>
              <td>{t.name}</td>
              <td>{t.position}</td>
              <td>
                <div className="admin-action-cell">
                  {teamDeleteId === t.id ? (
                    <DeleteConfirm onConfirm={() => deleteTeam(t.id)} onCancel={() => setTeamDeleteId(null)} />
                  ) : (
                    <>
                      <button className="admin-action-btn edit" onClick={() => openTeamEdit(t)}><MdEdit /></button>
                      <button className="admin-action-btn delete" onClick={() => setTeamDeleteId(t.id)}><MdDelete /></button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {teamModal && (
        <Modal title={teamModal.mode === 'add' ? 'Add Team Member' : 'Edit Team Member'} onClose={() => setTeamModal(null)}>
          <div className="admin-form">
            <label>Name</label>
            <input value={teamForm.name} onChange={e => setTeamForm({ ...teamForm, name: e.target.value })} placeholder="Full name" />
            <label>Position</label>
            <input value={teamForm.position} onChange={e => setTeamForm({ ...teamForm, position: e.target.value })} placeholder="Job title" />
            <label>Bio</label>
            <textarea value={teamForm.bio} onChange={e => setTeamForm({ ...teamForm, bio: e.target.value })} placeholder="Short bio" rows={3} />
            <label>Photo</label>
            <input type="file" accept="image/*" onChange={handleTeamImageChange} />
            {teamImageUploading && <span style={{ fontSize: 12, color: '#888' }}>Uploading...</span>}
            {teamForm.imagePath && <img src={`${API_BASE}${teamForm.imagePath}`} alt="preview" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', marginTop: 6 }} />}
            <div className="admin-form-actions">
              <button className="admin-save-btn" onClick={saveTeam}>Save</button>
              <button className="admin-cancel-btn" onClick={() => setTeamModal(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );

  const renderOpportunities = () => (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Volunteer Opportunities</h2>
        <button className="admin-add-btn" onClick={openOppAdd}><MdAdd /> Add Opportunity</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Location</th>
            <th>Days</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {opportunities.map(o => (
            <tr key={o.id}>
              <td>{o.title}</td>
              <td>{o.location}</td>
              <td>{o.days}</td>
              <td>
                <div className="admin-action-cell">
                  {oppDeleteId === o.id ? (
                    <DeleteConfirm onConfirm={() => deleteOpp(o.id)} onCancel={() => setOppDeleteId(null)} />
                  ) : (
                    <>
                      <button className="admin-action-btn edit" onClick={() => openOppEdit(o)}><MdEdit /></button>
                      <button className="admin-action-btn delete" onClick={() => setOppDeleteId(o.id)}><MdDelete /></button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {oppModal && (
        <Modal title={oppModal.mode === 'add' ? 'Add Opportunity' : 'Edit Opportunity'} onClose={() => setOppModal(null)}>
          <div className="admin-form">
            <label>Title</label>
            <input value={oppForm.title} onChange={e => setOppForm({ ...oppForm, title: e.target.value })} placeholder="Opportunity title" />
            <label>Description</label>
            <textarea value={oppForm.description} onChange={e => setOppForm({ ...oppForm, description: e.target.value })} placeholder="Description" rows={3} />
            <label>Location</label>
            <input value={oppForm.location} onChange={e => setOppForm({ ...oppForm, location: e.target.value })} placeholder="City" />
            <label>Days</label>
            <input value={oppForm.days} onChange={e => setOppForm({ ...oppForm, days: e.target.value })} placeholder="e.g. Weekdays, Flexible" />
            <div className="admin-form-actions">
              <button className="admin-save-btn" onClick={saveOpp}>Save</button>
              <button className="admin-cancel-btn" onClick={() => setOppModal(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );

  const renderWork = () => (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-title">Our Work</h2>
        <button className="admin-add-btn" onClick={openWorkAdd}><MdAdd /> Add Post</button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {work.map(w => (
            <tr key={w.id}>
              <td>{w.title}</td>
              <td>{w.category}</td>
              <td>{w.date}</td>
              <td>
                <div className="admin-action-cell">
                  {workDeleteId === w.id ? (
                    <DeleteConfirm onConfirm={() => deleteWork(w.id)} onCancel={() => setWorkDeleteId(null)} />
                  ) : (
                    <>
                      <button className="admin-action-btn edit" onClick={() => openWorkEdit(w)}><MdEdit /></button>
                      <button className="admin-action-btn delete" onClick={() => setWorkDeleteId(w.id)}><MdDelete /></button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {workModal && (
        <Modal title={workModal.mode === 'add' ? 'New Post' : 'Edit Post'} onClose={null} wide>
          <div className="admin-form">
            <label>Title</label>
            <input value={workForm.title} onChange={e => setWorkForm({ ...workForm, title: e.target.value })} placeholder="Post title" />
            <label>Category</label>
            <select value={workForm.category} onChange={e => setWorkForm({ ...workForm, category: e.target.value })}>
              <option value="">Select category</option>
              <option>Campaign</option>
              <option>Program</option>
              <option>Event</option>
              <option>Initiative</option>
            </select>
            <label>Date</label>
            <input type="date" value={workForm.date} onChange={e => setWorkForm({ ...workForm, date: e.target.value })} />
            <label>Content</label>
            <RichTextEditor
              content={workForm.content}
              onChange={html => setWorkForm(f => ({ ...f, content: html }))}
            />
            <div className="admin-form-actions">
              <button className="admin-save-btn" onClick={saveWork}>Post</button>
              <button className="admin-cancel-btn" onClick={() => setWorkModal(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );

  const renderHelp = () => (
    <div>
      <h2 className="admin-section-title">Help Requests</h2>
      {helpRequests.length === 0 ? (
        <p style={{ color: '#888', marginTop: 20 }}>No requests submitted yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Help Type</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {helpRequests.map(r => (
              <tr key={r.id}>
                <td>{r.firstName} {r.lastName}</td>
                <td>{r.helpType}</td>
                <td>{r.email}</td>
                <td>{r.phone ? r.phone.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') : '—'}</td>
                <td>{new Date(r.submittedAt).toLocaleDateString()}</td>
                <td>
                  <div className="admin-action-cell">
                    {helpDeleteId === r.id ? (
                      <DeleteConfirm onConfirm={() => deleteHelpRequest(r.id)} onCancel={() => setHelpDeleteId(null)} />
                    ) : (
                      <button className="admin-action-btn delete" onClick={() => setHelpDeleteId(r.id)}><MdDelete /></button>
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

  const toggleOrgApproval = (org) => {
    const endpoint = org.isApproved
      ? `${API_BASE}/api/organizations/${org.id}/revoke`
      : `${API_BASE}/api/organizations/${org.id}/approve`;
    fetch(endpoint, { method: 'PUT' })
      .then(res => res.json())
      .then(updated => setOrganizations(organizations.map(o => o.id === updated.id ? updated : o)))
      .catch(() => {});
  };

  const renderOrganizations = () => (
    <div>
      <h2 className="admin-section-title">Organizations</h2>
      {organizations.length === 0 ? (
        <p style={{ color: '#888', marginTop: 20 }}>No organizations registered yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map(org => (
              <tr key={org.id}>
                <td>{org.orgName}</td>
                <td>{org.contactName}</td>
                <td>{org.email}</td>
                <td>
                  <span className={`bg-badge ${org.isApproved ? 'approved' : 'pending'}`}>
                    {org.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td>
                  <button
                    className={`admin-action-btn ${org.isApproved ? 'revoke' : 'approve'}`}
                    onClick={() => toggleOrgApproval(org)}
                  >
                    {org.isApproved ? 'Revoke' : 'Approve'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':       return renderOverview();
      case 'users':          return renderUsers();
      case 'organizations':  return renderOrganizations();
      case 'team':           return renderTeam();
      case 'opportunities':  return renderOpportunities();
      case 'work':           return renderWork();
      case 'help':           return renderHelp();
      default:               return null;
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-header">
            <div className="admin-sidebar-title">Admin Panel</div>
            <div className="admin-sidebar-user">{user?.firstName} {user?.lastName}</div>
          </div>
          <div className="admin-sidebar-nav">
            {NAV_ITEMS.map(item => (
              <div
                key={item.id}
                className={`admin-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
          <div className="admin-sidebar-viewsite" onClick={() => navigate('/')}>
            <MdOpenInNew /> View Site
          </div>
          <div className="admin-sidebar-logout" onClick={handleLogout}>
            <MdLogout /> Log Out
          </div>
        </aside>
        <main className="admin-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
