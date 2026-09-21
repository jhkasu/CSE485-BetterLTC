import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-text">
        <h1 id="hero-heading">Care. Connect.<br />Community.</h1>
        <p>Free help for seniors in Saskatchewan, from neighbours who care.</p>
        <div className="hero-actions">
          <Link className="btn btn-primary btn-lg" to="/get-help">I need help</Link>
          <Link className="btn btn-dark btn-lg" to="/volunteer">I want to volunteer</Link>
        </div>
      </div>
      <div className="hero-media" aria-hidden="true">
        {prefersReducedMotion ? (
          <img src="/care1.png" alt="" />
        ) : (
          <video autoPlay muted loop playsInline poster="/care1.png" tabIndex={-1}>
            <source src="/hero.mp4" type="video/mp4" />
          </video>
        )}
      </div>
    </section>
  );
}

export default Hero;
