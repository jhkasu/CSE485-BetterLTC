import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdOpenInNew, MdLocationOn } from 'react-icons/md';
import Navbar from './Navbar';
import Footer from './Footer';
import apiFetch from './api';
import API_BASE from './config';
import { HELP_TYPE_KEYS } from './helpTypes';
import ListingCard from './ListingCard';
import { getSessionRole } from './auth/session';
import './OrganizationPage.css';

const AREA_PREVIEW = 3;

export function logoUrl(org) {
  return org?.logoVersion ? `${API_BASE}/api/organizations/${org.id}/logo?v=${org.logoVersion}` : null;
}

export function websiteHost(website) {
  try {
    return new URL(website).hostname.replace(/^www\./, '');
  } catch {
    return website;
  }
}

function initials(name) {
  return (name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function OrganizationPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [org, setOrg] = useState(undefined);
  const [listings, setListings] = useState([]);
  const [matches, setMatches] = useState({});
  const isVolunteer = getSessionRole() === 'volunteer';

  useEffect(() => {
    setOrg(undefined);
    apiFetch(`/api/organizations/${id}/public`)
      .then(res => (res.ok ? res.json() : null))
      .then(setOrg)
      .catch(() => setOrg(null));
    apiFetch('/api/listings')
      .then(res => (res.ok ? res.json() : []))
      .then(data => setListings((Array.isArray(data) ? data : [])
        .filter(l => String(l.organizationId) === String(id) && l.status !== 'Completed')))
      .catch(() => setListings([]));
  }, [id]);

  useEffect(() => {
    if (!isVolunteer) return;
    apiFetch('/api/listings/matches')
      .then(res => (res.ok ? res.json() : []))
      .then(data => setMatches(Object.fromEntries((Array.isArray(data) ? data : []).map(m => [m.listingId, m.match]))))
      .catch(() => setMatches({}));
  }, [isVolunteer]);

  const cityLabel = (city) => (city === 'Other' ? t('volunteer.otherCity') : city);
  const typeLabel = (type) => (HELP_TYPE_KEYS[type] ? t(HELP_TYPE_KEYS[type]) : type);

  if (org === undefined) {
    return (
      <div>
        <Navbar />
        <main className="orgp-page container"><p className="orgp-empty">{t('common.loading')}</p></main>
        <Footer />
      </div>
    );
  }

  if (org === null) {
    return (
      <div>
        <Navbar />
        <main className="orgp-page container">
          <h1 className="orgp-missing-title">{t('orgPage.notFound')}</h1>
          <p className="orgp-empty">{t('orgPage.notFoundText')}</p>
          <Link className="btn btn-primary" to="/volunteer">{t('orgPage.browse')}</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const logo = logoUrl(org);
  const areas = org.serviceAreas || [];
  const areaSummary = areas.length > AREA_PREVIEW
    ? t('orgPage.servesMore', { areas: areas.slice(0, AREA_PREVIEW).map(cityLabel).join(', '), count: areas.length - AREA_PREVIEW })
    : t('orgPage.serves', { areas: areas.map(cityLabel).join(', ') });

  return (
    <div>
      <Navbar />
      <main className="orgp-page container">
        <section className="orgp-banner" aria-labelledby="orgp-name">
          <div className="orgp-logo">
            {logo ? <img src={logo} alt={t('orgPage.logoAlt', { name: org.orgName })} /> : <span aria-hidden="true">{initials(org.orgName)}</span>}
          </div>
          <div className="orgp-identity">
            <h1 id="orgp-name">{org.orgName}</h1>
            {areas.length > 0 && <p className="orgp-areas"><MdLocationOn aria-hidden="true" /> {areaSummary}</p>}
          </div>
          {org.website && (
            <a className="btn btn-primary orgp-website" href={org.website} target="_blank" rel="noopener noreferrer">
              {t('orgPage.visitWebsite')} <MdOpenInNew aria-hidden="true" />
              <span className="visually-hidden"> ({t('orgPage.newTab')})</span>
            </a>
          )}
        </section>

        <div className="orgp-layout">
          <div className="orgp-main">
            {org.description && (
              <section className="orgp-card orgp-about" aria-labelledby="orgp-about">
                <h2 id="orgp-about">{t('orgPage.about')}</h2>
                <p className="orgp-description">{org.description}</p>
              </section>
            )}

            <section className="orgp-openings" aria-labelledby="orgp-openings">
              <h2 id="orgp-openings" className="orgp-section-title">{t('orgPage.openings', { count: listings.length })}</h2>
              {listings.length === 0 ? (
                <p className="orgp-empty">{t('orgPage.noOpenings')}</p>
              ) : (
                <ul className="vl-list">
                  {listings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} match={matches[listing.id] || null} showOrg={false} />
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="orgp-card orgp-side" aria-label={t('orgPage.details')}>
            <h2>{t('orgPage.details')}</h2>
            {areas.length > 0 && (
              <>
                <h3>{t('orgPage.serviceAreas')}</h3>
                <ul className="orgp-chips">{areas.map(a => <li key={a}>{cityLabel(a)}</li>)}</ul>
              </>
            )}
            {(org.helpTypes || []).length > 0 && (
              <>
                <h3>{t('orgPage.helpTypes')}</h3>
                <ul className="orgp-chips">{org.helpTypes.map(h => <li key={h}>{typeLabel(h)}</li>)}</ul>
              </>
            )}
            {org.website && (
              <>
                <h3>{t('orgPage.website')}</h3>
                <a className="orgp-link" href={org.website} target="_blank" rel="noopener noreferrer">
                  {websiteHost(org.website)} <MdOpenInNew aria-hidden="true" />
                  <span className="visually-hidden"> ({t('orgPage.newTab')})</span>
                </a>
              </>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default OrganizationPage;
