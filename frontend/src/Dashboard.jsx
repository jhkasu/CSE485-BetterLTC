import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdDashboard, MdPerson, MdCalendarToday, MdHistory, MdCardMembership, MdLogout } from 'react-icons/md';
import Navbar from './Navbar';
import mockUsers from './mockUsers';
import './Dashboard.css';

const NAV_ITEMS = [
  { id: 'overview',  label: 'Overview',         icon: <MdDashboard /> },
  { id: 'profile',   label: 'Profile Settings',  icon: <MdPerson /> },
  { id: 'shifts',    label: 'Upcoming Shifts',   icon: <MdCalendarToday /> },
  { id: 'history',   label: 'Volunteer History', icon: <MdHistory /> },
  { id: 'cert',      label: 'Certificate',       icon: <MdCardMembership /> },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const mockUser = mockUsers.find(u => u.email === user?.email);
  const [activeSection, setActiveSection] = useState('overview');

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    setProfileSaved(false);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    const updated = { ...user, ...profileForm };
    localStorage.setItem('currentUser', JSON.stringify(updated));
    setProfileSaved(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/signin');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <>
            <h2 className="dashboard-section-title">Overview</h2>
            <div className="dashboard-placeholder">
              {/* TODO: Background check status badge + document upload (#54, #58) */}
              Background Check Status & Document Upload coming soon
            </div>
          </>
        );
      case 'profile':
        return (
          <>
            <h2 className="dashboard-section-title">Profile Settings</h2>
            <form className="profile-form" onSubmit={handleProfileSave}>

              <div className="profile-row">
                <div className="profile-field">
                  <label>First Name</label>
                  <input name="firstName" value={profileForm.firstName} onChange={handleProfileChange} />
                </div>
                <div className="profile-field">
                  <label>Last Name</label>
                  <input name="lastName" value={profileForm.lastName} onChange={handleProfileChange} />
                </div>
              </div>

              <div className="profile-row">
                <div className="profile-field">
                  <label>Email</label>
                  <input name="email" value={profileForm.email} disabled className="input-disabled" />
                </div>
                <div className="profile-field">
                  <label>Phone Number</label>
                  <input name="phone" value={profileForm.phone} onChange={handleProfileChange} placeholder="e.g. 416-555-0123" />
                </div>
              </div>

              <div className="profile-field full-width">
                <label>Address</label>
                <input name="address" value={profileForm.address} onChange={handleProfileChange} placeholder="e.g. 123 Main St, Toronto, ON" />
              </div>

              <div className="profile-field full-width">
                <label>Background Check Status</label>
                <div className={`bg-check-badge ${mockUser?.backgroundCheckApproved ? 'approved' : 'pending'}`}>
                  {mockUser?.backgroundCheckApproved ? 'Approved' : 'Pending'}
                </div>
              </div>

              <div className="profile-actions">
                {profileSaved && <span className="profile-saved-msg">Saved!</span>}
                <button type="submit" className="profile-save-btn">Save Changes</button>
              </div>

            </form>
          </>
        );
      case 'shifts':
        return (
          <>
            <h2 className="dashboard-section-title">Upcoming Shifts</h2>
            <div className="dashboard-placeholder">
              {/* TODO: Upcoming shifts list with cancel button (#60, #61, #63) */}
              Upcoming Shifts coming soon
            </div>
          </>
        );
      case 'history':
        return (
          <>
            <h2 className="dashboard-section-title">Volunteer History</h2>
            <div className="dashboard-placeholder">
              {/* TODO: Past activities list + total hours (#60, #61) */}
              Volunteer History & Total Hours coming soon
            </div>
          </>
        );
      case 'cert':
        return (
          <>
            <h2 className="dashboard-section-title">Certificate</h2>
            <div className="dashboard-placeholder">
              {/* TODO: PDF certificate download (#64) */}
              Certificate Download coming soon
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-page">
    <Navbar />
    <div className="dashboard-layout">

      {/* ── Sidebar ── */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-user">
          <div className="sidebar-user-name">{user?.firstName} {user?.lastName}</div>
          <div className="sidebar-user-role">{user?.role}</div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`sidebar-nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div className="sidebar-logout" onClick={handleLogout}>
          <MdLogout /> Log Out
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="dashboard-main">
        {renderContent()}
      </main>

    </div>
    </div>
  );
};

export default Dashboard;
