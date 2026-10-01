import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import OrganizationPage, { logoUrl, websiteHost } from './OrganizationPage';
import { AccessibilityProvider } from './accessibility/AccessibilityContext';

const org = {
  id: 4, orgName: 'Prairie Care', description: 'We help seniors stay connected.',
  serviceAreas: ['Regina', 'Saskatoon'], helpTypes: ['Companionship'],
  website: 'https://www.prairiecare.org', logoVersion: 99,
};

function respond(body, ok = true) {
  return Promise.resolve({ ok, status: ok ? 200 : 404, json: async () => body });
}

function renderPage(publicResponse) {
  global.fetch = jest.fn(() => publicResponse);
  return render(
    <AccessibilityProvider>
      <MemoryRouter initialEntries={['/organizations/4']}>
        <Routes>
          <Route path="/organizations/:id" element={<OrganizationPage />} />
        </Routes>
      </MemoryRouter>
    </AccessibilityProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  delete global.fetch;
});

test('builds logo and website helpers', () => {
  expect(logoUrl(org)).toMatch(/\/api\/organizations\/4\/logo\?v=99$/);
  expect(logoUrl({ id: 4, logoVersion: null })).toBeNull();
  expect(websiteHost('https://www.prairiecare.org/about')).toBe('prairiecare.org');
});

test('shows the profile and website link', async () => {
  renderPage(respond(org));
  expect(await screen.findByRole('heading', { level: 1, name: 'Prairie Care' })).toBeInTheDocument();
  expect(screen.getByText('We help seniors stay connected.')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Prairie Care logo' })).toBeInTheDocument();
  const visit = screen.getByRole('link', { name: /Visit website/ });
  expect(visit).toHaveAttribute('href', 'https://www.prairiecare.org');
  expect(visit).toHaveAttribute('target', '_blank');
});

test('hides empty sections', async () => {
  renderPage(respond({ ...org, description: '', website: '', logoVersion: null }));
  await screen.findByRole('heading', { level: 1, name: 'Prairie Care' });
  expect(screen.queryByRole('heading', { name: 'About' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /Visit website/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('img', { name: 'Prairie Care logo' })).not.toBeInTheDocument();
});

test('shows not found for unapproved or missing organizations', async () => {
  renderPage(respond(null, false));
  expect(await screen.findByRole('heading', { name: 'Organization not found' })).toBeInTheDocument();
});
