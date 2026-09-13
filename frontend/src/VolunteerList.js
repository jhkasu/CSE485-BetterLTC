import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VolunteerList.css';
import API_BASE from './config';

const CITIES = ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current', 'Yorkton', 'North Battleford', 'Estevan', 'Weyburn', 'Lloydminster', 'Humboldt', 'Melfort', 'Melville', 'Kindersley', 'Tisdale', 'Other'];

function VolunteerList() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [keyword, setKeyword] = useState('');

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

  const search = keyword.trim().toLowerCase();
  const filtered = listings.filter(l => {
    const cityOk = selectedCities.length === 0 || selectedCities.includes(l.location);
    const textOk = search === '' ||
      l.listingTitle.toLowerCase().includes(search) ||
      (l.description || '').toLowerCase().includes(search);
    return cityOk && textOk;
  });

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
        <form className="search-box" onSubmit={e => e.preventDefault()}>
          <label htmlFor="keyword">Search</label>
          <div className="search-row">
            <input
              type="text"
              id="keyword"
              placeholder="Enter a keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className="btn btn-dark">Search</button>
          </div>
        </form>
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
            <p className="no-results">
              {search ? `No opportunities match "${keyword}".` : 'No opportunities found.'}
            </p>
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
