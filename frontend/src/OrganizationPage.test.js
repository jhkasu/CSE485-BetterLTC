import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import OrganizationPage, { logoUrl, websiteHost } from './OrganizationPage';
import { AccessibilityProvider } from './accessibility/AccessibilityContext';
import { setSession } from './auth/session';
import { futureExp, makeToken } from './auth/testToken';

const org = {
  id: 4, orgName: 'Prairie Care', description: 'We help seniors stay connected.',
  serviceAreas: ['Regina', 'Saskatoon'],
  website: 'https://www.prairiecare.org', logoVersion: 99,
};

function respond(body, ok = true) {
  return Promise.resolve({ ok, status: ok ? 200 : 404, json: async () => body });
}

const roles = [
  { id: 11, title: 'Friendly visitor', timeCommitment: '2 hours a week', description: 'Visit a senior at home.' },
  { id: 12, title: 'Event helper', timeCommitment: '', description: '' },
];

function renderPage(publicResponse, { roleList = [], interest = () => respond({}) } = {}) {
  global.fetch = jest.fn((url, options) => {
    if (url.endsWith('/roles')) return respond(roleList);
    if (url.endsWith('/interest')) return interest(url, options);
    return publicResponse;
  });
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

test('lists roles and sends interest for the chosen role', async () => {
  const interest = jest.fn(() => respond({}));
  renderPage(respond(org), { roleList: roles, interest });
  expect(await screen.findByRole('heading', { name: 'Volunteer Roles' })).toBeInTheDocument();
  expect(screen.getByText('2 hours a week')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: "I'm interested in Event helper" }));
  expect(screen.getByLabelText('Role')).toHaveValue('12');
  fireEvent.change(screen.getByLabelText(/Your name/), { target: { value: 'Ana Lee' } });
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'ana@example.test' } });
  fireEvent.change(screen.getByLabelText('Message (optional)'), { target: { value: 'Weekends work best.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Please agree to share your details.');
  expect(interest).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('checkbox', { name: /share these details with Prairie Care/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  expect(await screen.findByText('Message sent!')).toBeInTheDocument();
  const [url, options] = interest.mock.calls[0];
  expect(url).toMatch(/\/api\/organizations\/4\/interest$/);
  expect(JSON.parse(options.body)).toEqual(expect.objectContaining({
    name: 'Ana Lee',
    email: 'ana@example.test',
    roleId: 12,
    message: 'Weekends work best.',
    consentGiven: true,
    website: '',
  }));
});

test('shows the form without a role choice when there are no roles', async () => {
  renderPage(respond(org));
  expect(await screen.findByRole('heading', { name: 'Interested in volunteering here?' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Volunteer Roles' })).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Role')).not.toBeInTheDocument();
});

test('fills in a signed-in volunteer and explains when sending fails', async () => {
  setSession(makeToken({ sub: '5', role: 'volunteer', exp: futureExp() }), { id: 5, role: 'volunteer', firstName: 'Ana', lastName: 'Lee', email: 'ana@example.test', phone: '306-555-0100' });
  renderPage(respond(org), { interest: () => Promise.resolve({ ok: false, status: 503, json: async () => ({}) }) });
  expect(await screen.findByLabelText(/Your name/)).toHaveValue('Ana Lee');
  expect(screen.getByLabelText(/^Email/)).toHaveValue('ana@example.test');
  expect(screen.getByLabelText('Phone (optional)')).toHaveValue('306-555-0100');
  fireEvent.click(screen.getByRole('checkbox', { name: /share these details/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Send' }));
  expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't send your message right now.");
});
