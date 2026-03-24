import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

function Hero() {
  const navigate = useNavigate();
  return (
    <div className="hero">
      <video className="hero-video" autoPlay muted loop playsInline>
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      <div className="hero-overlay" />
      <div className="hero-content">
        <h1>CARE. CONNECT. COMMUNITY.</h1>
        <p>Join us in making a difference in the lives of Canadian seniors and communities.</p>
        <div>
          <button className="hero-primary" onClick={() => navigate('/volunteer')}>Volunteer Now</button>
          <button className="hero-secondary">Learn More</button>
        </div>
      </div>
    </div>
  );
}

export default Hero;