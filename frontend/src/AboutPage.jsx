import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import Footer from './Footer';
import './AboutPage.css';

const SECTIONS = [
  {
    key: 'mission',
    link: '/about/mission',
    image: '/missionVision.png',
  },
  {
    key: 'history',
    link: '/about/history',
    image: '/saskatchewan.jpg',
  },
  {
    key: 'team',
    link: '/about/team',
    image: '/ourTeam.png',
  },
];

function AboutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div>
      <Navbar />

      <header className="page-header">
        <div className="page-header-text">
          <span className="eyebrow">{t('about.eyebrow')}</span>
          <h1>{t('about.heading')}</h1>
        </div>
        <div className="page-header-media">
          <img src="/care1.png" alt={t('about.heroAlt')} />
        </div>
      </header>

      <section className="about-list">
        {SECTIONS.map(s => (
          <div key={s.link} className="list-row">
            <div className="list-row-text">
              <span className="eyebrow">{t(`about.${s.key}.eyebrow`)}</span>
              <h3>{t(`about.${s.key}.title`)}</h3>
              <p>{t(`about.${s.key}.text`)}</p>
              <button className="btn btn-outline" onClick={() => navigate(s.link)}>{t(`about.${s.key}.cta`)}</button>
            </div>
            <div className="list-row-media">
              <img src={s.image} alt={t(`about.${s.key}.title`)} loading="lazy" />
            </div>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}

export default AboutPage;
