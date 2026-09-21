import React from 'react';
import { Link } from 'react-router-dom';
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
  return (
    <section className="section pillars">
      <div className="container">
        <span className="eyebrow">What we do</span>
        <h2 className="section-title">Three ways to get involved</h2>
        <div className="pillars-grid">
          {PILLARS.map(p => (
            <article key={p.title} className="pillar">
              <div className="pillar-image">
                <img src={p.image} alt="" loading="lazy" />
              </div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
              <Link className="arrow-link pillar-link" to={p.link}>{p.cta} <span aria-hidden="true">&rarr;</span></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pillars;
