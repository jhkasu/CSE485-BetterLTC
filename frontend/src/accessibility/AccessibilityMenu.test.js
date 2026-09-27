import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibilityProvider } from './AccessibilityContext';
import AccessibilityMenu from './AccessibilityMenu';
import { STORAGE_KEY } from './a11yStorage';

function renderMenu() {
  return render(
    <AccessibilityProvider>
      <AccessibilityMenu />
      <p>Outside</p>
    </AccessibilityProvider>
  );
}

function openPanel() {
  fireEvent.click(screen.getByRole('button', { name: /display/i }));
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-contrast');
  document.documentElement.removeAttribute('data-font-size');
});

test('panel is closed until the Display button is pressed', () => {
  renderMenu();
  const button = screen.getByRole('button', { name: /display/i });
  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('group', { name: /display settings/i })).not.toBeInTheDocument();
  openPanel();
  expect(button).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('group', { name: /display settings/i })).toBeInTheDocument();
});

test('choosing a contrast mode applies it to the page and saves it', () => {
  renderMenu();
  openPanel();
  fireEvent.click(screen.getByRole('radio', { name: /dark/i }));
  expect(document.documentElement).toHaveAttribute('data-contrast', 'dark');
  expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)).contrast).toBe('dark');
  fireEvent.click(screen.getByRole('radio', { name: /high contrast/i }));
  expect(document.documentElement).toHaveAttribute('data-contrast', 'high');
});

test('choosing a text size applies it to the page and saves it', () => {
  renderMenu();
  openPanel();
  fireEvent.click(screen.getByRole('radio', { name: /extra large/i }));
  expect(document.documentElement).toHaveAttribute('data-font-size', 'xlarge');
  expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)).fontSize).toBe('xlarge');
});

test('the current choice is shown as selected', () => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ contrast: 'high', fontSize: 'large' }));
  renderMenu();
  openPanel();
  expect(screen.getByRole('radio', { name: /high contrast/i })).toBeChecked();
  expect(screen.getByRole('radio', { name: /^large$/i })).toBeChecked();
});

test('reset restores the default settings', () => {
  renderMenu();
  openPanel();
  fireEvent.click(screen.getByRole('radio', { name: /dark/i }));
  fireEvent.click(screen.getByRole('radio', { name: /extra large/i }));
  fireEvent.click(screen.getByRole('button', { name: /reset to default/i }));
  expect(document.documentElement).toHaveAttribute('data-contrast', 'light');
  expect(document.documentElement).toHaveAttribute('data-font-size', 'normal');
  expect(screen.getByRole('radio', { name: /light/i })).toBeChecked();
});

test('Escape closes the panel and returns focus to the button', () => {
  renderMenu();
  openPanel();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('group', { name: /display settings/i })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /display/i })).toHaveFocus();
});

test('clicking outside closes the panel', () => {
  renderMenu();
  openPanel();
  fireEvent.mouseDown(screen.getByText('Outside'));
  expect(screen.queryByRole('group', { name: /display settings/i })).not.toBeInTheDocument();
});

test('clicking an option with the mouse keeps the panel open and applies it', () => {
  renderMenu();
  userEvent.click(screen.getByRole('button', { name: /display/i }));
  userEvent.click(screen.getByText('Dark'));
  expect(screen.getByRole('group', { name: /display settings/i })).toBeInTheDocument();
  expect(document.documentElement).toHaveAttribute('data-contrast', 'dark');
  userEvent.click(screen.getByText('Extra large'));
  expect(screen.getByRole('group', { name: /display settings/i })).toBeInTheDocument();
  expect(document.documentElement).toHaveAttribute('data-font-size', 'xlarge');
  userEvent.click(screen.getByRole('button', { name: /reset to default/i }));
  expect(screen.getByRole('group', { name: /display settings/i })).toBeInTheDocument();
  expect(document.documentElement).toHaveAttribute('data-contrast', 'light');
});

test('moving keyboard focus out of the menu closes the panel', () => {
  render(
    <AccessibilityProvider>
      <AccessibilityMenu />
      <button type="button">Next</button>
    </AccessibilityProvider>
  );
  openPanel();
  fireEvent.blur(screen.getByRole('button', { name: /display/i }), {
    relatedTarget: screen.getByRole('button', { name: 'Next' }),
  });
  expect(screen.queryByRole('group', { name: /display settings/i })).not.toBeInTheDocument();
});
