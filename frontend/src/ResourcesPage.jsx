import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdDescription, MdPictureAsPdf, MdDownload } from 'react-icons/md';
import Navbar from './Navbar';
import Footer from './Footer';
import apiFetch from './api';
import API_BASE from './config';
import FilterChip from './FilterChip';
import { RESOURCE_AUDIENCES, RESOURCE_TOPICS, formatFileSize } from './resourceOptions';
import './ResourcesPage.css';

function ResourcesPage() {
  const { t } = useTranslation();
  const [resources, setResources] = useState(null);
  const [audience, setAudience] = useState(RESOURCE_AUDIENCES[0]);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    apiFetch('/api/resources')
      .then(res => (res.ok ? res.json() : []))
      .then(data => setResources(Array.isArray(data) ? data : []))
      .catch(() => setResources([]));
  }, []);

  const inAudience = (resources || []).filter(r => r.audience === audience);
  const visible = inAudience.filter(r => topics.length === 0 || topics.includes(r.topic));
  const countFor = (a) => (resources || []).filter(r => r.audience === a).length;

  return (
    <div>
      <Navbar />
      <header className="band-header">
        <div className="band-header-inner container">
          <span className="eyebrow">{t('resources.eyebrow')}</span>
          <h1>{t('resources.heading')}</h1>
          <p>{t('resources.lead')}</p>
          <div className="res-toolbar">
            <div className="res-tabs" role="tablist" aria-label={t('resources.audience')}>
              {RESOURCE_AUDIENCES.map(a => (
                <button
                  key={a}
                  type="button"
                  role="tab"
                  aria-selected={audience === a}
                  className={`res-tab${audience === a ? ' res-tab--active' : ''}`}
                  onClick={() => setAudience(a)}
                >
                  {t(`resources.tabs.${a}`)} ({countFor(a)})
                </button>
              ))}
            </div>
            <FilterChip
              label={t('resources.topic')}
              options={RESOURCE_TOPICS.map(topic => ({ value: topic, label: t(`resources.topics.${topic}`) }))}
              selected={topics}
              onChange={setTopics}
            />
            {topics.length > 0 && (
              <button type="button" className="res-clear" onClick={() => setTopics([])}>{t('volunteer.filters.clear')}</button>
            )}
          </div>
        </div>
      </header>

      <main className="res-page container">
        {resources === null ? (
          <p className="res-empty">{t('common.loading')}</p>
        ) : visible.length === 0 ? (
          <p className="res-empty">{t(inAudience.length ? 'resources.emptyFiltered' : 'resources.empty')}</p>
        ) : (
          <ul className="res-list">
            {visible.map(r => (
              <li key={r.id} className="res-card">
                <div className={`res-icon res-icon--${r.fileType.toLowerCase()}`} aria-hidden="true">
                  {r.fileType === 'PDF' ? <MdPictureAsPdf /> : <MdDescription />}
                </div>
                <div className="res-body">
                  <span className="res-topic">{t(`resources.topics.${r.topic}`)}</span>
                  <h2 className="res-title">{r.title}</h2>
                  {r.description && <p className="res-description">{r.description}</p>}
                </div>
                <a
                  className="res-download"
                  href={`${API_BASE}/api/resources/${r.id}/file`}
                  download={r.fileName}
                  aria-label={t('resources.downloadOf', { title: r.title, type: r.fileType, size: formatFileSize(r.fileSize) })}
                >
                  <MdDownload aria-hidden="true" />
                  <span>{t('resources.download')}</span>
                  <span className="res-meta">{r.fileType} · {formatFileSize(r.fileSize)}</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default ResourcesPage;
