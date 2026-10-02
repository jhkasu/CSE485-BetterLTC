import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import AdminStatistics, { niceMax } from './AdminStatistics';
import PageViewTracker, { isTrackedPath } from './PageViewTracker';
import { setSession } from './auth/session';
import { futureExp, makeToken } from './auth/testToken';

const summary = {
  days: 7,
  totalViews: 42,
  totalDownloads: 5,
  daily: [
    { date: '2026-09-26', count: 2 }, { date: '2026-09-27', count: 0 }, { date: '2026-09-28', count: 10 },
    { date: '2026-09-29', count: 8 }, { date: '2026-09-30', count: 6 }, { date: '2026-10-01', count: 9 }, { date: '2026-10-02', count: 7 },
  ],
  topPages: [{ path: '/', count: 20 }, { path: '/resources', count: 12 }],
  topOrganizations: [{ id: 4, name: 'Prairie Care', count: 6 }],
  topResources: [],
};

function respond(body, ok = true) {
  return Promise.resolve({ ok, status: ok ? 200 : 400, json: async () => body });
}

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '1', role: 'admin', exp: futureExp() }), { id: 1, role: 'admin' });
  global.fetch = jest.fn(() => respond(summary));
});

afterEach(() => {
  delete global.fetch;
});

test('rounds the chart scale and skips private pages', () => {
  expect(niceMax(3)).toBe(5);
  expect(niceMax(10)).toBe(10);
  expect(niceMax(42)).toBe(50);
  expect(niceMax(130)).toBe(200);
  expect(isTrackedPath('/resources')).toBe(true);
  expect(isTrackedPath('/admin')).toBe(false);
  expect(isTrackedPath('/org-dashboard')).toBe(false);
});

test('shows totals, top lists with page names, and a table view', async () => {
  render(<AdminStatistics />);
  await screen.findByText('42');
  expect(screen.getByRole('group', { name: 'Page visits' })).toHaveTextContent('42');
  expect(screen.getByRole('group', { name: 'Visits per day' })).toHaveTextContent('6');
  expect(screen.getByRole('group', { name: 'Resource downloads' })).toHaveTextContent('5');
  const pages = screen.getByRole('region', { name: 'Most visited pages' });
  expect(within(pages).getByText('Home')).toBeInTheDocument();
  expect(within(pages).getByText('Resources')).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Most viewed organization profiles' })).toHaveTextContent('Prairie Care');
  expect(screen.getByRole('region', { name: 'Most downloaded resources' })).toHaveTextContent('No visits recorded yet.');
  expect(screen.getByRole('img', { name: /last 7 days, 42 visits/ })).toBeInTheDocument();
  expect(screen.getAllByRole('row')).toHaveLength(8);
});

test('switches the date range', async () => {
  render(<AdminStatistics />);
  await screen.findByText('42');
  expect(global.fetch.mock.calls[0][0]).toMatch(/\/api\/statistics\/summary\?days=30$/);
  fireEvent.click(screen.getByRole('button', { name: 'Last 7 days' }));
  expect(screen.getByRole('button', { name: 'Last 7 days' })).toHaveAttribute('aria-pressed', 'true');
  await screen.findByText('42');
  expect(global.fetch.mock.calls.at(-1)[0]).toMatch(/days=7$/);
});

test('records public page views only', () => {
  const { unmount } = render(<MemoryRouter initialEntries={['/faq']}><PageViewTracker /></MemoryRouter>);
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/api\/statistics\/views$/);
  expect(JSON.parse(options.body)).toEqual({ path: '/faq' });
  unmount();
  render(<MemoryRouter initialEntries={['/faq']}><PageViewTracker /></MemoryRouter>);
  expect(global.fetch).toHaveBeenCalledTimes(1);
  global.fetch.mockClear();
  render(<MemoryRouter initialEntries={['/admin']}><PageViewTracker /></MemoryRouter>);
  expect(global.fetch).not.toHaveBeenCalled();
});
