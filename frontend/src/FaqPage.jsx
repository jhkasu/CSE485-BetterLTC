import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdSearch, MdExpandMore } from 'react-icons/md';
import Navbar from './Navbar';
import Footer from './Footer';
import apiFetch from './api';
import { FAQ_TOPICS, faqText } from './faqOptions';
import './FaqPage.css';

function FaqPage() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState(null);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    apiFetch('/api/faqs')
      .then(res => (res.ok ? res.json() : []))
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, []);

  const search = keyword.trim().toLowerCase();
  const localized = (items || []).map(item => ({ ...item, ...faqText(item, i18n.language) }));
  const matches = localized.filter(item => !search
    || item.question.toLowerCase().includes(search)
    || item.answer.toLowerCase().includes(search));
  const groups = FAQ_TOPICS
    .map(topic => ({ topic, items: matches.filter(item => item.topic === topic) }))
    .filter(group => group.items.length > 0);

  return (
    <div>
      <Navbar />
      <header className="band-header">
        <div className="band-header-inner container">
          <span className="eyebrow">{t('faq.eyebrow')}</span>
          <h1>{t('faq.heading')}</h1>
          <p>{t('faq.lead')}</p>
          <label className="faq-search">
            <MdSearch aria-hidden="true" />
            <span className="visually-hidden">{t('faq.search')}</span>
            <input type="search" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder={t('faq.search')} />
          </label>
        </div>
      </header>

      <main className="faq-page container">
        <div className="faq-content">
          {items === null ? (
            <p className="faq-empty">{t('common.loading')}</p>
          ) : groups.length === 0 ? (
            <p className="faq-empty" role="status">{search ? t('faq.noMatch', { keyword }) : t('faq.empty')}</p>
          ) : (
            <>
              {groups.length > 1 && (
                <div className="faq-jump" role="navigation" aria-label={t('faq.topics')}>
                  {groups.map(group => (
                    <a key={group.topic} href={`#faq-${group.topic}`}>{t(`faq.topicNames.${group.topic}`)}</a>
                  ))}
                </div>
              )}
              {groups.map(group => (
                <section key={group.topic} className="faq-group" aria-labelledby={`faq-${group.topic}`}>
                  <h2 id={`faq-${group.topic}`} className="faq-group-title">{t(`faq.topicNames.${group.topic}`)}</h2>
                  <div className="faq-list">
                    {group.items.map(item => (
                      <details key={item.id} className="faq-item" open={!!search}>
                        <summary>
                          <span>{item.question}</span>
                          <MdExpandMore className="faq-chevron" aria-hidden="true" />
                        </summary>
                        <p className="faq-answer">{item.answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}

          <aside className="faq-more">
            <h2>{t('faq.moreTitle')}</h2>
            <p>{t('faq.moreText')}</p>
            <div className="faq-more-links">
              <Link className="btn btn-primary" to="/organizations">{t('faq.findOrganization')}</Link>
              <Link className="btn btn-outline" to="/resources">{t('faq.browseResources')}</Link>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default FaqPage;
