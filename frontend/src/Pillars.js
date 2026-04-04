import React, { useEffect, useRef } from 'react';
import './Pillars.css';

function Pillars() {
  const pillarsRef = useRef(null);

  useEffect(() => {
    const cards = pillarsRef.current?.querySelectorAll('.pillar-card');
    if (!cards) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target;
            const delay = card.getAttribute('data-delay') || '0';
            card.style.transitionDelay = delay;
            card.classList.add('visible');
            observer.unobserve(card);
          }
        });
      },
      { threshold: 0.15 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="pillars" ref={pillarsRef}>
      <div className="pillar-card" data-delay="0ms">
        <img src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600" alt="Volunteer" />
        <h3>Volunteer</h3>
        <p>Experience the joy of giving back.</p>
        <button>Join Us</button>
      </div>
      <div className="pillar-card" data-delay="150ms">
        <img src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600" alt="Organizations" />
        <h3>Organizations</h3>
        <p>Connect with volunteers for your cause.</p>
        <button>Partner with Us</button>
      </div>
      <div className="pillar-card" data-delay="300ms">
        <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600" alt="Community" />
        <h3>Community</h3>
        <p>Building a stronger, caring society.</p>
        <button>Read Stories</button>
      </div>
    </div>
  );
}

export default Pillars;