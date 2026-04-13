import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  return (
    <nav>
      <img src="/logo.png" alt="BetterLTC" style={{height: '180px', cursor: 'pointer', flexShrink: 0}} onClick={() => navigate('/')} />
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>
      <ul className={menuOpen ? 'open' : ''}>
        <li onClick={() => navigate('/get-help')}>Get Help</li>
        <li
          className="about-nav-item"
          onMouseEnter={() => setAboutOpen(true)}
          onMouseLeave={() => setAboutOpen(false)}
          onClick={() => navigate('/about')}
        >
          About Us
          {aboutOpen && (
            <div className="about-dropdown">
              <div onClick={(e) => { e.stopPropagation(); navigate('/about/mission'); setAboutOpen(false); }}>Mission &amp; Vision</div>
              <div onClick={(e) => { e.stopPropagation(); navigate('/about/history'); setAboutOpen(false); }}>Our History</div>
              <div onClick={(e) => { e.stopPropagation(); navigate('/about/team'); setAboutOpen(false); }}>Our Team</div>
            </div>
          )}
        </li>
        <li onClick={() => navigate('/volunteer')}>Volunteer</li>
        <li onClick={() => navigate('/our-work')}>Our Work</li>
      </ul>

      {currentUser ? (
        <div className="user-menu">
          <button className="user-menu-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {currentUser.firstName} ▾
          </button>
          {dropdownOpen && (
            <div className="user-dropdown">
              <div onClick={() => { navigate(currentUser.role === 'admin' ? '/admin' : '/dashboard'); setDropdownOpen(false); }}>Dashboard</div>
              <div onClick={handleLogout}>Log Out</div>
            </div>
          )}
        </div>
      ) : (
        <>
          <button className="signin-btn" onClick={() => navigate('/signin')}>Sign In</button>
          <button className="signup-nav-btn" onClick={() => navigate('/signup')}>Sign Up</button>
        </>
      )}

      <button className="donate-btn">Donate now</button>
    </nav>
  );
}

export default Navbar;
