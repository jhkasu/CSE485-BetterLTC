import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdLogout, MdOpenInNew, MdLock, MdInbox, MdAssignmentTurnedIn, MdBusiness } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import AccessibilityMenu from './accessibility/AccessibilityMenu';
import LanguageToggle from './i18n/LanguageToggle';
import './OrgDashboard.css';
import apiFetch from './api';
import { clearSession, getCurrentUser } from './auth/session';
import ChangePasswordForm from './auth/ChangePasswordForm';
import { HelpRequestList, AcceptedRequestList, HelpRequestDetail } from './OrgHelpRequests';
import OrgProfile from './OrgProfile';

const NAV_ITEMS = [
  { id: 'requests', labelKey: 'orgDashboard.nav.requests', icon: <MdInbox /> },
  { id: 'accepted', labelKey: 'orgDashboard.nav.accepted', icon: <MdAssignmentTurnedIn /> },
  { id: 'profile', labelKey: 'orgDashboard.nav.profile', icon: <MdBusiness /> },
  { id: 'account', labelKey: 'common.account', icon: <MdLock /> },
];

function OrgDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getCurrentUser());
  const [activeSection, setActiveSection] = useState('requests');
  const [requestDetailId, setRequestDetailId] = useState(null);
  const [orgProfile, setOrgProfile] = useState(null);

  useEffect(() => {
    if (user?.id) {
      apiFetch(`/api/organizations/${user.id}`)
        .then(res => res.json())
        .then(data => {
          const updated = { ...user, orgName: data.orgName, isApproved: data.isApproved };
          localStorage.setItem('currentUser', JSON.stringify(updated));
          setUser(updated);
          setOrgProfile(data);
        })
        .catch(() => {});
    }
  }, [user?.id]);

  const handleLogout = () => {
    clearSession();
    navigate('/signin');
  };

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
                onClick={() => { setActiveSection(item.id); setRequestDetailId(null); }}
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
          {activeSection === 'requests' && (
            <HelpRequestList
              needsProfile={!!orgProfile && (!orgProfile.serviceAreas?.length || !orgProfile.helpTypes?.length)}
              onSetupProfile={() => setActiveSection('profile')}
              onAccepted={(id) => { setActiveSection('accepted'); setRequestDetailId(id); }}
            />
          )}
          {activeSection === 'accepted' && (requestDetailId
            ? <HelpRequestDetail id={requestDetailId} onBack={() => setRequestDetailId(null)} />
            : <AcceptedRequestList onOpen={setRequestDetailId} />)}
          {activeSection === 'profile' && orgProfile && (
            <OrgProfile
              org={orgProfile}
              onSaved={(saved) => {
                setOrgProfile(saved);
                const updated = { ...user, orgName: saved.orgName };
                localStorage.setItem('currentUser', JSON.stringify(updated));
                setUser(updated);
              }}
            />
          )}
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
