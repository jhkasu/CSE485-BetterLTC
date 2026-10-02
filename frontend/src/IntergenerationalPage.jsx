import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdHandshake, MdGroups, MdSchedule, MdElderly, MdBusiness, MdArrowForward } from 'react-icons/md';
import Navbar from './Navbar';
import Footer from './Footer';
import apiFetch from './api';
import { directoryQuery } from './DirectoryPage';
import { initials, logoUrl } from './OrganizationPage';
import './IntergenerationalPage.css';

const WAYS = [
  { key: 'mentorship', icon: <MdHandshake /> },
  { key: 'teams', icon: <MdGroups /> },
  { key: 'suited', icon: <MdSchedule /> },
];

function IntergenerationalPage() {
  const { t } = useTranslation();
  const [orgs, setOrgs] = useState(null);

  useEffect(() => {
    apiFetch(directoryQuery([], [], true))
      .then(res => (res.ok ? res.json() : []))
      .then(data => setOrgs(Array.isArray(data) ? data : []))
      .catch(() => setOrgs([]));
  }, []);

  const cityLabel = (city) => (city === 'Other' ? t('volunteer.otherCity') : city);

  return (
    <div>
      <Navbar />
      <header className="band-header">
        <div className="band-header-inner container">
          <span className="eyebrow">{t('intergen.eyebrow')}</span>
          <h1>{t('intergen.heading')}</h1>
          <p>{t('intergen.lead')}</p>
        </div>
      </header>

      <main className="ig-page container">
        <section aria-labelledby="ig-ways">
          <h2 id="ig-ways" className="ig-title">{t('intergen.waysTitle')}</h2>
          <ul className="ig-ways">
            {WAYS.map(way => (
              <li key={way.key} className="ig-way">
                <span className="ig-way-icon" aria-hidden="true">{way.icon}</span>
                <h3>{t(`intergen.ways.${way.key}.title`)}</h3>
                <p>{t(`intergen.ways.${way.key}.text`)}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="ig-audiences">
          <section className="ig-audience" aria-labelledby="ig-older">
            <h2 id="ig-older"><MdElderly aria-hidden="true" /> {t('intergen.older.title')}</h2>
            <ul>
              <li>{t('intergen.older.point1')}</li>
              <li>{t('intergen.older.point2')}</li>
              <li>{t('intergen.older.point3')}</li>
            </ul>
            <Link className="ig-link" to="/faq">{t('intergen.older.cta')} <MdArrowForward aria-hidden="true" /></Link>
          </section>
          <section className="ig-audience" aria-labelledby="ig-orgs">
            <h2 id="ig-orgs"><MdBusiness aria-hidden="true" /> {t('intergen.organizations.title')}</h2>
            <ul>
              <li>{t('intergen.organizations.point1')}</li>
              <li>{t('intergen.organizations.point2')}</li>
              <li>{t('intergen.organizations.point3')}</li>
            </ul>
            <Link className="ig-link" to="/resources">{t('intergen.organizations.cta')} <MdArrowForward aria-hidden="true" /></Link>
          </section>
        </div>

        <section aria-labelledby="ig-list">
          <h2 id="ig-list" className="ig-title">{t('intergen.listTitle')}</h2>
          {orgs === null ? (
            <p className="ig-empty">{t('common.loading')}</p>
          ) : orgs.length === 0 ? (
            <p className="ig-empty">{t('intergen.listEmpty')}</p>
          ) : (
            <ul className="ig-orgs">
              {orgs.map(org => {
                const logo = logoUrl(org);
                return (
                  <li key={org.id}>
                    <Link className="ig-org" to={`/organizations/${org.id}`}>
                      <span className="ig-org-logo">
                        {logo ? <img src={logo} alt="" /> : <span aria-hidden="true">{initials(org.orgName)}</span>}
                      </span>
                      <span className="ig-org-body">
                        <strong>{org.orgName}</strong>
                        {(org.serviceAreas || []).length > 0 && <span>{org.serviceAreas.map(cityLabel).join(', ')}</span>}
                      </span>
                      <MdArrowForward aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <Link className="btn btn-outline ig-all" to="/organizations">{t('intergen.allOrganizations')}</Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default IntergenerationalPage;
