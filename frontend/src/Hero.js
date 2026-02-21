import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

function Hero() {
  const navigate = useNavigate();
  return (
    <div className="hero">
      <h1>CARE. CONNECT. COMMUNITY.</h1>
      <p>Join us in making a difference in the lives of Canadian seniors and communities.</p>
      <div>
        <button className="hero-primary" onClick={() => navigate('/signup')}>Sign Up</button>
        <button className="hero-secondary">Volunteer</button>
        <button className="hero-donate">Donate Now</button>
      </div>
    </div>
  );
}

export default Hero;