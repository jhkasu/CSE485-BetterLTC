import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en/translation.json';
import fr from '../locales/fr/translation.json';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, htmlLang, loadLanguage, saveLanguage } from './languageStorage';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: loadLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: { escapeValue: false },
});

document.documentElement.setAttribute('lang', htmlLang(i18n.language));

i18n.on('languageChanged', (language) => {
  document.documentElement.setAttribute('lang', htmlLang(language));
  saveLanguage(language);
});

export default i18n;
