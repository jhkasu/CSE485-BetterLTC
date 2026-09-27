import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './RecentOpportunities.css';
import API_BASE from './config';

function RecentOpportunities() {
  const { t } = useTranslation();
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/listings`)
      .then(res => res.json())
      .then(data => setOpportunities(data.slice(0, 3)))
      .catch(() => setOpportunities([]));
  }, []);

  if (opportunities.length === 0) return null;

  return (
    <section className="section recent-opp">
      <div className="container">
      <div className="recent-opp-header">
        <div>
          <span className="eyebrow">{t('home.recent.eyebrow')}</span>
          <h2 className="section-title">{t('home.recent.heading')}</h2>
        </div>
        <Link to="/volunteer" className="arrow-link">{t('common.viewAll')} →</Link>
      </div>
      <div className="recent-opp-grid">
        {opportunities.map(op => (
          <article key={op.id} className="opp-card">
            <div className="opp-card-body">
              <span className="opp-status">{op.status}</span>
              <h3>{op.listingTitle}</h3>
              <p className="opp-org">{op.orgName}</p>
              <p className="opp-desc">{op.description}</p>
            </div>
            <div className="opp-card-footer">
              <div className="opp-tags">
                <span className="opp-tag">{op.location}</span>
                <span className="opp-tag">{op.days}</span>
              </div>
              <Link className="arrow-link opp-link" to={`/volunteer/${op.id}`} aria-label={t('common.viewDetailsFor', { title: op.listingTitle })}>{t('common.viewDetails')} →</Link>
            </div>
          </article>
        ))}
      </div>
      </div>
    </section>
  );
}

export default RecentOpportunities;
