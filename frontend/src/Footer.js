import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import SITE_LINKS from './siteLinks';
import './Footer.css';

const SOCIAL_ICONS = {
  facebook: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
  linkedin: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  instagram: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
  youtube: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#1a1a1a"/>
    </svg>
  ),
};

const EXPLORE_LINKS = [
  { to: '/organizations', labelKey: 'nav.volunteer' },
  { to: '/resources', labelKey: 'nav.resources' },
  { to: '/faq', labelKey: 'nav.faq' },
  { to: '/about', labelKey: 'nav.aboutUs' },
];

function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const social = SITE_LINKS.social.filter(item => item.url);
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-brand">
          <Logo className="footer-logo" />
          <p className="footer-tagline">{t('footer.tagline')}</p>
        </div>

        <div className="footer-links">
          <h3 className="footer-heading">{t('footer.explore')}</h3>
          <ul>
            {EXPLORE_LINKS.map(link => (
              <li key={link.to}><Link to={link.to}>{t(link.labelKey)}</Link></li>
            ))}
          </ul>
        </div>

        {SITE_LINKS.contactEmail && (
          <div className="footer-contact">
            <h3 className="footer-heading">{t('footer.contactUs')}</h3>
            <p><a href={`mailto:${SITE_LINKS.contactEmail}`}>{SITE_LINKS.contactEmail}</a></p>
          </div>
        )}

        {social.length > 0 && (
          <div className="footer-social">
            <h3 className="footer-heading">{t('footer.followUs')}</h3>
            <div className="social-links">
              {social.map(item => (
                <a key={item.id} href={item.url} target="_blank" rel="noreferrer" aria-label={item.label}>
                  {SOCIAL_ICONS[item.id]}
                </a>
              ))}
            </div>
          </div>
        )}

      </div>

      <div className="footer-bottom">
        <p>{t('footer.rights', { year })}</p>
      </div>
    </footer>
  );
}

export default Footer;
