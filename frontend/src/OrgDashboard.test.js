import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import OrgDashboard from './OrgDashboard';
import { setSession } from './auth/session';
import { AccessibilityProvider } from './accessibility/AccessibilityContext';
import { futureExp, makeToken } from './auth/testToken';

const approved = { id: 5, volunteerId: 7, volunteerName: 'Ana Lee', volunteerEmail: 'ana@example.test', listingId: 10, listingTitle: 'Reading Buddies', orgName: 'Care Home', registeredAt: '2026-09-01', status: 'Approved', hoursServed: null, completedAt: '' };

function respond(body, ok = true) {
  return Promise.resolve({ ok, status: ok ? 200 : 500, json: async () => body });
}

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '3', role: 'organization', exp: futureExp() }), { id: 3, orgName: 'Care Home', isApproved: true, role: 'organization' });
  global.fetch = jest.fn((url, options = {}) => {
    if (url.endsWith('/api/registrations/5/complete')) {
      const { hours } = JSON.parse(options.body);
      return respond({ ...approved, status: 'Completed', hoursServed: hours, completedAt: '2026-10-01' });
    }
    if (url.endsWith('/api/registrations')) return respond([approved]);
    if (url.endsWith('/api/organizations/3')) return respond({ id: 3, orgName: 'Care Home', isApproved: true });
    if (url.endsWith('/api/listings')) return respond([]);
    return respond([]);
  });
});

afterEach(() => {
  delete global.fetch;
});

async function openApplicants() {
  render(
    <AccessibilityProvider>
      <MemoryRouter>
        <OrgDashboard />
      </MemoryRouter>
    </AccessibilityProvider>
  );
  fireEvent.click(screen.getByText('Applicants'));
  await screen.findByText('Ana Lee');
}

test('records hours for an approved volunteer', async () => {
  await openApplicants();
  fireEvent.click(screen.getByRole('button', { name: 'Mark Completed' }));
  fireEvent.change(screen.getByLabelText('Hours served'), { target: { value: '4' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('4 hrs')).toBeInTheDocument();
  const [, options] = global.fetch.mock.calls.find(([url]) => url.endsWith('/api/registrations/5/complete'));
  expect(options.method).toBe('PUT');
  expect(JSON.parse(options.body)).toEqual({ hours: 4 });
  expect(screen.getByRole('button', { name: 'Edit Hours' })).toBeInTheDocument();
});

test('rejects invalid hours without calling the API', async () => {
  await openApplicants();
  fireEvent.click(screen.getByRole('button', { name: 'Mark Completed' }));
  fireEvent.change(screen.getByLabelText('Hours served'), { target: { value: '0' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByText('Enter hours between 0.25 and 1000.')).toBeInTheDocument();
  expect(global.fetch.mock.calls.some(([url]) => url.endsWith('/complete'))).toBe(false);
});
