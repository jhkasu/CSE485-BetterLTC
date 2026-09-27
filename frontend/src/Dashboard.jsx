import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MdDashboard, MdPerson, MdCalendarToday, MdHistory,
  MdLogout, MdCloudUpload, MdCheckCircle,
  MdCancel, MdAccessTime, MdLocationOn, MdAssignment,
} from 'react-icons/md';
import Navbar from './Navbar';
import './Dashboard.css';
import API_BASE from './config';

const NAV_ITEMS = [
  { id: 'overview',      labelKey: 'common.overview',            icon: <MdDashboard /> },
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

function parseTimeDecimal(t) {
  // "10:00 AM" → 10.0 ,  "2:30 PM" → 14.5
  const [timePart, period] = t.trim().split(' ');
  let [h, m] = timePart.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h + m / 60;
}

function parseShiftTime(timeStr) {
  // "10:00 AM – 12:00 PM"
  const [s, e] = timeStr.split('–').map(p => p.trim());
  return { start: parseTimeDecimal(s), end: parseTimeDecimal(e) };
}

function toDateString(d) {
  // local YYYY-MM-DD (avoids UTC offset issues)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('currentUser')));
  const [applications, setApplications] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (user?.id) {
      fetch(`${API_BASE}/api/volunteers/${user.id}`)
        .then(res => res.json())
        .then(data => {
          const updated = { ...user, backgroundCheckApproved: data.backgroundCheckApproved };
          localStorage.setItem('currentUser', JSON.stringify(updated));
          setUser(updated);
        })
        .catch(() => {});
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetch(`${API_BASE}/api/registrations/volunteer/${user.id}`)
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

  /* ── Profile picture (#56) ── */
  const [profilePic, setProfilePic] = useState(user?.profilePic || null);

  /* ── Password change (#56) ── */
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordMsg,  setPasswordMsg]  = useState(null);

  /* ── Background check document upload (#54) ── */
  const [bgDoc,        setBgDoc]        = useState(null);   // { name }
  const [bgDocUploaded,setBgDocUploaded]= useState(false);

  /* ── Upcoming shifts with cancellation (#60, #75) ── */
  const [shifts,        setShifts]       = useState([]);
  const [cancelConfirm, setCancelConfirm]= useState(null); // shift id pending confirm

  /* ── Shift view (list / calendar) ── */
  const [shiftView,   setShiftView]  = useState('list');
  const [weekOffset,  setWeekOffset] = useState(0);

  /* ── Handlers ── */
  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    setProfileSaved(false);
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    const updated = { ...user, ...profileForm, profilePic };
    localStorage.setItem('currentUser', JSON.stringify(updated));
    setProfileSaved(true);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePic(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordMsg(null);
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    if (!passwordForm.current) {
      setPasswordMsg({ type: 'error', key: 'dashboard.profile.errors.currentRequired' });
      return;
    }
    if (passwordForm.newPass.length < 8) {
      setPasswordMsg({ type: 'error', key: 'dashboard.profile.errors.newShort' });
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordMsg({ type: 'error', key: 'dashboard.profile.errors.newMismatch' });
      return;
    }
    setPasswordMsg({ type: 'success', key: 'dashboard.profile.passwordUpdated' });
    setPasswordForm({ current: '', newPass: '', confirm: '' });
  };

  const handleBgDocChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBgDoc({ name: file.name });
    setBgDocUploaded(false);
  };

  const handleBgDocSubmit = () => {
    if (!bgDoc) return;
    setBgDocUploaded(true);
  };

  const handleBgDocRemove = () => {
    setBgDoc(null);
    setBgDocUploaded(false);
    // reset the file input so the same file can be re-selected
    const input = document.getElementById('bg-doc-input');
    if (input) input.value = '';
  };

  const handleCancelShift = (shiftId) => {
    setShifts(shifts.filter(s => s.id !== shiftId));
    setCancelConfirm(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/signin');
  };

  const SUBMITTED_MARK = '\u0000';
  const [submittedBefore, submittedAfter = ''] = t('dashboard.bgCheck.submitted', { file: SUBMITTED_MARK }).split(SUBMITTED_MARK);

  /* ── Section renderers ── */
  const renderOverview = () => (
    <>
      <h2 className="dashboard-section-title">{t('common.overview')}</h2>

      {/* #58 — Background check status */}
      <div className="overview-card">
        <div className="overview-card-header">
          <span className="overview-card-label">{t('dashboard.bgCheck.heading')}</span>
          <div className={`bg-check-badge ${user?.backgroundCheckApproved ? 'approved' : 'pending'}`}>
            {user?.backgroundCheckApproved ? `✓  ${t('dashboard.bgCheck.approved')}` : `⏳  ${t('dashboard.bgCheck.pending')}`}
          </div>
        </div>
        {!user?.backgroundCheckApproved && (
          <p className="overview-card-hint">
            {t('dashboard.bgCheck.underReview')}
          </p>
        )}
      </div>

      {/* #54 — Document upload */}
      <div className="overview-card" style={{ marginTop: 24 }}>
        <div className="overview-card-label" style={{ marginBottom: 16 }}>
          {t('dashboard.bgCheck.uploadHeading')}
        </div>

        {!bgDocUploaded && (
          <label className="upload-area" htmlFor="bg-doc-input">
            <MdCloudUpload className="upload-icon" />
            <span className="upload-area-text">
              {bgDoc ? bgDoc.name : t('dashboard.bgCheck.selectFile')}
            </span>
            <input
              id="bg-doc-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={handleBgDocChange}
            />
          </label>
        )}

        {bgDoc && !bgDocUploaded && (
          <div className="upload-actions">
            <button className="upload-submit-btn" onClick={handleBgDocSubmit}>
              {t('dashboard.bgCheck.submit')}
            </button>
            <button className="upload-remove-btn" onClick={handleBgDocRemove}>
              {t('common.remove')}
            </button>
          </div>
        )}

        {bgDocUploaded && (
          <div className="upload-submitted-row">
            <div className="upload-success">
              <MdCheckCircle style={{ marginRight: 8, fontSize: 22 }} />
              <span>{submittedBefore}<strong>{bgDoc.name}</strong>{submittedAfter}</span>
            </div>
            <button className="upload-remove-btn" onClick={handleBgDocRemove}>
              {t('dashboard.bgCheck.removeDocument')}
            </button>
          </div>
        )}
      </div>
    </>
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
          <button type="submit" className="profile-save-btn">{t('dashboard.profile.saveChanges')}</button>
        </div>
      </form>

      {/* #56 — Password change */}
      <div className="password-section">
        <h3 className="password-section-title">{t('dashboard.profile.changePassword')}</h3>
        <form className="profile-form" onSubmit={handlePasswordSave}>
          <div className="profile-field full-width">
            <label>{t('dashboard.profile.currentPassword')}</label>
            <input
              type="password"
              name="current"
              value={passwordForm.current}
              onChange={handlePasswordChange}
              placeholder={t('dashboard.profile.placeholders.currentPassword')}
            />
          </div>

          <div className="profile-row">
            <div className="profile-field">
              <label>{t('dashboard.profile.newPassword')}</label>
              <input
                type="password"
                name="newPass"
                value={passwordForm.newPass}
                onChange={handlePasswordChange}
                placeholder={t('dashboard.profile.placeholders.newPassword')}
              />
            </div>
            <div className="profile-field">
              <label>{t('dashboard.profile.confirmNewPassword')}</label>
              <input
                type="password"
                name="confirm"
                value={passwordForm.confirm}
                onChange={handlePasswordChange}
                placeholder={t('dashboard.profile.placeholders.confirmNewPassword')}
              />
            </div>
          </div>

          {passwordMsg && (
            <div className={`password-msg ${passwordMsg.type}`}>{t(passwordMsg.key)}</div>
          )}

          <div className="profile-actions">
            <button type="submit" className="profile-save-btn">{t('dashboard.profile.updatePassword')}</button>
          </div>
        </form>
      </div>
    </>
  );

  const approvedApplications = applications.filter(a => a.status === 'Approved');

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
                  <span><MdLocationOn className="shift-meta-icon" /> {app.orgName}</span>
                  <span><MdCalendarToday className="shift-meta-icon" /> {t('dashboard.shifts.approvedOn', { date: app.registeredAt })}</span>
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
                const dayShifts = approvedApplications.filter(a => a.registeredAt === dateStr);
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
    const history = [];
    const totalHours = history.reduce((sum, h) => sum + h.hours, 0);
    return (
      <>
        <h2 className="dashboard-section-title">{t('dashboard.nav.history')}</h2>


        {history.length === 0 ? (
          <div className="dashboard-placeholder">{t('dashboard.history.empty')}</div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className="history-card">
                <div className="history-card-info">
                  <div className="history-card-title">{item.title}</div>
                  <div className="shift-meta">
                    <span><MdCalendarToday className="shift-meta-icon" /> {item.date}</span>
                    <span><MdLocationOn   className="shift-meta-icon" /> {item.location}</span>
                  </div>
                </div>
                <div className="history-card-hours">{t('dashboard.history.hours', { hours: item.hours })}</div>
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
