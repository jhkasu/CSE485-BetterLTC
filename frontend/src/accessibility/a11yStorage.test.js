import { DEFAULT_SETTINGS, STORAGE_KEY, applySettings, loadSettings, sanitize, saveSettings } from './a11yStorage';

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-contrast');
  document.documentElement.removeAttribute('data-font-size');
});

test('returns defaults when nothing is saved', () => {
  expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
});

test('saves and reloads a valid choice', () => {
  expect(saveSettings({ contrast: 'high', fontSize: 'xlarge' })).toBe(true);
  expect(loadSettings()).toEqual({ contrast: 'high', fontSize: 'xlarge' });
});

test('falls back to defaults for unknown or corrupted values', () => {
  expect(sanitize({ contrast: 'neon', fontSize: 99 })).toEqual(DEFAULT_SETTINGS);
  window.localStorage.setItem(STORAGE_KEY, '{not json');
  expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
});

test('does not throw when storage is blocked', () => {
  const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  expect(saveSettings({ contrast: 'dark', fontSize: 'large' })).toBe(false);
  getItem.mockRestore();
  setItem.mockRestore();
});

test('applies settings as attributes on <html>', () => {
  applySettings({ contrast: 'dark', fontSize: 'large' });
  expect(document.documentElement.getAttribute('data-contrast')).toBe('dark');
  expect(document.documentElement.getAttribute('data-font-size')).toBe('large');
});
