import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageToggle.css';

const TARGET = {
  en: { code: 'fr', label: 'Français', lang: 'fr-CA' },
  fr: { code: 'en', label: 'English', lang: 'en-CA' },
};

function LanguageToggle({ className = '' }) {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage === 'fr' ? 'fr' : 'en';
  const target = TARGET[current];

  return (
    <button
      type="button"
      className={`language-toggle ${className}`.trim()}
      aria-label={t('language.switchTo', { language: target.label })}
      onClick={() => i18n.changeLanguage(target.code)}
    >
      <span lang={target.lang}>{target.label}</span>
    </button>
  );
}

export default LanguageToggle;
