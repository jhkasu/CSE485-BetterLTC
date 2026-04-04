import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './OurTeamPage.css';

const mockData = [
  { id: 1, name: 'Firstname Lastname', photo: '/fig1.png' },
  { id: 2, name: 'Firstname Lastname', photo: '/fig2.png' },
  { id: 3, name: 'Firstname Lastname', photo: '/fig3.png' },
];

function OurTeamPage() {
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
          {mockData.map(member => (
            <div key={member.id} className="team-card">
              <img src={member.photo} alt={member.name} />
              <p>{member.name}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default OurTeamPage;
