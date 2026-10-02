import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdChevronLeft, MdChevronRight, MdFormatQuote } from 'react-icons/md';
import apiFetch from './api';
import API_BASE from './config';
import './TestimonialsSection.css';

export function testimonialPhotoUrl(item) {
  return item?.photoVersion ? `${API_BASE}/api/testimonials/${item.id}/photo?v=${item.photoVersion}` : null;
}

export function testimonialQuote(item, language) {
  return ((language || '').startsWith('fr') && item.quoteFr) || item.quoteEn;
}

function TestimonialsSection() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    apiFetch('/api/testimonials')
      .then(res => (res.ok ? res.json() : []))
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) return null;

  const current = items[Math.min(index, items.length - 1)];
  const photo = testimonialPhotoUrl(current);
  const go = (step) => setIndex(i => (i + step + items.length) % items.length);
  const roleCity = [t(`testimonials.roles.${current.role}`), current.city].filter(Boolean).join(' · ');

  return (
    <section className="section testimonials" aria-labelledby="testimonials-title" aria-roledescription="carousel">
      <div className="container">
        <span className="eyebrow">{t('testimonials.eyebrow')}</span>
        <h2 id="testimonials-title" className="section-title testimonials-title">{t('testimonials.heading')}</h2>

        <div className="testimonial-card">
          <figure
            className="testimonial-figure"
            aria-roledescription="slide"
            aria-label={t('testimonials.position', { current: index + 1, total: items.length })}
            aria-live="polite"
          >
            <MdFormatQuote className="testimonial-mark" aria-hidden="true" />
            <blockquote className="testimonial-quote">{testimonialQuote(current, i18n.language)}</blockquote>
            <figcaption className="testimonial-person">
              <span className="testimonial-avatar" aria-hidden="true">
                {photo ? <img src={photo} alt="" /> : current.name.slice(0, 1).toUpperCase()}
              </span>
              <span>
                <strong>{current.name}</strong>
                <span className="testimonial-role">{roleCity}</span>
              </span>
            </figcaption>
          </figure>

          {items.length > 1 && (
            <div className="testimonial-controls">
              <button type="button" className="testimonial-btn" onClick={() => go(-1)} aria-label={t('testimonials.previous')}>
                <MdChevronLeft aria-hidden="true" />
              </button>
              <span className="testimonial-count">{index + 1} / {items.length}</span>
              <button type="button" className="testimonial-btn" onClick={() => go(1)} aria-label={t('testimonials.next')}>
                <MdChevronRight aria-hidden="true" />
              </button>
            </div>
          )}
        </div>

        <Link className="arrow-link testimonials-more" to="/our-work">{t('testimonials.moreStories')} <span aria-hidden="true">&rarr;</span></Link>
      </div>
    </section>
  );
}

export default TestimonialsSection;
