import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import OrgDashboard from './OrgDashboard';
import { setSession } from './auth/session';
import { AccessibilityProvider } from './accessibility/AccessibilityContext';
import { futureExp, makeToken } from './auth/testToken';

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '3', role: 'organization', exp: futureExp() }), { id: 3, orgName: 'Care Home', isApproved: true, role: 'organization' });
  global.fetch = jest.fn((url) => Promise.resolve({
    ok: true,
    status: 200,
    json: async () => (url.endsWith('/api/organizations/3')
      ? { id: 3, orgName: 'Care Home', isApproved: true, description: '', serviceAreas: ['Regina'], helpTypes: ['Meal Assistance'], categories: [], notificationEmail: '', website: '', logoVersion: null }
      : []),
  }));
});

afterEach(() => {
  delete global.fetch;
});

function renderDashboard() {
  return render(
    <AccessibilityProvider>
      <MemoryRouter>
        <OrgDashboard />
      </MemoryRouter>
    </AccessibilityProvider>,
  );
}

test('the menu button opens the navigation and choosing a section closes it', async () => {
  renderDashboard();
  const button = screen.getByRole('button', { name: 'Menu' });
  expect(button).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('button', { name: 'Request List' })).toHaveAttribute('aria-current', 'page');
  fireEvent.click(screen.getByRole('button', { name: 'Profile' }));
  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByRole('button', { name: 'Profile' })).toHaveAttribute('aria-current', 'page');
  expect(await screen.findByLabelText(/organization name/i)).toBeInTheDocument();
});

test('Escape and the close button close the menu and return focus', () => {
  renderDashboard();
  const button = screen.getByRole('button', { name: 'Menu' });
  fireEvent.click(button);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(button).toHaveFocus();
  fireEvent.click(button);
  fireEvent.click(screen.getByRole('button', { name: 'Close menu' }));
  expect(button).toHaveAttribute('aria-expanded', 'false');
});
