import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdSearch, MdLocationOn, MdCalendarToday, MdEvent } from 'react-icons/md';
import './VolunteerList.css';
import apiFetch from './api';
import CITIES from './saskatchewanCities';
import HELP_TYPES, { HELP_TYPE_KEYS } from './helpTypes';
import FilterChip from './FilterChip';
import MatchPanel from './MatchPanel';
import { getSessionRole } from './auth/session';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const LISTING_STATUS_KEYS = {
  'Is Ongoing': 'options.listingStatus.ongoing',
  'One-time': 'options.listingStatus.oneTime',
  Completed: 'options.listingStatus.completed',
};

function listingDays(listing) {
  return (listing.days || '').split(',').map(d => d.trim()).filter(Boolean);
}

function VolunteerList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [listings, setListings] = useState([]);
  const [areas, setAreas] = useState([]);
  const [types, setTypes] = useState([]);
  const [days, setDays] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [matches, setMatches] = useState(null);
  const [sort, setSort] = useState('match');
  const isVolunteer = getSessionRole() === 'volunteer';

  useEffect(() => {
    apiFetch(`/api/listings`)
      .then(res => res.json())
      .then(data => setListings(Array.isArray(data) ? data : []))
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
  const cityLabel = (city) => (city === 'Other' ? t('volunteer.otherCity') : city);
  const typeLabel = (type) => (HELP_TYPE_KEYS[type] ? t(HELP_TYPE_KEYS[type]) : type);
  const dayLabel = (day) => t(`options.days.${day.toLowerCase()}`, { defaultValue: day });

  const search = keyword.trim().toLowerCase();
  const filtered = listings.filter(l => {
    const areaOk = areas.length === 0 || areas.includes(l.location);
    const typeOk = types.length === 0 || types.includes(l.category);
    const dayOk = days.length === 0 || listingDays(l).some(d => days.includes(d));
    const textOk = search === ''
      || l.listingTitle.toLowerCase().includes(search)
      || (l.description || '').toLowerCase().includes(search)
      || (l.orgName || '').toLowerCase().includes(search);
    return areaOk && typeOk && dayOk && textOk;
  });
  if (hasMatches && sort === 'match') {
    filtered.sort((a, b) => (matches[b.id]?.score ?? 0) - (matches[a.id]?.score ?? 0));
  }

  const anyFilter = areas.length > 0 || types.length > 0 || days.length > 0 || search !== '';
  const clearAll = () => {
    setAreas([]);
    setTypes([]);
    setDays([]);
    setKeyword('');
  };

  return (
    <div>
      <header className="page-header page-header--plain">
        <div className="page-header-text">
          <span className="eyebrow">{t('volunteer.eyebrow')}</span>
          <h1>{t('volunteer.heading')}</h1>
          <p>{t('volunteer.lead')}</p>
        </div>
      </header>

      <div className="vl-page container">
        <div className="vl-toolbar">
          <label className="vl-search">
            <MdSearch aria-hidden="true" />
            <span className="visually-hidden">{t('common.search')}</span>
            <input
              type="search"
              placeholder={t('volunteer.searchPlaceholder')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </label>
          <div className="vl-chips">
            <FilterChip
              label={t('volunteer.filters.area')}
              options={CITIES.map(city => ({ value: city, label: cityLabel(city) }))}
              selected={areas}
              onChange={setAreas}
            />
            <FilterChip
              label={t('volunteer.filters.helpType')}
              options={HELP_TYPES.map(type => ({ value: type.value, label: t(type.labelKey) }))}
              selected={types}
              onChange={setTypes}
            />
            <FilterChip
              label={t('volunteer.filters.days')}
              options={DAYS.map(day => ({ value: day, label: dayLabel(day) }))}
              selected={days}
              onChange={setDays}
            />
            {anyFilter && (
              <button type="button" className="vl-clear" onClick={clearAll}>{t('volunteer.filters.clear')}</button>
            )}
          </div>
          {hasMatches && (
            <div className="vl-sort">
              <label htmlFor="match-sort">{t('matching.sortBy')}</label>
              <select id="match-sort" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="match">{t('matching.bestMatch')}</option>
                <option value="newest">{t('matching.newest')}</option>
              </select>
            </div>
          )}
        </div>

        {isVolunteer && matches && !hasMatches && (
          <div className="match-setup">
            <p>{t('matching.setupPrompt')}</p>
            <Link className="btn btn-primary" to="/dashboard">{t('dashboard.matching.reminderButton')}</Link>
          </div>
        )}

        <p className="vl-count">{t('volunteer.count', { count: filtered.length })}</p>

        {filtered.length === 0 ? (
          <p className="no-results">
            {search ? t('volunteer.emptyForKeyword', { keyword }) : t('volunteer.empty')}
          </p>
        ) : (
          <ul className="vl-list">
            {filtered.map(listing => {
              const match = hasMatches ? matches[listing.id] : null;
              const listingDayNames = listingDays(listing);
              const dates = [listing.startDate, listing.endDate].filter(Boolean).join(' – ');
              return (
                <li key={listing.id} className={`vl-card${match ? ' vl-card--matched' : ''}`}>
                  <div className="vl-main">
                    <div className="vl-tags">
                      {listing.category && <span className="vl-tag">{typeLabel(listing.category)}</span>}
                      {listing.status && <span className="vl-tag vl-tag--muted">{LISTING_STATUS_KEYS[listing.status] ? t(LISTING_STATUS_KEYS[listing.status]) : listing.status}</span>}
                    </div>
                    <h4 className="vl-title">{listing.listingTitle}</h4>
                    <p className="vl-org">{listing.orgName}</p>
                    <div className="vl-meta">
                      <span><MdLocationOn aria-hidden="true" /> {cityLabel(listing.location)}</span>
                      <span><MdCalendarToday aria-hidden="true" /> {listingDayNames.length ? listingDayNames.map(dayLabel).join(', ') : t('common.flexible')}</span>
                      {dates && <span><MdEvent aria-hidden="true" /> {dates}</span>}
                    </div>
                    <div className="vl-actions">
                      <button className="btn btn-primary" onClick={() => navigate(`/volunteer/${listing.id}`)}>{t('common.viewDetails')}</button>
                    </div>
                  </div>
                  {match && <MatchPanel match={match} />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default VolunteerList;
