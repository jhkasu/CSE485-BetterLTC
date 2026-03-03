import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/signin');
  };

  return (
    <nav>
      <img src="/logo2.png" alt="BetterLTC" style={{height: '150px', cursor: 'pointer'}} onClick={() => navigate('/')} />
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>
      <ul className={menuOpen ? 'open' : ''}>
        <li>Get Help</li>
        <li>About Us</li>
        <li onClick={() => navigate('/volunteer')}>Volunteer</li>
        <li>Our Work</li>
      </ul>

      {currentUser ? (
        <div className="user-menu">
          <button className="user-menu-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {currentUser.firstName} ▾
          </button>
          {dropdownOpen && (
            <div className="user-dropdown">
              <div onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }}>Dashboard</div>
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
