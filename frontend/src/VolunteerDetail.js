import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './VolunteerDetail.css';

const VOLUNTEER_OPPORTUNITIES = [
  {
    id: 1,
    title: 'Senior Companionship Program',
    organization: 'Sunrise Care Foundation',
    status: 'Is Ongoing',
    description: 'Provide friendship and support to isolated seniors in long-term care facilities. Volunteers visit residents weekly to share conversation, play games, read together, or simply offer a caring presence.',
    location: 'Toronto',
    days: 'Flexible',
  },
  {
    id: 2,
    title: 'Community Food Drive Support',
    organization: 'Vancouver Community Aid',
    status: 'Is Ongoing',
    description: 'Help sort and pack food donations for local families in need. Volunteers assist with organizing donations, preparing food hampers, and supporting distribution events at our warehouse.',
    location: 'Vancouver',
    days: 'Weekends',
  },
  {
    id: 3,
    title: 'Memory Care Activities Assistant',
    organization: 'Montreal Memory Care Society',
    status: 'Is Ongoing',
    description: 'Lead engaging activities for seniors living with dementia in care homes. Volunteers facilitate music sessions, art projects, and reminiscing groups designed to support cognitive wellbeing.',
    location: 'Montreal',
    days: 'Weekdays',
  },
  {
    id: 4,
    title: 'Transportation Volunteer',
    organization: 'Calgary Seniors Services',
    status: 'Is Ongoing',
    description: 'Drive seniors to medical appointments and community events. Volunteers use their own vehicles to provide safe, friendly transportation for seniors who no longer drive.',
    location: 'Calgary',
    days: 'Flexible',
  },
];

function VolunteerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const opportunity = VOLUNTEER_OPPORTUNITIES.find(o => o.id === parseInt(id));

  if (!opportunity) {
    return (
      <div>
        <Navbar />
        <div className="vdetail-not-found">
          <p>Opportunity not found.</p>
          <Link to="/volunteer">← Back to Opportunities</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleRegister = () => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) {
      navigate('/signin');
      return;
    }
    alert('You have been registered successfully!');
  };

  return (
    <div>
      <Navbar />
      <div className="vdetail-page">
        <Link to="/volunteer" className="vdetail-back">← Back to Opportunities</Link>
        <div className="vdetail-card">
          <span className="vdetail-status">{opportunity.status}</span>
          <h1>{opportunity.title}</h1>
          <p className="vdetail-org">{opportunity.organization}</p>
          <div className="vdetail-meta">
            <div className="vdetail-meta-item">
              <span className="vdetail-meta-label">Location</span>
              <span className="vdetail-meta-value">{opportunity.location}</span>
            </div>
            <div className="vdetail-meta-item">
              <span className="vdetail-meta-label">Schedule</span>
              <span className="vdetail-meta-value">{opportunity.days}</span>
            </div>
          </div>
          <p className="vdetail-description">{opportunity.description}</p>
          <button className="vdetail-register" onClick={handleRegister}>Register Now</button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default VolunteerDetail;
