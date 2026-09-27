import { LANGUAGE_KEY, detectBrowserLanguage, htmlLang, loadLanguage, saveLanguage } from './languageStorage';

const originalLanguage = Object.getOwnPropertyDescriptor(window.navigator, 'language');

function setBrowserLanguage(value) {
  Object.defineProperty(window.navigator, 'language', { value, configurable: true });
}

afterEach(() => {
  window.localStorage.clear();
  if (originalLanguage) Object.defineProperty(window.navigator, 'language', originalLanguage);
  jest.restoreAllMocks();
});

test('uses the saved language when there is one', () => {
  window.localStorage.setItem(LANGUAGE_KEY, 'fr');
  expect(loadLanguage()).toBe('fr');
});

test('falls back to the browser language when nothing valid is saved', () => {
  window.localStorage.setItem(LANGUAGE_KEY, 'de');
  setBrowserLanguage('fr-CA');
  expect(loadLanguage()).toBe('fr');
  setBrowserLanguage('en-US');
  expect(loadLanguage()).toBe('en');
});

test('detects French for any French browser locale', () => {
  setBrowserLanguage('fr-FR');
  expect(detectBrowserLanguage()).toBe('fr');
  setBrowserLanguage('es-MX');
  expect(detectBrowserLanguage()).toBe('en');
});

test('saves only supported languages', () => {
  expect(saveLanguage('fr')).toBe(true);
  expect(window.localStorage.getItem(LANGUAGE_KEY)).toBe('fr');
  expect(saveLanguage('de')).toBe(false);
  expect(window.localStorage.getItem(LANGUAGE_KEY)).toBe('fr');
});

test('does not throw when storage is blocked', () => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  setBrowserLanguage('en-CA');
  expect(loadLanguage()).toBe('en');
  expect(saveLanguage('fr')).toBe(false);
});

test('maps languages to Canadian html lang values', () => {
  expect(htmlLang('fr')).toBe('fr-CA');
  expect(htmlLang('en')).toBe('en-CA');
});
