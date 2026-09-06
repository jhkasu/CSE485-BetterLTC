import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VolunteerList.css';

const API_BASE = 'http://localhost:5184';
const CITIES = ['Toronto', 'Vancouver', 'Montreal', 'Calgary'];

function VolunteerList() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/listings`)
      .then(res => res.json())
      .then(data => setListings(data))
      .catch(() => setListings([]));
  }, []);

  const toggleCity = (city) => {
    setSelectedCities(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const filtered = selectedCities.length === 0
    ? listings
    : listings.filter(l => selectedCities.includes(l.location));

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
            <p className="no-results">No opportunities found.</p>
          ) : (
            filtered.map(listing => (
              <div
                className="volunteer-card"
                key={listing.id}
                onClick={() => navigate(`/volunteer/${listing.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-info">
                  <span className="card-status">{listing.status}</span>
                  <h4>{listing.listingTitle}</h4>
                  <p className="card-org">{listing.orgName}</p>
                </div>
                <div className="card-meta">
                  <span><strong>Location</strong><br />{listing.location}</span>
                  <span><strong>Days & times</strong><br />{listing.days}</span>
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
