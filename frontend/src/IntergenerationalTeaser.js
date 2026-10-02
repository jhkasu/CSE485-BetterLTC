import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdDiversity3 } from 'react-icons/md';
import './IntergenerationalPage.css';

function IntergenerationalTeaser() {
  const { t } = useTranslation();
  return (
    <section className="section ig-teaser" aria-labelledby="ig-teaser-title">
      <div className="container ig-teaser-inner">
        <span className="ig-teaser-icon" aria-hidden="true"><MdDiversity3 /></span>
        <div className="ig-teaser-text">
          <h2 id="ig-teaser-title">{t('intergen.teaser.title')}</h2>
          <p>{t('intergen.teaser.text')}</p>
        </div>
        <Link className="btn btn-primary" to="/intergenerational">{t('intergen.teaser.cta')}</Link>
      </div>
    </section>
  );
}

export default IntergenerationalTeaser;
