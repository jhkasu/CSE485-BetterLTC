import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdOpenInNew, MdLocationOn, MdSchedule } from 'react-icons/md';
import Navbar from './Navbar';
import Footer from './Footer';
import apiFetch from './api';
import API_BASE from './config';
import { ORG_CATEGORY_KEYS } from './orgCategories';
import { GEOGRAPHIC_SCOPES, ORG_TYPES, POPULATIONS, SERVICE_LANGUAGES, labelFor } from './orgProfileOptions';
import ExpressInterestForm from './ExpressInterestForm';
import usePageTitle from './usePageTitle';
import './OrganizationPage.css';

const AREA_PREVIEW = 3;
const ABOUT_SECTIONS = [
  ['mission', 'orgPage.mission'],
  ['vision', 'orgPage.vision'],
  ['coreValues', 'orgPage.values'],
  ['story', 'orgPage.story'],
  ['uniqueness', 'orgPage.unique'],
  ['goals', 'orgPage.goals'],
];
const SOCIAL_LINKS = [
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
  ['linkedIn', 'LinkedIn'],
  ['youTube', 'YouTube'],
  ['tikTok', 'TikTok'],
];

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

export function initials(name) {
  return (name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function OrganizationPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [org, setOrg] = useState(undefined);
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState('');
  usePageTitle(org ? org.orgName : t(org === null ? 'orgPage.notFound' : 'directory.heading'));

  useEffect(() => {
    setOrg(undefined);
    setRoles([]);
    setRoleId('');
    apiFetch(`/api/organizations/${id}/public`)
      .then(res => (res.ok ? res.json() : null))
      .then(setOrg)
      .catch(() => setOrg(null));
    apiFetch(`/api/organizations/${id}/roles`)
      .then(res => (res.ok ? res.json() : []))
      .then(setRoles)
      .catch(() => {});
  }, [id]);

  const chooseRole = (role) => {
    setRoleId(String(role.id));
    const section = document.getElementById('orgp-interest');
    if (section?.scrollIntoView) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('interest-name')?.focus({ preventScroll: true });
  };

  const cityLabel = (city) => (city === 'Other' ? t('volunteer.otherCity') : city);

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
          <Link className="btn btn-primary" to="/organizations">{t('orgPage.browse')}</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const logo = logoUrl(org);
  const areas = org.serviceAreas || [];
  const about = org.description || org.shortDescription;
  const aboutSections = ABOUT_SECTIONS.filter(([field]) => org[field]);
  const withOther = (values, other, list) => (values || []).map(v => (v === 'Other' && other ? other : labelFor(list, v, t)));
  const focusAreas = (org.categories || []).map(c => (c === 'Other' && org.categoryOther ? org.categoryOther : (ORG_CATEGORY_KEYS[c] ? t(ORG_CATEGORY_KEYS[c]) : c)));
  const populations = withOther(org.populationsServed, org.populationOther, POPULATIONS);
  const languages = withOther(org.serviceLanguages, org.serviceLanguageOther, SERVICE_LANGUAGES);
  const scopes = withOther(org.geographicScope, '', GEOGRAPHIC_SCOPES);
  const orgType = org.orgType === 'Other' && org.orgTypeOther ? org.orgTypeOther : (org.orgType ? labelFor(ORG_TYPES, org.orgType, t) : '');
  const location = [org.city, org.province].filter(Boolean).join(', ');
  const socials = SOCIAL_LINKS.filter(([field]) => org[field]).concat(org.otherSocial ? [['otherSocial', websiteHost(org.otherSocial)]] : []);
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
            {org.tagline && <p className="orgp-tagline">{org.tagline}</p>}
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
            {(about || aboutSections.length > 0) && (
              <section className="orgp-card orgp-about" aria-labelledby="orgp-about">
                <h2 id="orgp-about">{t('orgPage.about')}</h2>
                {about && <p className="orgp-description">{about}</p>}
                {aboutSections.map(([field, key]) => (
                  <div key={field} className="orgp-about-part">
                    <h3>{t(key)}</h3>
                    <p className="orgp-description">{org[field]}</p>
                  </div>
                ))}
              </section>
            )}

            {roles.length > 0 && (
              <section className="orgp-card orgp-roles" aria-labelledby="orgp-roles">
                <h2 id="orgp-roles">{t('orgPage.roles.heading')}</h2>
                <ul className="orgp-role-list">
                  {roles.map(role => (
                    <li key={role.id} className="orgp-role">
                      <div className="orgp-role-text">
                        <h3>{role.title}</h3>
                        {role.timeCommitment && <p className="orgp-role-time"><MdSchedule aria-hidden="true" /> {role.timeCommitment}</p>}
                        {role.description && <p className="orgp-role-description">{role.description}</p>}
                      </div>
                      <button
                        type="button"
                        className="orgp-role-btn"
                        onClick={() => chooseRole(role)}
                        aria-label={t('orgPage.roles.interestedIn', { title: role.title })}
                      >
                        {t('orgPage.roles.interested')}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="orgp-card orgp-interest" id="orgp-interest" aria-labelledby="orgp-interest-title">
              <h2 id="orgp-interest-title">{t('orgPage.interest.heading')}</h2>
              <p className="orgp-interest-lead">{t('orgPage.interest.lead', { name: org.orgName })}</p>
              <ExpressInterestForm org={org} roles={roles} roleId={roleId} onRoleChange={setRoleId} />
            </section>
          </div>

          <aside className="orgp-card orgp-side" aria-label={t('orgPage.details')}>
            <h2>{t('orgPage.details')}</h2>
            {orgType && (
              <>
                <h3>{t('orgPage.orgType')}</h3>
                <p className="orgp-fact">{orgType}</p>
              </>
            )}
            {org.yearEstablished && (
              <>
                <h3>{t('orgPage.established')}</h3>
                <p className="orgp-fact">{org.yearEstablished}</p>
              </>
            )}
            {location && (
              <>
                <h3>{t('orgPage.location')}</h3>
                <p className="orgp-fact">{location}</p>
              </>
            )}
            {focusAreas.length > 0 && (
              <>
                <h3>{t('orgPage.categories')}</h3>
                <ul className="orgp-chips">{focusAreas.map(c => <li key={c}>{c}</li>)}</ul>
              </>
            )}
            {populations.length > 0 && (
              <>
                <h3>{t('orgPage.populations')}</h3>
                <ul className="orgp-chips">{populations.map(p => <li key={p}>{p}</li>)}</ul>
              </>
            )}
            {scopes.length > 0 && (
              <>
                <h3>{t('orgPage.geoScope')}</h3>
                <ul className="orgp-chips">{scopes.map(s => <li key={s}>{s}</li>)}</ul>
              </>
            )}
            {org.communitiesServed && (
              <>
                <h3>{t('orgPage.communities')}</h3>
                <p className="orgp-fact">{org.communitiesServed}</p>
              </>
            )}
            {org.additionalLocations && (
              <>
                <h3>{t('orgPage.additionalLocations')}</h3>
                <p className="orgp-fact">{org.additionalLocations}</p>
              </>
            )}
            {languages.length > 0 && (
              <>
                <h3>{t('orgPage.languages')}</h3>
                <ul className="orgp-chips">{languages.map(l => <li key={l}>{l}</li>)}</ul>
                {org.languageServices && <p className="orgp-fact">{org.languageServices}</p>}
              </>
            )}
            {areas.length > 0 && (
              <>
                <h3>{t('orgPage.serviceAreas')}</h3>
                <ul className="orgp-chips">{areas.map(a => <li key={a}>{cityLabel(a)}</li>)}</ul>
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
            {socials.length > 0 && (
              <>
                <h3>{t('orgPage.social')}</h3>
                <ul className="orgp-links">
                  {socials.map(([field, name]) => (
                    <li key={field}>
                      <a className="orgp-link" href={org[field]} target="_blank" rel="noopener noreferrer">
                        {name} <MdOpenInNew aria-hidden="true" />
                        <span className="visually-hidden"> ({t('orgPage.newTab')})</span>
                      </a>
                    </li>
                  ))}
                </ul>
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
