import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import OrgDashboard from './OrgDashboard';
import { setSession } from './auth/session';
import { AccessibilityProvider } from './accessibility/AccessibilityContext';
import { futureExp, makeToken } from './auth/testToken';

function respond(body, ok = true) {
  return Promise.resolve({ ok, status: ok ? 200 : 500, json: async () => body });
}

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '3', role: 'organization', exp: futureExp() }), { id: 3, orgName: 'Care Home', isApproved: true, role: 'organization' });
  global.fetch = jest.fn((url) => {
    if (url.endsWith('/api/organizations/3')) return respond({ id: 3, orgName: 'Care Home', isApproved: true, description: '', serviceAreas: ['Regina'], helpTypes: ['Meal Assistance'], categories: [], notificationEmail: '', website: '', logoVersion: null });
    return respond([]);
  });
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
    </AccessibilityProvider>
  );
}

test('opens on the request list and has no listings or applicants', async () => {
  renderDashboard();
  expect(await screen.findByRole('heading', { name: 'Help Requests' })).toBeInTheDocument();
  expect(screen.queryByText('My Listings')).not.toBeInTheDocument();
  expect(screen.queryByText('Applicants')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Profile'));
  expect(await screen.findByLabelText(/organization name/i)).toBeInTheDocument();
});
