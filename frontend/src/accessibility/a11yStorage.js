// Reads and writes the visitor's accessibility preferences.
// Storage can be missing or blocked (private mode, strict browser settings),
// so every access is wrapped and the site always falls back to defaults.

export const STORAGE_KEY = 'a11y-settings';
export const CONTRAST_MODES = ['light', 'dark', 'high'];
export const FONT_SIZES = ['normal', 'large', 'xlarge'];
export const DEFAULT_SETTINGS = { contrast: 'light', fontSize: 'normal' };

export function sanitize(value) {
  const v = value && typeof value === 'object' ? value : {};
  return {
    contrast: CONTRAST_MODES.includes(v.contrast) ? v.contrast : DEFAULT_SETTINGS.contrast,
    fontSize: FONT_SIZES.includes(v.fontSize) ? v.fontSize : DEFAULT_SETTINGS.fontSize,
  };
}

export function loadSettings() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitize(JSON.parse(raw)) : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitize(settings)));
    return true;
  } catch {
    return false;
  }
}

export function applySettings(settings) {
  const s = sanitize(settings);
  const root = document.documentElement;
  root.setAttribute('data-contrast', s.contrast);
  root.setAttribute('data-font-size', s.fontSize);
}
