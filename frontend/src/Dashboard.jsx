import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MdDashboard, MdPerson, MdCalendarToday, MdHistory,
  MdLogout, MdVerifiedUser,
  MdLocationOn, MdAssignment, MdTune,
} from 'react-icons/md';
import Navbar from './Navbar';
import './Dashboard.css';
import apiFetch from './api';
import { clearSession, getCurrentUser } from './auth/session';
import ChangePasswordForm from './auth/ChangePasswordForm';
import VolunteerMatchingProfile from './VolunteerMatchingProfile';
import BackgroundCheck from './BackgroundCheck';
import VolunteerOverview from './VolunteerOverview';

const NAV_ITEMS = [
  { id: 'overview',      labelKey: 'common.overview',            icon: <MdDashboard /> },
  { id: 'matching',      labelKey: 'dashboard.nav.matching',     icon: <MdTune /> },
  { id: 'bgCheck',       labelKey: 'dashboard.nav.bgCheck',      icon: <MdVerifiedUser /> },
  { id: 'applications',  labelKey: 'dashboard.nav.applications', icon: <MdAssignment /> },
  { id: 'profile',       labelKey: 'dashboard.nav.profile',      icon: <MdPerson /> },
  { id: 'shifts',        labelKey: 'dashboard.nav.shifts',       icon: <MdCalendarToday /> },
  { id: 'history',       labelKey: 'dashboard.nav.history',      icon: <MdHistory /> },
];

/* ── Calendar helpers ── */
const CAL_DAYS   = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const HOUR_HEIGHT = 72;  // px per hour
const CAL_START   = 8;   // 8 AM
const CAL_END     = 21;  // 9 PM

function getMondayOf(d) {
  const date = new Date(d);
  const day  = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function listingDays(app) {
  return (app.days || '').split(',').map(d => d.trim()).filter(Boolean);
}

function runsOn(app, date) {
  const dateStr = toDateString(date);
  if (!app.startDate && !app.endDate) return false;
  if (app.startDate && dateStr < app.startDate) return false;
  if (app.endDate && dateStr > app.endDate) return false;
  const days = listingDays(app);
  return days.length === 0 || days.includes(WEEKDAY_NAMES[date.getDay()]);
}

function toDateString(d) {
  // local YYYY-MM-DD (avoids UTC offset issues)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(() => getCurrentUser());
  const [applications, setApplications] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [volunteerData, setVolunteerData] = useState(null);
  const [bgCheck, setBgCheck] = useState(null);

  useEffect(() => {
    if (user?.id) {
      apiFetch(`/api/volunteers/${user.id}`)
        .then(res => res.json())
        .then(data => {
          const updated = {
            ...user,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            address: data.address,
            backgroundCheckApproved: data.backgroundCheckApproved,
          };
          localStorage.setItem('currentUser', JSON.stringify(updated));
          setUser(updated);
          setVolunteerData(data);
          setProfileForm(form => ({
            ...form,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone || '',
            address: data.address || '',
          }));
        })
        .catch(() => {});
    }
  }, [user?.id]);

  useEffect(() => {
    apiFetch('/api/background-checks/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (data) setBgCheck(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.id) {
      apiFetch(`/api/registrations/volunteer/${user.id}`)
        .then(res => res.json())
        .then(data => setApplications(data))
        .catch(() => {});
    }
  }, [user?.id]);

  /* ── Profile basic info ── */
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    email:     user?.email     || '',
    phone:     user?.phone     || '',
    address:   user?.address   || '',
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState(false);

  /* ── Profile picture (#56) ── */
  const [profilePic, setProfilePic] = useState(user?.profilePic || null);

  /* ── Shift view (list / calendar) ── */
  const [shiftView,   setShiftView]  = useState('list');
  const [weekOffset,  setWeekOffset] = useState(0);

  /* ── Handlers ── */
  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    setProfileSaved(false);
    setProfileError(false);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setProfileSaved(false);
    setProfileError(false);
    apiFetch(`/api/volunteers/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
        address: profileForm.address,
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error('save failed');
        return res.json();
      })
      .then(data => {
        const updated = { ...user, firstName: data.firstName, lastName: data.lastName, phone: data.phone, address: data.address, profilePic };
        localStorage.setItem('currentUser', JSON.stringify(updated));
        setUser(updated);
        setProfileSaved(true);
      })
      .catch(() => setProfileError(true));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePic(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    clearSession();
    navigate('/signin');
  };

  /* ── Section renderers ── */
  const renderOverview = () => (
    <VolunteerOverview
      user={user}
      volunteer={volunteerData}
      applications={applications}
      bgCheck={bgCheck}
      onNavigate={setActiveSection}
    />
  );

  const renderProfile = () => (
    <>
      <h2 className="dashboard-section-title">{t('dashboard.nav.profile')}</h2>

      {/* #56 — Profile picture */}
      <div className="profile-pic-section">
        <div className="profile-pic-preview">
          {profilePic
            ? <img src={profilePic} alt={t('dashboard.profile.photoAlt')} className="profile-pic-img" />
            : <div className="profile-pic-placeholder">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
          }
        </div>
        <label className="profile-pic-btn" htmlFor="profile-pic-input">
          {t('dashboard.profile.changePhoto')}
        </label>
        <input
          id="profile-pic-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleProfilePicChange}
        />
      </div>

      {/* Basic info */}
      <form className="profile-form" onSubmit={handleProfileSave} style={{ marginTop: 28 }}>
        <div className="profile-row">
          <div className="profile-field">
            <label>{t('common.firstName')}</label>
            <input name="firstName" value={profileForm.firstName} onChange={handleProfileChange} />
          </div>
          <div className="profile-field">
            <label>{t('common.lastName')}</label>
            <input name="lastName" value={profileForm.lastName} onChange={handleProfileChange} />
          </div>
        </div>

        <div className="profile-row">
          <div className="profile-field">
            <label>{t('common.email')}</label>
            <input name="email" value={profileForm.email} disabled className="input-disabled" />
          </div>
          <div className="profile-field">
            <label>{t('dashboard.profile.phoneNumber')}</label>
            <input name="phone" value={profileForm.phone} onChange={handleProfileChange} placeholder={t('dashboard.profile.placeholders.phone')} />
          </div>
        </div>

        {/* #56 — Address */}
        <div className="profile-field full-width">
          <label>{t('dashboard.profile.address')}</label>
          <input name="address" value={profileForm.address} onChange={handleProfileChange} placeholder={t('dashboard.profile.placeholders.address')} />
        </div>

        <div className="profile-actions">
          {profileSaved && <span className="profile-saved-msg">{t('dashboard.profile.saved')}</span>}
          {profileError && <span className="profile-error-msg">{t('dashboard.profile.saveFailed')}</span>}
          <button type="submit" className="profile-save-btn">{t('dashboard.profile.saveChanges')}</button>
        </div>
      </form>

      <div className="profile-password">
        <ChangePasswordForm />
      </div>
    </>
  );

  const approvedApplications = applications.filter(a => a.status === 'Approved');

  const formatSchedule = (app) => {
    const range = [app.startDate, app.endDate].filter(Boolean).join(' – ');
    const days = listingDays(app).map(d => t(`options.days.${d.toLowerCase()}`, { defaultValue: d })).join(', ');
    return [range, days].filter(Boolean).join(' · ') || t('dashboard.shifts.noSchedule');
  };

  const renderShiftList = () => (
    approvedApplications.length === 0
      ? <div className="dashboard-placeholder">{t('dashboard.shifts.empty')}</div>
      : (
        <div className="shift-list">
          {approvedApplications.map((app) => (
            <div key={app.id} className="shift-card">
              <div className="shift-card-left">
                <div className="shift-title">{app.listingTitle}</div>
                <div className="shift-meta">
                  <span><MdLocationOn className="shift-meta-icon" /> {app.orgName}{app.location ? ` · ${app.location}` : ''}</span>
                  <span><MdCalendarToday className="shift-meta-icon" /> {formatSchedule(app)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
  );

  const renderCalendar = () => {
    const monday   = getMondayOf(new Date());
    monday.setDate(monday.getDate() + weekOffset * 7);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return d;
    });

    const hours       = Array.from({ length: CAL_END - CAL_START }, (_, i) => CAL_START + i);
    const totalHeight = (CAL_END - CAL_START) * HOUR_HEIGHT;
    const todayStr    = toDateString(new Date());

    const fmtHeader = (d) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
      <div className="cal-wrapper">
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={() => setWeekOffset(w => w - 1)}>‹</button>
          <span className="cal-nav-label">
            {fmtHeader(weekDays[0])} – {fmtHeader(weekDays[6])}, {weekDays[0].getFullYear()}
          </span>
          <button className="cal-nav-btn" onClick={() => setWeekOffset(w => w + 1)}>›</button>
        </div>

        <div className="cal-grid">
          <div className="cal-header">
            <div className="cal-time-spacer" />
            {weekDays.map((d, i) => (
              <div key={i} className={`cal-day-header ${toDateString(d) === todayStr ? 'today' : ''}`}>
                <div className="cal-day-name">{t(`options.daysShort.${CAL_DAYS[i]}`)}</div>
                <div className="cal-day-date">{fmtHeader(d)}</div>
              </div>
            ))}
          </div>

          <div className="cal-body">
            <div className="cal-time-col">
              {hours.map(h => (
                <div key={h} className="cal-time-label" style={{ height: HOUR_HEIGHT }}>
                  {h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`}
                </div>
              ))}
            </div>

            <div className="cal-days">
              {weekDays.map((d, dayIdx) => {
                const dateStr   = toDateString(d);
                const dayShifts = approvedApplications.filter(a => runsOn(a, d));
                const isToday   = dateStr === todayStr;

                return (
                  <div
                    key={dayIdx}
                    className={`cal-day-col ${isToday ? 'today' : ''}`}
                    style={{ height: totalHeight }}
                  >
                    {hours.map(h => (
                      <div key={h} className="cal-hour-line"
                        style={{ top: (h - CAL_START) * HOUR_HEIGHT }} />
                    ))}

                    {dayShifts.map((app, i) => (
                      <div key={app.id} className="cal-shift-block" style={{ top: i * 80 + 8, height: 68 }}>
                        <div className="cal-shift-title">{app.listingTitle}</div>
                        <div className="cal-shift-time">{app.orgName}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderShifts = () => (
    <>
      <h2 className="dashboard-section-title">{t('dashboard.nav.shifts')}</h2>

      <div className="shift-view-toggle">
        <button
          className={`shift-view-btn ${shiftView === 'list' ? 'active' : ''}`}
          onClick={() => setShiftView('list')}
        >{t('dashboard.shifts.list')}</button>
        <button
          className={`shift-view-btn ${shiftView === 'calendar' ? 'active' : ''}`}
          onClick={() => setShiftView('calendar')}
        >{t('dashboard.shifts.calendar')}</button>
      </div>

      {shiftView === 'list' ? renderShiftList() : renderCalendar()}
    </>
  );

  const renderApplications = () => (
    <>
      <h2 className="dashboard-section-title">{t('dashboard.nav.applications')}</h2>
      {applications.length === 0 ? (
        <div className="dashboard-placeholder">{t('dashboard.applications.empty')}</div>
      ) : (
        <div className="applications-list">
          {applications.map(app => (
            <div key={app.id} className="application-card">
              <div className="application-card-left">
                <div className="application-title">{app.listingTitle}</div>
                <div className="application-org">{app.orgName}</div>
                <div className="application-date">{t('dashboard.applications.appliedOn', { date: app.registeredAt })}</div>
              </div>
              <div className={`application-status-badge ${app.status.toLowerCase()}`}>
                {t(`options.applicationStatus.${app.status.toLowerCase()}`, { defaultValue: app.status })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderHistory = () => {
    const history = applications.filter(a => a.status === 'Completed');
    const totalHours = history.reduce((sum, h) => sum + (h.hoursServed || 0), 0);
    return (
      <>
        <h2 className="dashboard-section-title">{t('dashboard.nav.history')}</h2>
        <div className="history-summary">
          <div className="history-summary-label">{t('dashboard.history.totalHours')}</div>
          <div className="history-summary-hours-row">
            <span className="history-summary-hours">{totalHours}</span>
            <span className="history-summary-unit">{t('dashboard.history.hoursUnit')}</span>
          </div>
        </div>
        {history.length === 0 ? (
          <div className="dashboard-placeholder">{t('dashboard.history.empty')}</div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className="history-card">
                <div className="history-card-info">
                  <div className="history-card-title">{item.listingTitle}</div>
                  <div className="shift-meta">
                    <span><MdCalendarToday className="shift-meta-icon" /> {item.completedAt}</span>
                    <span><MdLocationOn   className="shift-meta-icon" /> {item.orgName}{item.location ? ` · ${item.location}` : ''}</span>
                  </div>
                </div>
                <div className="history-card-hours">{t('dashboard.history.hours', { hours: item.hoursServed })}</div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':     return renderOverview();
      case 'bgCheck':      return <BackgroundCheck onChange={setBgCheck} />;
      case 'matching':     return volunteerData && (
        <VolunteerMatchingProfile volunteer={volunteerData} onSaved={setVolunteerData} />
      );
      case 'applications': return renderApplications();
      case 'profile':      return renderProfile();
      case 'shifts':       return renderShifts();
      case 'history':      return renderHistory();
      default: return null;
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-layout">

        {/* ── Sidebar ── */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {profilePic
                ? <img src={profilePic} alt={t('dashboard.profile.photoAlt')} className="sidebar-avatar-img" />
                : <div className="sidebar-avatar-initials">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
              }
            </div>
            <div className="sidebar-user-name">{user?.firstName} {user?.lastName}</div>
            <div className="sidebar-user-role">{user?.role === 'volunteer' ? t('dashboard.roleVolunteer') : user?.role}</div>
          </div>

          <nav className="sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.id}
                className={`sidebar-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {t(item.labelKey)}
              </div>
            ))}
          </nav>

          <div className="sidebar-logout" onClick={handleLogout}>
            <MdLogout /> {t('common.logOut')}
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
