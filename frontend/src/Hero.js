import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Hero.css';

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
          <Link className="btn btn-dark btn-lg" to="/organizations">{t('home.hero.wantToVolunteer')}</Link>
        </div>
      </div>
      <div className="hero-media" aria-hidden="true">
        <img src="/care1.png" alt="" />
      </div>
    </section>
  );
}

export default Hero;
