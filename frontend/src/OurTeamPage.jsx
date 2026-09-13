import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './OurTeamPage.css';
import API_BASE from './config';

function OurTeamPage() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/team-members`)
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(() => setMembers([]));
  }, []);

  return (
    <div>
      <Navbar />

      <header className="page-header">
        <div className="page-header-text">
          <span className="eyebrow">About us</span>
          <h1>Our team</h1>
        </div>
        <div className="page-header-media">
          <img src="/ourTeam.png" alt="Our team" />
        </div>
      </header>

      <div className="section ourteam-content">
        <div className="container team-grid">
          {members.map(member => (
            <div key={member.id} className="team-card">
              {member.imagePath
                ? <img src={`${API_BASE}${member.imagePath}`} alt={member.name} />
                : <div className="team-card-placeholder">{member.name.charAt(0)}</div>}
              <p className="team-card-name">{member.name}</p>
              <p className="team-card-position">{member.position}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default OurTeamPage;
