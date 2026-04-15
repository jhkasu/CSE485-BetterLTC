import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RecentOpportunities.css';

const OPPORTUNITIES = [
  {
    id: 1,
    title: 'Senior Companionship Program',
    organization: 'Sunrise Care Foundation',
    status: 'Is Ongoing',
    description: 'Provide friendship and support to isolated seniors in long-term care facilities.',
    location: 'Toronto',
    days: 'Flexible',
  },
  {
    id: 2,
    title: 'Community Food Drive Support',
    organization: 'Vancouver Community Aid',
    status: 'Is Ongoing',
    description: 'Help sort and pack food donations for local families in need.',
    location: 'Vancouver',
    days: 'Weekends',
  },
  {
    id: 3,
    title: 'Memory Care Activities Assistant',
    organization: 'Montreal Memory Care Society',
    status: 'Is Ongoing',
    description: 'Lead engaging activities for seniors living with dementia in care homes.',
    location: 'Montreal',
    days: 'Weekdays',
  },
];

function RecentOpportunities() {
  const navigate = useNavigate();

  return (
    <section className="recent-opp">
      <div className="recent-opp-header">
        <h2>Recent Opportunities</h2>
        <Link to="/volunteer" className="recent-opp-viewall">View All →</Link>
      </div>
      <div className="recent-opp-grid">
        {OPPORTUNITIES.map(op => (
          <div key={op.id} className="opp-card" onClick={() => navigate(`/volunteer/${op.id}`)}>
            <div className="opp-card-body">
              <span className="opp-status">{op.status}</span>
              <h3>{op.title}</h3>
              <p className="opp-org">{op.organization}</p>
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
