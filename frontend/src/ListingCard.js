import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdLocationOn, MdCalendarToday, MdEvent } from 'react-icons/md';
import { HELP_TYPE_KEYS } from './helpTypes';
import MatchPanel from './MatchPanel';
import './VolunteerList.css';

const LISTING_STATUS_KEYS = {
  'Is Ongoing': 'options.listingStatus.ongoing',
  'One-time': 'options.listingStatus.oneTime',
  Completed: 'options.listingStatus.completed',
};

export function listingDays(listing) {
  return (listing.days || '').split(',').map(d => d.trim()).filter(Boolean);
}

export function OrgNameLink({ listing, className }) {
  if (!listing.orgName) return null;
  if (!listing.organizationId) return <p className={className}>{listing.orgName}</p>;
  return (
    <p className={className}>
      <Link className="org-name-link" to={`/organizations/${listing.organizationId}`}>{listing.orgName}</Link>
    </p>
  );
}

function ListingCard({ listing, match, showOrg = true }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const cityLabel = (city) => (city === 'Other' ? t('volunteer.otherCity') : city);
  const typeLabel = (type) => (HELP_TYPE_KEYS[type] ? t(HELP_TYPE_KEYS[type]) : type);
  const dayLabel = (day) => t(`options.days.${day.toLowerCase()}`, { defaultValue: day });
  const dayNames = listingDays(listing);
  const dates = [listing.startDate, listing.endDate].filter(Boolean).join(' – ');

  return (
    <li className={`vl-card${match ? ' vl-card--matched' : ''}`}>
      <div className="vl-main">
        <div className="vl-tags">
          {listing.category && <span className="vl-tag">{typeLabel(listing.category)}</span>}
          {listing.status && <span className="vl-tag vl-tag--muted">{LISTING_STATUS_KEYS[listing.status] ? t(LISTING_STATUS_KEYS[listing.status]) : listing.status}</span>}
        </div>
        <h4 className="vl-title">{listing.listingTitle}</h4>
        {showOrg && <OrgNameLink listing={listing} className="vl-org" />}
        <div className="vl-meta">
          <span><MdLocationOn aria-hidden="true" /> {cityLabel(listing.location)}</span>
          <span><MdCalendarToday aria-hidden="true" /> {dayNames.length ? dayNames.map(dayLabel).join(', ') : t('common.flexible')}</span>
          {dates && <span><MdEvent aria-hidden="true" /> {dates}</span>}
        </div>
        <div className="vl-actions">
          <button className="btn btn-primary" onClick={() => navigate(`/volunteer/${listing.id}`)}>{t('common.viewDetails')}</button>
        </div>
      </div>
      {match && <MatchPanel match={match} />}
    </li>
  );
}

export default ListingCard;
