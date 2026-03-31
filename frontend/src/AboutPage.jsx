import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './AboutPage.css';

function AboutPage() {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />
      <div className="about-page">

        <div className="about-hero">
          <h1 className="about-title">
            Get to <span className="about-script">Know Us</span>
          </h1>
        </div>

        <div className="about-cards">
          <div className="about-card">
            <h2 className="about-card-title">Mission &amp; Vision</h2>
            <p className="about-card-desc">Learn about our commitment to transforming the health and well-being of older adults.</p>
            <button className="about-card-btn" onClick={() => navigate('/about/mission')}>Mission &amp; Vision</button>
          </div>

          <div className="about-card">
            <h2 className="about-card-title">Our History</h2>
            <p className="about-card-desc">Discover how BetterLTC started and where we are today.</p>
            <button className="about-card-btn" onClick={() => navigate('/about/history')}>Our History</button>
          </div>

          <div className="about-card">
            <h2 className="about-card-title">Our Team</h2>
            <p className="about-card-desc">Meet the people dedicated to making a difference in long-term care.</p>
            <button className="about-card-btn" onClick={() => navigate('/about/team')}>Our Team</button>
          </div>
        </div>

        <div className="about-color-rule">
          <span style={{ background: '#1a2f4e' }} />
          <span style={{ background: '#82a840' }} />
          <span style={{ background: '#E8A020' }} />
          <span style={{ background: '#1a2f4e' }} />
          <span style={{ background: '#82a840' }} />
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default AboutPage;
