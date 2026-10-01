import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdCheck } from 'react-icons/md';
import { matchReasons } from './matchReasons';

const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function matchLabelKey(score) {
  if (score >= 80) return 'matching.labels.great';
  if (score >= 50) return 'matching.labels.good';
  if (score > 0) return 'matching.labels.fair';
  return 'matching.labels.low';
}

function MatchPanel({ match }) {
  const { t } = useTranslation();
  const score = Math.max(0, Math.min(100, match.score));
  const reasons = matchReasons(t, match);

  return (
    <aside className="match-panel" aria-label={t('matching.percent', { score })}>
      <svg className="match-ring" viewBox="0 0 80 80" aria-hidden="true">
        <circle className="match-ring-track" cx="40" cy="40" r={RADIUS} />
        <circle
          className="match-ring-value"
          cx="40"
          cy="40"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - score / 100)}
        />
        <text x="40" y="45" textAnchor="middle" className="match-ring-text">{score}%</text>
      </svg>
      <p className="match-label">{t(matchLabelKey(score))}</p>
      {reasons.length > 0 && (
        <ul className="match-reasons">
          {reasons.map(reason => (
            <li key={reason}><MdCheck aria-hidden="true" /> {reason}</li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export default MatchPanel;
