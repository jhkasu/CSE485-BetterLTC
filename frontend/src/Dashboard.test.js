import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import Dashboard from './Dashboard';
import { setSession } from './auth/session';
import { AccessibilityProvider } from './accessibility/AccessibilityContext';
import { futureExp, makeToken } from './auth/testToken';

const volunteer = {
  id: 7,
  firstName: 'Ana',
  lastName: 'Lee',
  email: 'ana@example.test',
  phone: '306-555-0100',
  address: '1 Main St',
  backgroundCheckApproved: true,
};

const registrations = [
  { id: 1, listingId: 10, listingTitle: 'Reading Buddies', orgName: 'Care Home', registeredAt: '2026-09-01', status: 'Approved', hoursServed: null, completedAt: '', location: 'Saskatoon', days: 'Monday, Wednesday', startDate: '2026-10-05', endDate: '2026-12-15' },
  { id: 2, listingId: 11, listingTitle: 'Garden Day', orgName: 'Care Home', registeredAt: '2026-08-01', status: 'Completed', hoursServed: 3.5, completedAt: '2026-08-20', location: 'Regina', days: '', startDate: '', endDate: '' },
  { id: 3, listingId: 12, listingTitle: 'Music Hour', orgName: 'Sunset Lodge', registeredAt: '2026-07-01', status: 'Completed', hoursServed: 2, completedAt: '2026-07-15', location: 'Saskatoon', days: '', startDate: '', endDate: '' },
  { id: 4, listingId: 13, listingTitle: 'Bingo Night', orgName: 'Sunset Lodge', registeredAt: '2026-09-10', status: 'Pending', hoursServed: null, completedAt: '', location: 'Saskatoon', days: '', startDate: '', endDate: '' },
];

function respond(body, ok = true) {
  return Promise.resolve({ ok, status: ok ? 200 : 500, json: async () => body });
}

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '7', role: 'volunteer', exp: futureExp() }), { id: 7, firstName: 'Ana', lastName: 'Lee', email: 'ana@example.test', role: 'volunteer' });
  global.fetch = jest.fn((url, options = {}) => {
    if (url.endsWith('/api/registrations/volunteer/7')) return respond(registrations);
    if (url.endsWith('/api/volunteers/7') && options.method === 'PUT') {
      return respond({ ...volunteer, ...JSON.parse(options.body) });
    }
    if (url.endsWith('/api/volunteers/7')) return respond(volunteer);
    return respond({}, false);
  });
});

afterEach(() => {
  delete global.fetch;
});

function renderDashboard() {
  return render(
    <AccessibilityProvider>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </AccessibilityProvider>
  );
}

function openSection(name) {
  fireEvent.click(screen.getByText(name));
}

test('shows approved registrations as upcoming shifts with their schedule', async () => {
  renderDashboard();
  openSection('Upcoming Shifts');
  const main = screen.getByRole('main');
  await within(main).findByText('Reading Buddies');
  expect(within(main).getByText('Reading Buddies')).toBeInTheDocument();
  expect(within(main).getByText(/2026-10-05 – 2026-12-15 · Monday, Wednesday/)).toBeInTheDocument();
  expect(within(main).queryByText('Garden Day')).not.toBeInTheDocument();
  expect(within(main).queryByText('Bingo Night')).not.toBeInTheDocument();
});

test('shows completed registrations as history with total hours', async () => {
  renderDashboard();
  openSection('Volunteer History');
  const main = screen.getByRole('main');
  await within(main).findByText('Garden Day');
  expect(within(main).getByText('Garden Day')).toBeInTheDocument();
  expect(within(main).getByText('Music Hour')).toBeInTheDocument();
  expect(within(main).getByText('3.5 hrs')).toBeInTheDocument();
  expect(within(main).getByText('5.5')).toBeInTheDocument();
  expect(within(main).queryByText('Reading Buddies')).not.toBeInTheDocument();
});

test('loads the profile from the API and saves edits through it', async () => {
  renderDashboard();
  openSection('Profile Settings');
  const phone = await screen.findByDisplayValue('306-555-0100');
  fireEvent.change(phone, { target: { name: 'phone', value: '306-555-0199' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  expect(await screen.findByText('Saved!')).toBeInTheDocument();
  const [, options] = global.fetch.mock.calls.find(([url, o]) => url.endsWith('/api/volunteers/7') && o && o.method === 'PUT');
  expect(JSON.parse(options.body)).toEqual({ firstName: 'Ana', lastName: 'Lee', phone: '306-555-0199', address: '1 Main St' });
});

test('shows an error when saving the profile fails', async () => {
  global.fetch.mockImplementation((url, options = {}) => {
    if (url.endsWith('/api/registrations/volunteer/7')) return respond([]);
    if (options.method === 'PUT') return respond({}, false);
    return respond(volunteer);
  });
  renderDashboard();
  openSection('Profile Settings');
  await screen.findByDisplayValue('306-555-0100');
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  expect(await screen.findByText('Could not save your changes. Please try again.')).toBeInTheDocument();
  expect(screen.queryByText('Saved!')).not.toBeInTheDocument();
});

function fillPasswordForm(current, next) {
  fireEvent.change(screen.getByPlaceholderText('Enter current password'), { target: { name: 'current', value: current } });
  fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { target: { name: 'newPass', value: next } });
  fireEvent.change(screen.getByPlaceholderText('Re-enter new password'), { target: { name: 'confirm', value: next } });
  fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));
}

test('changes the password through the API', async () => {
  global.fetch.mockImplementation((url, options = {}) => {
    if (url.endsWith('/api/auth/password')) return Promise.resolve({ ok: true, status: 204, json: async () => ({}) });
    if (url.endsWith('/api/registrations/volunteer/7')) return respond([]);
    return respond(volunteer);
  });
  renderDashboard();
  openSection('Profile Settings');
  fillPasswordForm('oldpassword', 'newpassword1');
  expect(await screen.findByText('Password updated successfully!')).toBeInTheDocument();
  const [, options] = global.fetch.mock.calls.find(([url]) => url.endsWith('/api/auth/password'));
  expect(options.method).toBe('PUT');
  expect(JSON.parse(options.body)).toEqual({ currentPassword: 'oldpassword', newPassword: 'newpassword1' });
});

test('shows an error when the current password is wrong', async () => {
  global.fetch.mockImplementation((url) => {
    if (url.endsWith('/api/auth/password')) return Promise.resolve({ ok: false, status: 400, json: async () => ({}) });
    if (url.endsWith('/api/registrations/volunteer/7')) return respond([]);
    return respond(volunteer);
  });
  renderDashboard();
  openSection('Profile Settings');
  fillPasswordForm('wrongpassword', 'newpassword1');
  expect(await screen.findByText('Your current password is incorrect.')).toBeInTheDocument();
  expect(screen.queryByText('Password updated successfully!')).not.toBeInTheDocument();
});

test('reminds the volunteer to finish the profile setup and opens it', async () => {
  renderDashboard();
  fireEvent.click(await screen.findByRole('button', { name: 'Set up profile' }));
  expect(await screen.findByLabelText(/location/i)).toBeInTheDocument();
});
