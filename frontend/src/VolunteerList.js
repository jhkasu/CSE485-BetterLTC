import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './VolunteerList.css';
import apiFetch from './api';
import CITIES from './saskatchewanCities';

function VolunteerList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [listings, setListings] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    apiFetch(`/api/listings`)
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
          <span className="eyebrow">{t('volunteer.eyebrow')}</span>
          <h1>{t('volunteer.heading')}</h1>
          <p>{t('volunteer.lead')}</p>
        </div>
      </header>
      <div className="volunteer-content container">
        <form className="search-box" onSubmit={e => e.preventDefault()}>
          <label htmlFor="keyword">{t('common.search')}</label>
          <div className="search-row">
            <input
              type="text"
              id="keyword"
              placeholder={t('volunteer.searchPlaceholder')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className="btn btn-dark">{t('common.search')}</button>
          </div>
        </form>
        <div className="filters">
          <h3>{t('common.location')}</h3>
          {CITIES.map(city => (
            <label key={city}>
              <input
                type="checkbox"
                checked={selectedCities.includes(city)}
                onChange={() => toggleCity(city)}
              />
              {city === 'Other' ? t('volunteer.otherCity') : city}
            </label>
          ))}
        </div>
        <div className="volunteer-list">
          {filtered.length === 0 ? (
            <p className="no-results">
              {search ? t('volunteer.emptyForKeyword', { keyword }) : t('volunteer.empty')}
            </p>
          ) : (
            filtered.map(listing => (
              <div className="volunteer-card" key={listing.id}>
                <div className="card-info">
                  <span className="eyebrow">{listing.status}{listing.category ? ` · ${listing.category}` : ''}</span>
                  <h4>{listing.listingTitle}</h4>
                  <p className="card-org">{listing.orgName}</p>
                  <div className="card-meta">
                    <span><strong>{t('common.location')}</strong>{listing.location}</span>
                    <span><strong>{t('common.days')}</strong>{listing.days || t('common.flexible')}</span>
                  </div>
                </div>
                <button className="btn btn-outline" onClick={() => navigate(`/volunteer/${listing.id}`)}>{t('common.viewDetails')}</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default VolunteerList;
