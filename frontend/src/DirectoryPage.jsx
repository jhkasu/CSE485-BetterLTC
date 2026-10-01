import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdLocationOn, MdArrowForward } from 'react-icons/md';
import Navbar from './Navbar';
import Footer from './Footer';
import apiFetch from './api';
import CITIES from './saskatchewanCities';
import ORG_CATEGORIES, { ORG_CATEGORY_KEYS } from './orgCategories';
import FilterChip from './FilterChip';
import { initials, logoUrl } from './OrganizationPage';
import './VolunteerList.css';
import './DirectoryPage.css';

export function directoryQuery(categories, areas) {
  const params = new URLSearchParams();
  categories.forEach(c => params.append('category', c));
  areas.forEach(a => params.append('area', a));
  const query = params.toString();
  return `/api/organizations/directory${query ? `?${query}` : ''}`;
}

function DirectoryPage() {
  const { t } = useTranslation();
  const [orgs, setOrgs] = useState(null);
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    let cancelled = false;
    apiFetch(directoryQuery(categories, areas))
      .then(res => (res.ok ? res.json() : []))
      .then(data => { if (!cancelled) setOrgs(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setOrgs([]); });
    return () => { cancelled = true; };
  }, [categories, areas]);

  const cityLabel = (city) => (city === 'Other' ? t('volunteer.otherCity') : city);
  const categoryLabel = (c) => (ORG_CATEGORY_KEYS[c] ? t(ORG_CATEGORY_KEYS[c]) : c);
  const anyFilter = categories.length > 0 || areas.length > 0;

  return (
    <div>
      <Navbar />
      <header className="page-header page-header--plain">
        <div className="page-header-text">
          <span className="eyebrow">{t('directory.eyebrow')}</span>
          <h1>{t('directory.heading')}</h1>
          <p>{t('directory.lead')}</p>
        </div>
      </header>

      <main className="dir-page container">
        <div className="vl-toolbar">
          <div className="vl-chips">
            <FilterChip
              label={t('directory.filters.category')}
              options={ORG_CATEGORIES.map(c => ({ value: c.value, label: t(c.labelKey) }))}
              selected={categories}
              onChange={setCategories}
            />
            <FilterChip
              label={t('volunteer.filters.area')}
              options={CITIES.map(city => ({ value: city, label: cityLabel(city) }))}
              selected={areas}
              onChange={setAreas}
            />
            {anyFilter && (
              <button type="button" className="vl-clear" onClick={() => { setCategories([]); setAreas([]); }}>{t('volunteer.filters.clear')}</button>
            )}
          </div>
        </div>

        {orgs === null ? (
          <p className="vl-count">{t('common.loading')}</p>
        ) : (
          <>
            <p className="vl-count" role="status">{t('directory.count', { count: orgs.length })}</p>
            {orgs.length === 0 ? (
              <p className="no-results">{t(anyFilter ? 'directory.emptyFiltered' : 'directory.empty')}</p>
            ) : (
              <ul className="dir-grid">
                {orgs.map(org => {
                  const logo = logoUrl(org);
                  return (
                    <li key={org.id} className="dir-card">
                      <div className="dir-card-head">
                        <div className="dir-logo">
                          {logo ? <img src={logo} alt="" /> : <span aria-hidden="true">{initials(org.orgName)}</span>}
                        </div>
                        <h2 className="dir-name">
                          <Link to={`/organizations/${org.id}`}>{org.orgName}</Link>
                        </h2>
                      </div>
                      {(org.categories || []).length > 0 && (
                        <ul className="dir-tags" aria-label={t('orgPage.categories')}>
                          {org.categories.map(c => <li key={c} className="vl-tag">{categoryLabel(c)}</li>)}
                        </ul>
                      )}
                      {org.description && <p className="dir-description">{org.description}</p>}
                      {(org.serviceAreas || []).length > 0 && (
                        <p className="dir-areas"><MdLocationOn aria-hidden="true" /> {org.serviceAreas.map(cityLabel).join(', ')}</p>
                      )}
                      <Link className="dir-more" to={`/organizations/${org.id}`} aria-label={t('directory.viewProfileOf', { name: org.orgName })}>
                        {t('directory.viewProfile')} <MdArrowForward aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default DirectoryPage;
