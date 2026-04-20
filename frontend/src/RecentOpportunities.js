import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RecentOpportunities.css';

const API_BASE = 'http://localhost:5184';

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
    <section className="recent-opp">
      <div className="recent-opp-header">
        <h2>Recent Opportunities</h2>
        <Link to="/volunteer" className="recent-opp-viewall">View All →</Link>
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
              <span className="opp-view-detail">View Details →</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecentOpportunities;
