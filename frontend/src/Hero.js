import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Hero.css';

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Hero() {
  const { t } = useTranslation();
  const heading = t('home.hero.heading');
  const splitAt = heading.lastIndexOf('. ') + 1;
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-text">
        <h1 id="hero-heading">{splitAt > 0 ? <>{heading.slice(0, splitAt)}<br />{heading.slice(splitAt + 1)}</> : heading}</h1>
        <p>{t('home.hero.lead')}</p>
        <div className="hero-actions">
          <Link className="btn btn-primary btn-lg" to="/get-help">{t('home.hero.needHelp')}</Link>
          <Link className="btn btn-dark btn-lg" to="/volunteer">{t('home.hero.wantToVolunteer')}</Link>
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
