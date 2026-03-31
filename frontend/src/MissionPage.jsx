import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './MissionPage.css';

function MissionPage() {
  return (
    <div>
      <Navbar />
      <div className="mission-page">

        {/* Hero headline */}
        <section className="mission-hero">
          <p className="mission-label">Our Mission</p>
          <h1 className="mission-headline">
            Dedicated to transforming the health<br />
            and well-being of older adults.
          </h1>
        </section>

        <div className="mission-divider-bar" />

        {/* Mission body */}
        <section className="mission-section">
          <p className="mission-body">
            BetterLTC – a non-profit charitable organization – is dedicated to transforming the health and well-being with older adults. By fostering innovation and collaboration, and using an asset-based approach the platform connects people with essential resources, cutting-edge research, and strategic insights to address the evolving needs of an aging population.
          </p>
          <p className="mission-body">
            This commitment ensures collaborative, high-quality care, and resources that support dignity and interdependence. The website serves as a vital hub for sharing knowledge, promoting best practices, and driving meaningful change.
          </p>
          <p className="mission-body">
            BetterLTC enhances the capacity to deliver compassionate and effective care. The platform prioritizes well-being by equipping users with the tools, training, and knowledge necessary to navigate the complexities of growing older. By addressing challenges such as resource accessibility and availability, workforce development, and evolving care standards — BetterLTC contributes to a resilient and adaptive system.
          </p>
        </section>

        <div className="mission-color-rule">
          <span style={{ background: '#1a2f4e' }} />
          <span style={{ background: '#82a840' }} />
          <span style={{ background: '#E8A020' }} />
          <span style={{ background: '#1a2f4e' }} />
          <span style={{ background: '#82a840' }} />
        </div>

        {/* Vision section */}
        <section className="mission-section">
          <h2 className="mission-section-title">
            Our <span className="mission-script">Vision</span>
          </h2>
          <p className="mission-body">
            At BetterLTC, we envision a transformative future for caring with older adults and their close ones that goes beyond traditional models to embrace a comprehensive, relational approach. Our aspiration is to create a world where care is not confined to facilities but extends to fostering environments that genuinely enhance the well-being, dignity, and autonomy of every older adult.
          </p>
          <p className="mission-body">
            We believe growing older should be celebrated. This includes creating spaces that respect individuality, promote community, and honor the unique preferences and needs of each person. Our vision includes fostering meaningful connections, encouraging active participation, and ensuring that every older adult feels valued and supported.
          </p>
          <p className="mission-body">
            By prioritizing innovation and collaboration, we aim to empower older adults, their close ones, care partners and communities with the tools and resources to thrive. Founded by Dr. Roslyn M. Compton, BetterLTC is committed to transforming older adult care through innovative initiatives and collaborative partnerships.
          </p>
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
