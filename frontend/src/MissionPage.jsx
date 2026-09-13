import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import missionContent from './missionContent';
import './MissionPage.css';

function MissionPage() {
  return (
    <div>
      <Navbar />

      <header className="page-header">
        <div className="page-header-text">
          <span className="eyebrow">About us</span>
          <h1>Mission and vision</h1>
        </div>
        <div className="page-header-media">
          <img src="/missionVision.png" alt="Mission and vision" />
        </div>
      </header>

      <section className="section mission-page">
        <div className="container">
          <div className="split">
            <div>
              <span className="eyebrow">Our mission</span>
              <h2>{missionContent.headline}</h2>
            </div>
            <div className="split-body">
              {missionContent.body.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          <div className="mission-figure">
            <img src="/care2.png" alt="A volunteer shovelling snow for a senior" loading="lazy" />
          </div>

          <div className="split">
            <div>
              <span className="eyebrow">Our vision</span>
              <h2>{missionContent.visionTagline}</h2>
            </div>
            <div className="split-body">
              {missionContent.visionBody.split('\n\n').map((para, i) => (
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
