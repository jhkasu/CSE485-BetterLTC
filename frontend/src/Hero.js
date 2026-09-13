import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

function Hero() {
  const navigate = useNavigate();
  return (
    <section className="hero">
      <div className="hero-text">
        <h1>Care. Connect.<br />Community.</h1>
        <p>Free help for seniors in Saskatchewan, from neighbours who care.</p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/get-help')}>I need help</button>
          <button className="btn btn-dark btn-lg" onClick={() => navigate('/volunteer')}>I want to volunteer</button>
        </div>
      </div>
      <div className="hero-media">
        <video autoPlay muted loop playsInline poster="/care1.png">
          <source src="/hero.mp4" type="video/mp4" />
        </video>
      </div>
    </section>
  );
}

export default Hero;
