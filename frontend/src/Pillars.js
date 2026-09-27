import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Pillars.css';

const PILLARS = [
  {
    key: 'volunteer',
    image: '/care2.png',
    link: '/volunteer',
  },
  {
    key: 'organizations',
    image: '/care1.png',
    link: '/signup',
  },
  {
    key: 'community',
    image: '/saskatchewan.jpg',
    link: '/our-work',
  },
];

function Pillars() {
  const { t } = useTranslation();
  return (
    <section className="section pillars">
      <div className="container">
        <span className="eyebrow">{t('home.pillars.eyebrow')}</span>
        <h2 className="section-title">{t('home.pillars.heading')}</h2>
        <div className="pillars-grid">
          {PILLARS.map(p => (
            <article key={p.key} className="pillar">
              <div className="pillar-image">
                <img src={p.image} alt="" loading="lazy" />
              </div>
              <h3>{t(`home.pillars.${p.key}.title`)}</h3>
              <p>{t(`home.pillars.${p.key}.text`)}</p>
              <Link className="arrow-link pillar-link" to={p.link}>{t(`home.pillars.${p.key}.cta`)} <span aria-hidden="true">&rarr;</span></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pillars;
