import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import AccessibilityMenu from './accessibility/AccessibilityMenu';
import LanguageToggle from './i18n/LanguageToggle';
import './Navbar.css';
import { clearSession, getCurrentUser } from './auth/session';

function Navbar() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const currentUser = getCurrentUser();

  const handleLogout = () => {
    clearSession();
    navigate('/signin');
  };

  const closeAboutOnBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setAboutOpen(false);
  };

  return (
    <header>
    <div className="utility-bar">
      <LanguageToggle />
      <AccessibilityMenu />
    </div>
    <nav aria-label={t('nav.ariaMain')}>
      <Link to="/" className="nav-logo-link">
        <Logo className="nav-logo" title={t('nav.logoHome')} />
      </Link>
      <button
        className="hamburger"
        aria-label={t('nav.menu')}
        aria-expanded={menuOpen}
        aria-controls="main-menu"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span aria-hidden="true">☰</span>
      </button>
      <ul id="main-menu" className={menuOpen ? 'open' : ''}>
        <li><Link to="/get-help">{t('nav.getHelp')}</Link></li>
        <li
          className="about-nav-item"
          onMouseEnter={() => setAboutOpen(true)}
          onMouseLeave={() => setAboutOpen(false)}
          onFocus={() => setAboutOpen(true)}
          onBlur={closeAboutOnBlur}
        >
          <Link to="/about" aria-haspopup="true" aria-expanded={aboutOpen}>{t('nav.aboutUs')}</Link>
          {aboutOpen && (
            <div className="about-dropdown">
              <Link to="/about/mission" onClick={() => setAboutOpen(false)}>{t('nav.missionVision')}</Link>
              <Link to="/about/history" onClick={() => setAboutOpen(false)}>{t('nav.ourHistory')}</Link>
              <Link to="/about/team" onClick={() => setAboutOpen(false)}>{t('nav.ourTeam')}</Link>
            </div>
          )}
        </li>
        <li><Link to="/organizations">{t('nav.volunteer')}</Link></li>
        <li><Link to="/our-work">{t('nav.ourWork')}</Link></li>
      </ul>

      <div className="nav-actions">
      {currentUser ? (
        <div className="user-menu">
          <button
            className="user-menu-btn"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {currentUser.firstName} <span aria-hidden="true">▾</span>
          </button>
          {dropdownOpen && (
            <div className="user-dropdown">
              <Link to={currentUser.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setDropdownOpen(false)}>{t('nav.dashboard')}</Link>
              <button type="button" onClick={handleLogout}>{t('common.logOut')}</button>
            </div>
          )}
        </div>
      ) : (
        <>
          <Link className="signin-btn" to="/signin">{t('nav.signIn')}</Link>
          <Link className="signup-nav-btn" to="/signup">{t('nav.signUp')}</Link>
        </>
      )}
      </div>

      <button className="donate-btn">{t('nav.donate')}</button>
    </nav>
    </header>
  );
}

export default Navbar;
