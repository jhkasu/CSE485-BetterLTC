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
    if (url.endsWith('/api/organizations/3')) return respond({ id: 3, orgName: 'Care Home', isApproved: true, description: '', serviceAreas: ['Regina'], categories: [], notificationEmail: '', website: '', logoVersion: null });
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

test('opens on the profile and has no help request sections', async () => {
  renderDashboard();
  expect(await screen.findByLabelText(/organization name/i)).toBeInTheDocument();
  expect(screen.queryByText('Help Requests')).not.toBeInTheDocument();
  expect(screen.queryByText('Accepted Requests')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Account' }));
  expect(screen.queryByLabelText(/organization name/i)).not.toBeInTheDocument();
});
