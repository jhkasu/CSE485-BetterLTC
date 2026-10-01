import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import VolunteerList from './VolunteerList';
import { setSession } from './auth/session';
import { futureExp, makeToken } from './auth/testToken';

const listings = [
  { id: 1, listingTitle: 'Garden Club', location: 'Saskatoon', days: 'Friday', status: 'Is Ongoing', category: 'Other', orgName: 'Care Home' },
  { id: 2, listingTitle: 'Reading Buddies', location: 'Regina', days: 'Tuesday, Thursday', status: 'Is Ongoing', category: 'Senior Care Support', orgName: 'Care Home' },
];

const matches = [
  { listingId: 1, match: { score: 0, sameCity: false, interestMatch: false, matchingDays: [], sharedLanguages: [] } },
  { listingId: 2, match: { score: 100, sameCity: true, interestMatch: true, matchingDays: ['Tuesday', 'Thursday'], sharedLanguages: [] } },
];

function respond(body) {
  return Promise.resolve({ ok: true, status: 200, json: async () => body });
}

function renderList() {
  return render(<MemoryRouter><VolunteerList /></MemoryRouter>);
}

afterEach(() => {
  delete global.fetch;
  window.localStorage.clear();
});

test('ranks listings by match for a volunteer and explains why', async () => {
  setSession(makeToken({ sub: '7', role: 'volunteer', exp: futureExp() }), { id: 7, role: 'volunteer' });
  global.fetch = jest.fn(url => respond(url.endsWith('/matches') ? matches : listings));
  renderList();
  const panel = await screen.findByRole('complementary', { name: '100% match' });
  expect(within(panel).getByText('Great match')).toBeInTheDocument();
  expect(within(panel).getAllByRole('listitem').map(li => li.textContent.trim())).toEqual([
    'Same city', 'Available Tue, Thu', 'Matches your interests',
  ]);
  expect(screen.getByRole('complementary', { name: '0% match' })).toBeInTheDocument();
  const titles = screen.getAllByRole('heading', { level: 4 }).map(h => h.textContent);
  expect(titles).toEqual(['Reading Buddies', 'Garden Club']);
  fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'newest' } });
  expect(screen.getAllByRole('heading', { level: 4 }).map(h => h.textContent)).toEqual(['Garden Club', 'Reading Buddies']);
});

test('shows no match scores to visitors who are not signed in', async () => {
  global.fetch = jest.fn(() => respond(listings));
  renderList();
  expect(await screen.findByText('Garden Club')).toBeInTheDocument();
  expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  expect(global.fetch.mock.calls.some(([url]) => url.endsWith('/matches'))).toBe(false);
});

test('asks a volunteer without a profile to set it up', async () => {
  setSession(makeToken({ sub: '7', role: 'volunteer', exp: futureExp() }), { id: 7, role: 'volunteer' });
  global.fetch = jest.fn(url => respond(url.endsWith('/matches') ? [] : listings));
  renderList();
  expect(await screen.findByText(/set up your profile to see how well/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Set up profile' })).toHaveAttribute('href', '/dashboard');
});

test('filter chips narrow the list and can be cleared', async () => {
  global.fetch = jest.fn(() => respond(listings));
  renderList();
  expect(await screen.findByText('2 opportunities')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Area' }));
  fireEvent.click(within(screen.getByRole('group', { name: 'Area' })).getByRole('checkbox', { name: 'Regina' }));
  expect(screen.getByText('1 opportunity')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Garden Club' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /type of help/i }));
  fireEvent.click(within(screen.getByRole('group', { name: 'Type of help' })).getByRole('checkbox', { name: 'Meal Assistance' }));
  expect(screen.getByText('No opportunities found.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
  expect(screen.getByText('2 opportunities')).toBeInTheDocument();
});
