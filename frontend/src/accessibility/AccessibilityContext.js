import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  CONTRAST_MODES,
  DEFAULT_SETTINGS,
  FONT_SIZES,
  STORAGE_KEY,
  applySettings,
  loadSettings,
  sanitize,
  saveSettings,
} from './a11yStorage';

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  // Keep <html> attributes and storage in step with state.
  useEffect(() => {
    applySettings(settings);
    saveSettings(settings);
  }, [settings]);

  // Follow changes made in another tab.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setSettings(loadSettings());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setContrast = useCallback(
    (contrast) => setSettings((prev) => sanitize({ ...prev, contrast })),
    []
  );
  const setFontSize = useCallback(
    (fontSize) => setSettings((prev) => sanitize({ ...prev, fontSize })),
    []
  );
  const reset = useCallback(() => setSettings({ ...DEFAULT_SETTINGS }), []);

  const value = useMemo(
    () => ({
      contrast: settings.contrast,
      fontSize: settings.fontSize,
      setContrast,
      setFontSize,
      reset,
      contrastModes: CONTRAST_MODES,
      fontSizes: FONT_SIZES,
    }),
    [settings, setContrast, setFontSize, reset]
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibilitySettings() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error('useAccessibilitySettings must be used inside <AccessibilityProvider>');
  }
  return ctx;
}
