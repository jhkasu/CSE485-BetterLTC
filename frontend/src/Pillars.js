import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Pillars.css';

const PILLARS = [
  {
    title: 'Volunteer',
    text: 'Give a few hours a month to a senior or a care home near you.',
    image: '/care2.png',
    link: '/volunteer',
    cta: 'Browse opportunities',
  },
  {
    title: 'Organizations',
    text: 'Post your needs and connect with screened volunteers in your area.',
    image: '/care1.png',
    link: '/signup',
    cta: 'Partner with us',
  },
  {
    title: 'Community',
    text: 'See the stories and results of the people who show up for each other.',
    image: '/saskatchewan.jpg',
    link: '/our-work',
    cta: 'Read our work',
  },
];

function Pillars() {
  const navigate = useNavigate();
  return (
    <section className="section pillars">
      <div className="container">
        <span className="eyebrow">What we do</span>
        <h2 className="section-title">Three ways to get involved</h2>
        <div className="pillars-grid">
          {PILLARS.map(p => (
            <div key={p.title} className="pillar" onClick={() => navigate(p.link)}>
              <div className="pillar-image">
                <img src={p.image} alt={p.title} loading="lazy" />
              </div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
              <span className="arrow-link">{p.cta} &rarr;</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pillars;
