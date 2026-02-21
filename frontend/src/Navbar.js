import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  return (
    <nav>
        <img src="/logo.png" alt="BetterLTC" style={{height: '100px', cursor: 'pointer'}} onClick={() => navigate('/')} />      <ul>
        <li>Get Help</li>
        <li>Give</li>
        <li>Volunteer</li>
        <li>Our Work</li>
      </ul>
      <button>Donate now</button>
    </nav>
  );
}

export default Navbar;