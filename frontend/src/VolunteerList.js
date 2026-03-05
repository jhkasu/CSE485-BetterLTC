import React from 'react';
import mockUsers from './mockUsers';
import './VolunteerList.css';

function VolunteerList() {
  const handleRegister = () => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) {
      alert('Please sign in to register.');
      return;
    }
    const currentUser = JSON.parse(stored);
    const user = mockUsers.find(u => u.email === currentUser.email);

    if (user && user.backgroundCheckApproved) {
      alert('You have been registered successfully!');
    } else {
      alert('Your background check is currently in progress. You will be able to register once it is approved.');
    }
  };

  return (
    <div className="volunteer-section">
      <h2>Find a Volunteer Opportunity</h2>
      <div className="volunteer-content">
        <div className="filters">
          <h3>Filter</h3>
          <label><input type="checkbox" /> Good for groups</label>
          <label><input type="checkbox" /> Volunteer from home</label>
          <h3>Location</h3>
          <label><input type="checkbox" /> Toronto</label>
          <label><input type="checkbox" /> Vancouver</label>
          <label><input type="checkbox" /> Montreal</label>
          <label><input type="checkbox" /> Calgary</label>
        </div>
        <div className="volunteer-list">
          <div className="volunteer-card">
            <div className="card-info">
              <h4>Senior Companionship Program</h4>
              <p>Provide friendship and support to isolated seniors in long-term care facilities.</p>
            </div>
            <div className="card-meta">
              <span><strong>Locations</strong><br />Toronto</span>
              <span><strong>Days & times</strong><br />Flexible</span>
              <button onClick={handleRegister}>Register</button>
            </div>
          </div>
          <div className="volunteer-card">
            <div className="card-info">
              <h4>Community Food Drive Support</h4>
              <p>Help sort and pack food donations for local families in need.</p>
            </div>
            <div className="card-meta">
              <span><strong>Locations</strong><br />Vancouver</span>
              <span><strong>Days & times</strong><br />Weekends</span>
              <button onClick={handleRegister}>Register</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VolunteerList;
