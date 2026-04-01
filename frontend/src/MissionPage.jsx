import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import missionContent from './missionContent';
import './MissionPage.css';

function MissionPage() {
  return (
    <div>
      <Navbar />

      <div className="mission-banner">
        <img src="/missionVision.png" alt="Mission & Vision" />
        <div className="mission-banner-overlay">
          <h1 className="mission-banner-title">Mission &amp; Vision</h1>
        </div>
      </div>

      <div className="mission-page">

        <div style={{ width: '100%', marginBottom: '30px' }}>
          <img src="/care1.png" alt="Care" style={{ width: '100%', height: 'auto', objectFit: 'cover', maxHeight: '500px' }} />
        </div>

        <section className="mission-section" style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto', paddingBottom: '50px' }}>
          <h2 className="mission-section-title">Our <span className="mission-script">Mission</span></h2>
          <p className="mission-tagline" style={{ marginBottom: '25px', fontWeight: 'bold' }}>{missionContent.headline}</p>
          {missionContent.body.split('\n\n').map((para, i) => (
            <p key={i} className="mission-body" style={{ marginBottom: '15px' }}>{para}</p>
          ))}
        </section>

        <div className="mission-color-rule">
          <span style={{ background: '#1a2f4e' }} />
          <span style={{ background: '#82a840' }} />
          <span style={{ background: '#E8A020' }} />
          <span style={{ background: '#1a2f4e' }} />
          <span style={{ background: '#82a840' }} />
        </div>

        <div style={{ width: '100%', marginTop: '50px', marginBottom: '30px' }}>
          <img src="/care2.png" alt="Community" style={{ width: '100%', height: 'auto', objectFit: 'cover', maxHeight: '500px' }} />
        </div>

        <section className="mission-section" style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto', paddingBottom: '50px' }}>
          <h2 className="mission-section-title">Our <span className="mission-script">Vision</span></h2>
          <p className="mission-tagline" style={{ marginBottom: '25px', fontWeight: 'bold' }}>{missionContent.visionTagline}</p>
          {missionContent.visionBody.split('\n\n').map((para, i) => (
            <p key={i} className="mission-body" style={{ marginBottom: '15px' }}>{para}</p>
          ))}
        </section>

        <div className="mission-color-rule">
          <span style={{ background: '#E8A020' }} />
          <span style={{ background: '#1a2f4e' }} />
          <span style={{ background: '#82a840' }} />
          <span style={{ background: '#E8A020' }} />
          <span style={{ background: '#1a2f4e' }} />
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default MissionPage;
