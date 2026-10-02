import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiFetch from './api';
import './AdminStatistics.css';

export const RANGES = [7, 30, 90];

export function niceMax(value) {
  if (value <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].map(m => m * magnitude).find(s => s * 5 >= value) || magnitude * 10;
  return Math.ceil(value / step) * step;
}

function DailyChart({ daily, language, t }) {
  const [active, setActive] = useState(null);
  const max = niceMax(Math.max(0, ...daily.map(d => d.count)));
  const ticks = [0, max / 2, max];
  const format = (date, options) => new Date(`${date}T12:00:00Z`).toLocaleDateString(language, options);
  const labelEvery = daily.length > 30 ? 14 : daily.length > 7 ? 7 : 1;
  const last = daily.length - 1;
  const showLabel = (i) => i % labelEvery === 0 || (i === last && last % labelEvery >= labelEvery / 2);

  return (
    <figure className="stats-chart" aria-labelledby="stats-chart-title">
      <figcaption id="stats-chart-title" className="stats-panel-title">{t('statistics.dailyTitle')}</figcaption>
      <div className="stats-plot">
        <div className="stats-axis" aria-hidden="true">
          {[...ticks].reverse().map(tick => <span key={tick}>{tick.toLocaleString(language)}</span>)}
        </div>
        <div className="stats-bars" role="img" aria-label={t('statistics.chartAlt', { days: daily.length, total: daily.reduce((s, d) => s + d.count, 0) })}>
          {ticks.map(tick => (
            <span key={tick} className="stats-grid" style={{ bottom: `${(tick / max) * 100}%` }} aria-hidden="true" />
          ))}
          {daily.map((d, i) => (
            <div
              key={d.date}
              className={`stats-slot${active === i ? ' stats-slot--active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              <span className="stats-bar" style={{ height: `${(d.count / max) * 100}%` }} />
              {active === i && (
                <span className="stats-tip" role="tooltip">
                  <strong>{d.count.toLocaleString(language)}</strong> {t('statistics.views')}
                  <span>{format(d.date, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="stats-xlabels" aria-hidden="true">
        {daily.map((d, i) => (
          <span key={d.date}>{showLabel(i) ? format(d.date, { month: 'short', day: 'numeric' }) : ''}</span>
        ))}
      </div>
      <details className="stats-table">
        <summary>{t('statistics.showTable')}</summary>
        <table className="admin-table">
          <thead><tr><th>{t('common.date')}</th><th>{t('statistics.views')}</th></tr></thead>
          <tbody>
            {daily.map(d => (
              <tr key={d.date}><td>{format(d.date, { year: 'numeric', month: 'short', day: 'numeric' })}</td><td>{d.count.toLocaleString(language)}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

function TopList({ title, rows, empty, language }) {
  const max = Math.max(1, ...rows.map(r => r.count));
  return (
    <section className="stats-panel" aria-label={title}>
      <h3 className="stats-panel-title">{title}</h3>
      {rows.length === 0 ? (
        <p className="admin-empty">{empty}</p>
      ) : (
        <ol className="stats-list">
          {rows.map(row => (
            <li key={row.key}>
              <span className="stats-list-head">
                <span className="stats-list-name">{row.label}</span>
                <span className="stats-list-value">{row.count.toLocaleString(language)}</span>
              </span>
              <span className="stats-list-track" aria-hidden="true">
                <span className="stats-list-fill" style={{ width: `${(row.count / max) * 100}%` }} />
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function AdminStatistics() {
  const { t, i18n } = useTranslation();
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(false);
    apiFetch(`/api/statistics/summary?days=${days}`)
      .then(res => {
        if (!res.ok) throw new Error('load failed');
        return res.json();
      })
      .then(data => { if (!cancelled) setSummary(data); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, [days]);

  const pageLabel = (path) => t(`statistics.pages.${path}`, { defaultValue: path });
  const language = i18n.language;

  return (
    <div>
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">{t('statistics.heading')}</h2>
          <p className="admin-section-lead">{t('statistics.lead')}</p>
        </div>
        <div className="admin-tabs stats-range" role="group" aria-label={t('statistics.range')}>
          {RANGES.map(r => (
            <button
              key={r}
              type="button"
              className={`admin-tab${days === r ? ' admin-tab--active' : ''}`}
              aria-pressed={days === r}
              onClick={() => setDays(r)}
            >
              {t('statistics.lastDays', { count: r })}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="admin-error" role="alert">{t('common.genericError')}</p>}
      {!summary ? (
        !error && <p className="admin-empty">{t('common.loading')}</p>
      ) : (
        <>
          <div className="stats-tiles">
            <div className="stats-tile" role="group" aria-label={t('statistics.totalViews')}>
              <span className="stats-tile-label" aria-hidden="true">{t('statistics.totalViews')}</span>
              <span className="stats-tile-value">{summary.totalViews.toLocaleString(language)}</span>
            </div>
            <div className="stats-tile" role="group" aria-label={t('statistics.averagePerDay')}>
              <span className="stats-tile-label" aria-hidden="true">{t('statistics.averagePerDay')}</span>
              <span className="stats-tile-value">{(Math.round((summary.totalViews / summary.days) * 10) / 10).toLocaleString(language)}</span>
            </div>
            <div className="stats-tile" role="group" aria-label={t('statistics.totalDownloads')}>
              <span className="stats-tile-label" aria-hidden="true">{t('statistics.totalDownloads')}</span>
              <span className="stats-tile-value">{summary.totalDownloads.toLocaleString(language)}</span>
            </div>
          </div>

          <div className="stats-panel">
            <DailyChart daily={summary.daily} language={language} t={t} />
          </div>

          <div className="stats-columns">
            <TopList
              title={t('statistics.topPages')}
              rows={summary.topPages.map(p => ({ key: p.path, label: pageLabel(p.path), count: p.count }))}
              empty={t('statistics.noData')}
              language={language}
            />
            <div className="stats-stack">
              <TopList
                title={t('statistics.topOrganizations')}
                rows={summary.topOrganizations.map(o => ({ key: o.id, label: o.name, count: o.count }))}
                empty={t('statistics.noData')}
                language={language}
              />
              <TopList
                title={t('statistics.topResources')}
                rows={summary.topResources.map(r => ({ key: r.id, label: r.name, count: r.count }))}
                empty={t('statistics.noData')}
                language={language}
              />
            </div>
          </div>
          <p className="admin-help-senior stats-privacy">{t('statistics.privacy')}</p>
        </>
      )}
    </div>
  );
}

export default AdminStatistics;
