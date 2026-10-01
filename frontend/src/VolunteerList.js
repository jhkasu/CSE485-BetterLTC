import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './VolunteerList.css';
import apiFetch from './api';
import CITIES from './saskatchewanCities';
import { getSessionRole } from './auth/session';
import { matchReasons } from './matchReasons';

function VolunteerList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [listings, setListings] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [matches, setMatches] = useState(null);
  const [sort, setSort] = useState('match');
  const isVolunteer = getSessionRole() === 'volunteer';

  useEffect(() => {
    apiFetch(`/api/listings`)
      .then(res => res.json())
      .then(data => setListings(data))
      .catch(() => setListings([]));
  }, []);

  useEffect(() => {
    if (!isVolunteer) return;
    apiFetch(`/api/listings/matches`)
      .then(res => (res.ok ? res.json() : []))
      .then(data => setMatches(Object.fromEntries((Array.isArray(data) ? data : []).map(m => [m.listingId, m.match]))))
      .catch(() => setMatches({}));
  }, [isVolunteer]);

  const hasMatches = !!matches && Object.keys(matches).length > 0;

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
  if (hasMatches && sort === 'match') {
    filtered.sort((a, b) => (matches[b.id]?.score ?? 0) - (matches[a.id]?.score ?? 0));
  }

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
          {isVolunteer && matches && !hasMatches && (
            <div className="match-setup">
              <p>{t('matching.setupPrompt')}</p>
              <Link className="btn btn-primary" to="/dashboard">{t('dashboard.matching.reminderButton')}</Link>
            </div>
          )}
          {hasMatches && (
            <div className="match-sort">
              <label htmlFor="match-sort">{t('matching.sortBy')}</label>
              <select id="match-sort" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="match">{t('matching.bestMatch')}</option>
                <option value="newest">{t('matching.newest')}</option>
              </select>
            </div>
          )}
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
                  {hasMatches && matches[listing.id] && (
                    <p className="card-match">
                      <span className="card-match-score">{t('matching.percent', { score: matches[listing.id].score })}</span>
                      {matchReasons(t, matches[listing.id]).join(' · ')}
                    </p>
                  )}
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
