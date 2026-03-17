import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdDashboard, MdPerson, MdCalendarToday, MdHistory,
  MdLogout, MdCloudUpload, MdCheckCircle,
  MdCancel, MdAccessTime, MdLocationOn,
} from 'react-icons/md';
import Navbar from './Navbar';
import mockUsers from './mockUsers';
import './Dashboard.css';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview',         icon: <MdDashboard /> },
  { id: 'profile',  label: 'Profile Settings', icon: <MdPerson /> },
  { id: 'shifts',   label: 'Upcoming Shifts',  icon: <MdCalendarToday /> },
  { id: 'history',  label: 'Volunteer History',icon: <MdHistory /> },
];

/* ── Calendar helpers ── */
const CAL_DAYS   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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
  const user     = JSON.parse(localStorage.getItem('currentUser'));
  const mockUser = mockUsers.find(u => u.email === user?.email);

  const [activeSection, setActiveSection] = useState('overview');

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
  const [passwordMsg,  setPasswordMsg]  = useState(null); // { type:'success'|'error', text }

  /* ── Background check document upload (#54) ── */
  const [bgDoc,        setBgDoc]        = useState(null);   // { name }
  const [bgDocUploaded,setBgDocUploaded]= useState(false);

  /* ── Upcoming shifts with cancellation (#60, #75) ── */
  const [shifts,        setShifts]       = useState(mockUser?.upcomingShifts || []);
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
      setPasswordMsg({ type: 'error', text: 'Please enter your current password.' });
      return;
    }
    if (passwordForm.newPass.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
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

  /* ── Section renderers ── */
  const renderOverview = () => (
    <>
      <h2 className="dashboard-section-title">Overview</h2>

      {/* #58 — Background check status */}
      <div className="overview-card">
        <div className="overview-card-header">
          <span className="overview-card-label">Background Check Status</span>
          <div className={`bg-check-badge ${mockUser?.backgroundCheckApproved ? 'approved' : 'pending'}`}>
            {mockUser?.backgroundCheckApproved ? '✓  Approved' : '⏳  Pending Review'}
          </div>
        </div>
        {!mockUser?.backgroundCheckApproved && (
          <p className="overview-card-hint">
            Your background check is under review. Upload supporting documents below to speed up the process.
          </p>
        )}
      </div>

      {/* #54 — Document upload */}
      <div className="overview-card" style={{ marginTop: 24 }}>
        <div className="overview-card-label" style={{ marginBottom: 16 }}>
          Upload Background Check Document
        </div>

        {/* 제출 전 — 파일 선택 영역 */}
        {!bgDocUploaded && (
          <label className="upload-area" htmlFor="bg-doc-input">
            <MdCloudUpload className="upload-icon" />
            <span className="upload-area-text">
              {bgDoc ? bgDoc.name : 'Click to select a file  (PDF, JPG, PNG)'}
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

        {/* 파일 선택됐지만 아직 제출 전 */}
        {bgDoc && !bgDocUploaded && (
          <div className="upload-actions">
            <button className="upload-submit-btn" onClick={handleBgDocSubmit}>
              Submit Document
            </button>
            <button className="upload-remove-btn" onClick={handleBgDocRemove}>
              Remove
            </button>
          </div>
        )}

        {/* 제출 완료 */}
        {bgDocUploaded && (
          <div className="upload-submitted-row">
            <div className="upload-success">
              <MdCheckCircle style={{ marginRight: 8, fontSize: 22 }} />
              <span><strong>{bgDoc.name}</strong> submitted! We'll review it shortly.</span>
            </div>
            <button className="upload-remove-btn" onClick={handleBgDocRemove}>
              Remove Document
            </button>
          </div>
        )}
      </div>
    </>
  );

  const renderProfile = () => (
    <>
      <h2 className="dashboard-section-title">Profile Settings</h2>

      {/* #56 — Profile picture */}
      <div className="profile-pic-section">
        <div className="profile-pic-preview">
          {profilePic
            ? <img src={profilePic} alt="Profile" className="profile-pic-img" />
            : <div className="profile-pic-placeholder">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
          }
        </div>
        <label className="profile-pic-btn" htmlFor="profile-pic-input">
          Change Photo
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

        {/* #56 — Address */}
        <div className="profile-field full-width">
          <label>Address</label>
          <input name="address" value={profileForm.address} onChange={handleProfileChange} placeholder="e.g. 123 Main St, Toronto, ON" />
        </div>

        <div className="profile-actions">
          {profileSaved && <span className="profile-saved-msg">Saved!</span>}
          <button type="submit" className="profile-save-btn">Save Changes</button>
        </div>
      </form>

      {/* #56 — Password change */}
      <div className="password-section">
        <h3 className="password-section-title">Change Password</h3>
        <form className="profile-form" onSubmit={handlePasswordSave}>
          <div className="profile-field full-width">
            <label>Current Password</label>
            <input
              type="password"
              name="current"
              value={passwordForm.current}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
            />
          </div>

          <div className="profile-row">
            <div className="profile-field">
              <label>New Password</label>
              <input
                type="password"
                name="newPass"
                value={passwordForm.newPass}
                onChange={handlePasswordChange}
                placeholder="Min. 8 characters"
              />
            </div>
            <div className="profile-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirm"
                value={passwordForm.confirm}
                onChange={handlePasswordChange}
                placeholder="Re-enter new password"
              />
            </div>
          </div>

          {passwordMsg && (
            <div className={`password-msg ${passwordMsg.type}`}>{passwordMsg.text}</div>
          )}

          <div className="profile-actions">
            <button type="submit" className="profile-save-btn">Update Password</button>
          </div>
        </form>
      </div>
    </>
  );

  /* ── 리스트 뷰 ── */
  const renderShiftList = () => (
    shifts.length === 0
      ? <div className="dashboard-placeholder">No upcoming shifts scheduled.</div>
      : (
        <div className="shift-list">
          {shifts.map((shift) => (
            <div key={shift.id} className="shift-card">
              <div className="shift-card-left">
                <div className="shift-title">{shift.title}</div>
                <div className="shift-meta">
                  <span><MdCalendarToday className="shift-meta-icon" /> {shift.date}</span>
                  <span><MdAccessTime   className="shift-meta-icon" /> {shift.time}</span>
                  <span><MdLocationOn   className="shift-meta-icon" /> {shift.location}</span>
                </div>
              </div>
              <div className="shift-card-right">
                {cancelConfirm === shift.id ? (
                  <div className="cancel-confirm">
                    <span className="cancel-confirm-text">Cancel this shift?</span>
                    <button className="cancel-yes-btn" onClick={() => handleCancelShift(shift.id)}>Yes, Cancel</button>
                    <button className="cancel-no-btn"  onClick={() => setCancelConfirm(null)}>Keep</button>
                  </div>
                ) : (
                  <button className="cancel-shift-btn" onClick={() => setCancelConfirm(shift.id)}>
                    <MdCancel style={{ marginRight: 6 }} /> Cancel Shift
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )
  );

  /* ── 캘린더 뷰 ── */
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
        {/* 주 탐색 */}
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={() => setWeekOffset(w => w - 1)}>‹</button>
          <span className="cal-nav-label">
            {fmtHeader(weekDays[0])} – {fmtHeader(weekDays[6])}, {weekDays[0].getFullYear()}
          </span>
          <button className="cal-nav-btn" onClick={() => setWeekOffset(w => w + 1)}>›</button>
        </div>

        <div className="cal-grid">
          {/* 헤더 행 */}
          <div className="cal-header">
            <div className="cal-time-spacer" />
            {weekDays.map((d, i) => (
              <div key={i} className={`cal-day-header ${toDateString(d) === todayStr ? 'today' : ''}`}>
                <div className="cal-day-name">{CAL_DAYS[i]}</div>
                <div className="cal-day-date">{fmtHeader(d)}</div>
              </div>
            ))}
          </div>

          {/* 바디 */}
          <div className="cal-body">
            {/* 시간 레이블 */}
            <div className="cal-time-col">
              {hours.map(h => (
                <div key={h} className="cal-time-label" style={{ height: HOUR_HEIGHT }}>
                  {h === 12 ? '12 PM' : h < 12 ? `${h} AM` : `${h - 12} PM`}
                </div>
              ))}
            </div>

            {/* 요일 컬럼들 */}
            <div className="cal-days">
              {weekDays.map((d, dayIdx) => {
                const dateStr  = toDateString(d);
                const dayShifts = shifts.filter(s => s.date === dateStr);
                const isToday  = dateStr === todayStr;

                return (
                  <div
                    key={dayIdx}
                    className={`cal-day-col ${isToday ? 'today' : ''}`}
                    style={{ height: totalHeight }}
                  >
                    {/* 시간 구분선 */}
                    {hours.map(h => (
                      <div key={h} className="cal-hour-line"
                        style={{ top: (h - CAL_START) * HOUR_HEIGHT }} />
                    ))}

                    {/* 시프트 블록 */}
                    {dayShifts.map(shift => {
                      const { start, end } = parseShiftTime(shift.time);
                      const top    = (start - CAL_START) * HOUR_HEIGHT;
                      const height = Math.max((end - start) * HOUR_HEIGHT, 32);
                      return (
                        <div key={shift.id} className="cal-shift-block" style={{ top, height }}>
                          <div className="cal-shift-title">{shift.title}</div>
                          <div className="cal-shift-time">{shift.time}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ── 탭 전체 ── */
  const renderShifts = () => (
    <>
      <h2 className="dashboard-section-title">Upcoming Shifts</h2>

      <div className="shift-view-toggle">
        <button
          className={`shift-view-btn ${shiftView === 'list' ? 'active' : ''}`}
          onClick={() => setShiftView('list')}
        >List</button>
        <button
          className={`shift-view-btn ${shiftView === 'calendar' ? 'active' : ''}`}
          onClick={() => setShiftView('calendar')}
        >Calendar</button>
      </div>

      {shiftView === 'list' ? renderShiftList() : renderCalendar()}
    </>
  );

  const renderHistory = () => {
    const history    = mockUser?.volunteerHistory || [];
    const totalHours = history.reduce((sum, h) => sum + h.hours, 0);
    return (
      <>
        <h2 className="dashboard-section-title">Volunteer History</h2>

        <div className="history-summary">
          <div className="history-summary-label">Total Hours Volunteered</div>
          <div className="history-summary-hours-row">
            <span className="history-summary-hours">{totalHours}</span>
            <span className="history-summary-unit">hrs</span>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="dashboard-placeholder">No volunteer history yet.</div>
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
                <div className="history-card-hours">{item.hours} hrs</div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'profile':  return renderProfile();
      case 'shifts':   return renderShifts();
      case 'history':  return renderHistory();
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
                ? <img src={profilePic} alt="Profile" className="sidebar-avatar-img" />
                : <div className="sidebar-avatar-initials">{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
              }
            </div>
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
