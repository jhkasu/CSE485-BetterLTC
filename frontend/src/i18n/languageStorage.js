export const LANGUAGE_KEY = 'language';
export const SUPPORTED_LANGUAGES = ['en', 'fr'];
export const DEFAULT_LANGUAGE = 'en';

export function isSupported(language) {
  return SUPPORTED_LANGUAGES.includes(language);
}

export function detectBrowserLanguage() {
  const preferred = typeof navigator !== 'undefined' ? navigator.language || '' : '';
  return preferred.toLowerCase().startsWith('fr') ? 'fr' : DEFAULT_LANGUAGE;
}

export function loadLanguage() {
  try {
    const saved = window.localStorage.getItem(LANGUAGE_KEY);
    if (isSupported(saved)) return saved;
  } catch {
    return detectBrowserLanguage();
  }
  return detectBrowserLanguage();
}

export function saveLanguage(language) {
  if (!isSupported(language)) return false;
  try {
    window.localStorage.setItem(LANGUAGE_KEY, language);
    return true;
  } catch {
    return false;
  }
}

export function htmlLang(language) {
  return language === 'fr' ? 'fr-CA' : 'en-CA';
}
