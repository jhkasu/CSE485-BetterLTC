import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RecentOpportunities.css';
import API_BASE from './config';

function RecentOpportunities() {
  const navigate = useNavigate();
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
          <span className="eyebrow">Opportunities</span>
          <h2 className="section-title">Recent opportunities</h2>
        </div>
        <Link to="/volunteer" className="arrow-link">View all →</Link>
      </div>
      <div className="recent-opp-grid">
        {opportunities.map(op => (
          <div key={op.id} className="opp-card" onClick={() => navigate(`/volunteer/${op.id}`)}>
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
              <span className="arrow-link">View details →</span>
            </div>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

export default RecentOpportunities;
