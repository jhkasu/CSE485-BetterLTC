import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './OurTeamPage.css';

const API_BASE = 'http://localhost:5184';

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

      <div className="ourteam-banner">
        <img src="/ourTeam.png" alt="Our Team" />
        <div className="ourteam-banner-overlay">
          <h1 className="ourteam-banner-title">Our Team</h1>
        </div>
      </div>

      <div className="ourteam-content">
        <div className="team-grid">
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
