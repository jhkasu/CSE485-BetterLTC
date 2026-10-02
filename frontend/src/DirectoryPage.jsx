import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdLocationOn, MdArrowForward, MdDiversity3 } from 'react-icons/md';
import Navbar from './Navbar';
import Footer from './Footer';
import apiFetch from './api';
import CITIES from './saskatchewanCities';
import ORG_CATEGORIES, { ORG_CATEGORY_KEYS } from './orgCategories';
import FilterChip from './FilterChip';
import { initials, logoUrl } from './OrganizationPage';
import './DirectoryPage.css';

export function directoryQuery(categories, areas, intergenerational = false) {
  const params = new URLSearchParams();
  categories.forEach(c => params.append('category', c));
  areas.forEach(a => params.append('area', a));
  if (intergenerational) params.append('intergenerational', 'true');
  const query = params.toString();
  return `/api/organizations/directory${query ? `?${query}` : ''}`;
}

function DirectoryPage() {
  const { t } = useTranslation();
  const [orgs, setOrgs] = useState(null);
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [intergenerational, setIntergenerational] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch(directoryQuery(categories, areas, intergenerational))
      .then(res => (res.ok ? res.json() : []))
      .then(data => { if (!cancelled) setOrgs(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setOrgs([]); });
    return () => { cancelled = true; };
  }, [categories, areas, intergenerational]);

  const cityLabel = (city) => (city === 'Other' ? t('volunteer.otherCity') : city);
  const categoryLabel = (c) => (ORG_CATEGORY_KEYS[c] ? t(ORG_CATEGORY_KEYS[c]) : c);
  const anyFilter = categories.length > 0 || areas.length > 0 || intergenerational;

  return (
    <div>
      <Navbar />
      <header className="band-header">
        <div className="band-header-inner container">
          <span className="eyebrow">{t('directory.eyebrow')}</span>
          <h1>{t('directory.heading')}</h1>
          <p>{t('directory.lead')}</p>
          <div className="dir-toolbar">
            <div className="dir-chips">
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
              <button
              type="button"
              className={`filter-chip-btn${intergenerational ? ' filter-chip-btn--active' : ''}`}
              aria-pressed={intergenerational}
              onClick={() => setIntergenerational(v => !v)}
            >
              <MdDiversity3 aria-hidden="true" /> {t('directory.filters.intergenerational')}
            </button>
            {anyFilter && (
                <button type="button" className="dir-clear" onClick={() => { setCategories([]); setAreas([]); setIntergenerational(false); }}>{t('volunteer.filters.clear')}</button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="dir-page container">
        {orgs === null ? (
          <p className="dir-count">{t('common.loading')}</p>
        ) : (
          <>
            <p className="dir-count" role="status">{t('directory.count', { count: orgs.length })}</p>
            {orgs.length === 0 ? (
              <p className="dir-empty">{t(anyFilter ? 'directory.emptyFiltered' : 'directory.empty')}</p>
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
                      {org.offersIntergenerational && (
                        <p className="dir-badge"><MdDiversity3 aria-hidden="true" /> {t('directory.intergenerationalBadge')}</p>
                      )}
                      {(org.categories || []).length > 0 && (
                        <ul className="dir-tags" aria-label={t('orgPage.categories')}>
                          {org.categories.map(c => <li key={c} className="dir-tag">{categoryLabel(c)}</li>)}
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
