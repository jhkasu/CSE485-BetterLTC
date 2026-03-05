import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mockUsers from './mockUsers';
import './VolunteerList.css';

const VOLUNTEER_OPPORTUNITIES = [
  {
    id: 1,
    title: 'Senior Companionship Program',
    description: 'Provide friendship and support to isolated seniors in long-term care facilities.',
    location: 'Toronto',
    days: 'Flexible',
  },
  {
    id: 2,
    title: 'Community Food Drive Support',
    description: 'Help sort and pack food donations for local families in need.',
    location: 'Vancouver',
    days: 'Weekends',
  },
  {
    id: 3,
    title: 'Memory Care Activities Assistant',
    description: 'Lead engaging activities for seniors living with dementia in care homes.',
    location: 'Montreal',
    days: 'Weekdays',
  },
  {
    id: 4,
    title: 'Transportation Volunteer',
    description: 'Drive seniors to medical appointments and community events.',
    location: 'Calgary',
    days: 'Flexible',
  },
];

const CITIES = ['Toronto', 'Vancouver', 'Montreal', 'Calgary'];

function VolunteerList() {
  const navigate = useNavigate();
  const [selectedCities, setSelectedCities] = useState([]);

  const toggleCity = (city) => {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const filtered = selectedCities.length === 0
    ? VOLUNTEER_OPPORTUNITIES
    : VOLUNTEER_OPPORTUNITIES.filter(o => selectedCities.includes(o.location));

  const handleRegister = () => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) {
      navigate('/signin');
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
          <h3>Location</h3>
          {CITIES.map(city => (
            <label key={city}>
              <input
                type="checkbox"
                checked={selectedCities.includes(city)}
                onChange={() => toggleCity(city)}
              />
              {city}
            </label>
          ))}
        </div>
        <div className="volunteer-list">
          {filtered.length === 0 ? (
            <p className="no-results">No opportunities found for the selected location.</p>
          ) : (
            filtered.map(opportunity => (
              <div className="volunteer-card" key={opportunity.id}>
                <div className="card-info">
                  <h4>{opportunity.title}</h4>
                  <p>{opportunity.description}</p>
                </div>
                <div className="card-meta">
                  <span><strong>Locations</strong><br />{opportunity.location}</span>
                  <span><strong>Days & times</strong><br />{opportunity.days}</span>
                  <button onClick={handleRegister}>Register</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default VolunteerList;
