import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdPerson, MdLogout, MdTune } from 'react-icons/md';
import Navbar from './Navbar';
import './Dashboard.css';
import apiFetch from './api';
import { clearSession, getCurrentUser } from './auth/session';
import ChangePasswordForm from './auth/ChangePasswordForm';
import VolunteerMatchingProfile from './VolunteerMatchingProfile';

const NAV_ITEMS = [
  { id: 'matching', labelKey: 'dashboard.nav.matching', icon: <MdTune /> },
  { id: 'profile',  labelKey: 'dashboard.nav.profile',  icon: <MdPerson /> },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(() => getCurrentUser());
  const [activeSection, setActiveSection] = useState('matching');
  const [volunteerData, setVolunteerData] = useState(null);

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

  const renderContent = () => {
    switch (activeSection) {
      case 'matching':     return volunteerData && (
        <VolunteerMatchingProfile volunteer={volunteerData} onSaved={setVolunteerData} />
      );
      case 'profile':      return renderProfile();
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
