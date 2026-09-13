import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './AboutPage.css';

const SECTIONS = [
  {
    eyebrow: 'Mission and vision',
    title: 'Why we exist',
    text: 'Our commitment to the health and well-being of older adults, and where we want long-term care to be in ten years.',
    link: '/about/mission',
    cta: 'Mission and vision',
    image: '/missionVision.png',
  },
  {
    eyebrow: 'Our history',
    title: 'How we got here',
    text: 'From a handful of neighbours helping neighbours to a province-wide volunteer network.',
    link: '/about/history',
    cta: 'Our history',
    image: '/saskatchewan.jpg',
  },
  {
    eyebrow: 'Our team',
    title: 'The people behind the work',
    text: 'Meet the coordinators, board members, and volunteers who keep the network running.',
    link: '/about/team',
    cta: 'Our team',
    image: '/ourTeam.png',
  },
];

function AboutPage() {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />

      <header className="page-header">
        <div className="page-header-text">
          <span className="eyebrow">About us</span>
          <h1>Neighbours looking after neighbours</h1>
        </div>
        <div className="page-header-media">
          <img src="/care1.png" alt="A volunteer with a senior" />
        </div>
      </header>

      <section className="about-list">
        {SECTIONS.map(s => (
          <div key={s.link} className="list-row">
            <div className="list-row-text">
              <span className="eyebrow">{s.eyebrow}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <button className="btn btn-outline" onClick={() => navigate(s.link)}>{s.cta}</button>
            </div>
            <div className="list-row-media">
              <img src={s.image} alt={s.title} loading="lazy" />
            </div>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}

export default AboutPage;
