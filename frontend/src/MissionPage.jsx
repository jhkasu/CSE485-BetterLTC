import React from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import Footer from './Footer';
import missionContent from './missionContent';
import './MissionPage.css';

function MissionPage() {
  const { t } = useTranslation();
  return (
    <div>
      <Navbar />

      <header className="page-header">
        <div className="page-header-text">
          <span className="eyebrow">{t('about.eyebrow')}</span>
          <h1>{t('mission.heading')}</h1>
        </div>
        <div className="page-header-media">
          <img src="/missionVision.png" alt={t('mission.heading')} />
        </div>
      </header>

      <section className="section mission-page">
        <div className="container">
          <div className="split">
            <div>
              <span className="eyebrow">{t('mission.missionEyebrow')}</span>
              <h2>{t(missionContent.headline)}</h2>
            </div>
            <div className="split-body">
              {t(missionContent.body).split(/\n\n/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          <div className="mission-figure">
            <img src="/care2.png" alt={t('mission.figureAlt')} loading="lazy" />
          </div>

          <div className="split">
            <div>
              <span className="eyebrow">{t('mission.visionEyebrow')}</span>
              <h2>{t(missionContent.visionTagline)}</h2>
            </div>
            <div className="split-body">
              {t(missionContent.visionBody).split(/\n\n/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default MissionPage;
