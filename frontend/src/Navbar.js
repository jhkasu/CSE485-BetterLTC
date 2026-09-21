import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/signin');
  };

  const closeAboutOnBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setAboutOpen(false);
  };

  return (
    <header>
    <nav aria-label="Main">
      <Link to="/" className="nav-logo-link">
        <Logo className="nav-logo" title="VolunteerConnect Saskatchewan home" />
      </Link>
      <button
        className="hamburger"
        aria-label="Menu"
        aria-expanded={menuOpen}
        aria-controls="main-menu"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span aria-hidden="true">☰</span>
      </button>
      <ul id="main-menu" className={menuOpen ? 'open' : ''}>
        <li><Link to="/get-help">Get Help</Link></li>
        <li
          className="about-nav-item"
          onMouseEnter={() => setAboutOpen(true)}
          onMouseLeave={() => setAboutOpen(false)}
          onFocus={() => setAboutOpen(true)}
          onBlur={closeAboutOnBlur}
        >
          <Link to="/about" aria-haspopup="true" aria-expanded={aboutOpen}>About Us</Link>
          {aboutOpen && (
            <div className="about-dropdown">
              <Link to="/about/mission" onClick={() => setAboutOpen(false)}>Mission &amp; Vision</Link>
              <Link to="/about/history" onClick={() => setAboutOpen(false)}>Our History</Link>
              <Link to="/about/team" onClick={() => setAboutOpen(false)}>Our Team</Link>
            </div>
          )}
        </li>
        <li><Link to="/volunteer">Volunteer</Link></li>
        <li><Link to="/our-work">Our Work</Link></li>
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
              <Link to={currentUser.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setDropdownOpen(false)}>Dashboard</Link>
              <button type="button" onClick={handleLogout}>Log Out</button>
            </div>
          )}
        </div>
      ) : (
        <>
          <Link className="signin-btn" to="/signin">Sign In</Link>
          <Link className="signup-nav-btn" to="/signup">Sign Up</Link>
        </>
      )}
      </div>

      <button className="donate-btn">Donate now</button>
    </nav>
    </header>
  );
}

export default Navbar;
