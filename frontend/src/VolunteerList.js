import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VolunteerList.css';

const API_BASE = 'http://localhost:5184';
const CITIES = ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current', 'Yorkton', 'North Battleford', 'Estevan', 'Weyburn', 'Lloydminster', 'Humboldt', 'Melfort', 'Melville', 'Kindersley', 'Tisdale', 'Other'];

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
    <div>
      <header className="page-header page-header--plain">
        <div className="page-header-text">
          <span className="eyebrow">Volunteer</span>
          <h1>Find an opportunity near you</h1>
          <p>Every listing comes from a verified organization. Pick a city to narrow the list.</p>
        </div>
      </header>
      <div className="volunteer-content container">
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
              <div className="volunteer-card" key={listing.id}>
                <div className="card-info">
                  <span className="eyebrow">{listing.status}{listing.category ? ` · ${listing.category}` : ''}</span>
                  <h4>{listing.listingTitle}</h4>
                  <p className="card-org">{listing.orgName}</p>
                  <div className="card-meta">
                    <span><strong>Location</strong>{listing.location}</span>
                    <span><strong>Days</strong>{listing.days || 'Flexible'}</span>
                  </div>
                </div>
                <button className="btn btn-outline" onClick={() => navigate(`/volunteer/${listing.id}`)}>View details</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default VolunteerList;
