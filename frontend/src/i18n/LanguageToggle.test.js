import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import i18n from './index';
import LanguageToggle from './LanguageToggle';
import { LANGUAGE_KEY } from './languageStorage';
import en from '../locales/en/translation.json';
import fr from '../locales/fr/translation.json';

function flatten(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') return { ...acc, ...flatten(value, path) };
    return { ...acc, [path]: value };
  }, {});
}

beforeEach(async () => {
  window.localStorage.clear();
  await act(() => i18n.changeLanguage('en'));
});

test('shows the other language and switches to French', async () => {
  render(<LanguageToggle />);
  fireEvent.click(screen.getByRole('button', { name: /français/i }));
  expect(await screen.findByRole('button', { name: /english/i })).toBeInTheDocument();
  expect(i18n.language).toBe('fr');
});

test('switching language updates the page lang and saves the choice', async () => {
  render(<LanguageToggle />);
  fireEvent.click(screen.getByRole('button', { name: /français/i }));
  await waitFor(() => expect(document.documentElement).toHaveAttribute('lang', 'fr-CA'));
  expect(window.localStorage.getItem(LANGUAGE_KEY)).toBe('fr');
  fireEvent.click(await screen.findByRole('button', { name: /english/i }));
  await waitFor(() => expect(document.documentElement).toHaveAttribute('lang', 'en-CA'));
  expect(window.localStorage.getItem(LANGUAGE_KEY)).toBe('en');
});

test('English and French files have the same keys and placeholders', () => {
  const enFlat = flatten(en);
  const frFlat = flatten(fr);
  expect(Object.keys(frFlat).sort()).toEqual(Object.keys(enFlat).sort());
  const placeholders = (text) => (String(text).match(/{{\s*\w+\s*}}/g) || []).sort();
  Object.keys(enFlat).forEach((key) => {
    expect([key, placeholders(frFlat[key])]).toEqual([key, placeholders(enFlat[key])]);
  });
});
