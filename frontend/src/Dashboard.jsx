import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdDashboard, MdPerson, MdCalendarToday, MdHistory, MdCardMembership, MdLogout } from 'react-icons/md';
import Navbar from './Navbar';
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
  const [activeSection, setActiveSection] = useState('overview');

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
            <div className="dashboard-placeholder">
              {/* TODO: Profile settings form — password, address, photo (#56) */}
              Profile Settings form coming soon
            </div>
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
