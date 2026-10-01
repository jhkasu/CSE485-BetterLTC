import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import DirectoryPage, { directoryQuery } from './DirectoryPage';
import { AccessibilityProvider } from './accessibility/AccessibilityContext';

const orgs = [
  { id: 4, orgName: 'Prairie Care', description: 'We help seniors stay connected.', serviceAreas: ['Regina', 'Saskatoon'], helpTypes: [], categories: ['Seniors Services', 'Health'], website: '', logoVersion: 12 },
  { id: 7, orgName: 'Green Youth', description: '', serviceAreas: ['Regina'], helpTypes: [], categories: ['Youth'], website: '', logoVersion: null },
];

function respond(body) {
  return Promise.resolve({ ok: true, status: 200, json: async () => body });
}

function renderPage() {
  return render(
    <AccessibilityProvider>
      <MemoryRouter>
        <DirectoryPage />
      </MemoryRouter>
    </AccessibilityProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  global.fetch = jest.fn(() => respond(orgs));
});

afterEach(() => {
  delete global.fetch;
});

test('builds the directory query from filters', () => {
  expect(directoryQuery([], [])).toBe('/api/organizations/directory');
  expect(directoryQuery(['Health', 'Youth'], ['Regina'])).toBe('/api/organizations/directory?category=Health&category=Youth&area=Regina');
});

test('lists organizations as cards that link to their profile', async () => {
  renderPage();
  const link = await screen.findByRole('link', { name: 'Prairie Care' });
  expect(link).toHaveAttribute('href', '/organizations/4');
  expect(screen.getByText('2 organizations')).toBeInTheDocument();
  const card = screen.getAllByRole('listitem').find(li => within(li).queryByRole('link', { name: 'Prairie Care' }));
  expect(within(card).getByText("Seniors' Services")).toBeInTheDocument();
  expect(within(card).getByText('Regina, Saskatoon')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View Green Youth profile' })).toHaveAttribute('href', '/organizations/7');
});

test('filters by category through the API', async () => {
  renderPage();
  await screen.findByRole('link', { name: 'Prairie Care' });
  global.fetch.mockImplementation(() => respond([orgs[1]]));
  fireEvent.click(screen.getByRole('button', { name: /Category/ }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Youth' }));
  expect(await screen.findByText('1 organization')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Prairie Care' })).not.toBeInTheDocument();
  expect(global.fetch.mock.calls.at(-1)[0]).toMatch(/\/api\/organizations\/directory\?category=Youth$/);
});

test('says when nothing matches', async () => {
  global.fetch = jest.fn(() => respond([]));
  renderPage();
  expect(await screen.findByText('No organizations are listed yet.')).toBeInTheDocument();
});
