import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import OrgRoles, { MAX_ROLES } from './OrgRoles';
import { setSession } from './auth/session';
import { futureExp, makeToken } from './auth/testToken';

function respond(body, ok = true) {
  return Promise.resolve({ ok, status: ok ? 200 : 500, json: async () => body });
}

const visitor = { id: 11, title: 'Friendly visitor', timeCommitment: '2 hours a week', description: 'Visit a senior at home.' };

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '3', role: 'organization', exp: futureExp() }), { id: 3, role: 'organization' });
});

afterEach(() => {
  delete global.fetch;
});

test('adds a role', async () => {
  global.fetch = jest.fn((url, options) => {
    if (options?.method === 'POST') return respond({ id: 12, ...JSON.parse(options.body) });
    return respond([]);
  });
  render(<OrgRoles orgId={3} />);
  expect(await screen.findByText("You haven't listed any roles yet.")).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Add a role' }));
  expect(screen.getByLabelText(/Role title/)).toHaveFocus();
  fireEvent.click(screen.getByRole('button', { name: 'Save role' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Please enter a role title.');
  fireEvent.change(screen.getByLabelText(/Role title/), { target: { value: 'Event helper' } });
  fireEvent.change(screen.getByLabelText('Time needed'), { target: { value: 'Once a month' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save role' }));
  expect(await screen.findByRole('heading', { name: 'Event helper' })).toBeInTheDocument();
  const [url, options] = global.fetch.mock.calls[1];
  expect(url).toMatch(/\/api\/organizations\/3\/roles$/);
  expect(JSON.parse(options.body)).toEqual({ title: 'Event helper', timeCommitment: 'Once a month', description: '' });
});

test('edits and deletes a role', async () => {
  global.fetch = jest.fn((url, options) => {
    if (options?.method === 'PUT') return respond({ id: 11, ...JSON.parse(options.body) });
    if (options?.method === 'DELETE') return Promise.resolve({ ok: true, status: 204 });
    return respond([visitor]);
  });
  render(<OrgRoles orgId={3} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Edit Friendly visitor' }));
  expect(screen.getByLabelText(/Role title/)).toHaveValue('Friendly visitor');
  fireEvent.change(screen.getByLabelText(/Role title/), { target: { value: 'Home visitor' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save role' }));
  expect(await screen.findByRole('heading', { name: 'Home visitor' })).toBeInTheDocument();
  expect(global.fetch.mock.calls[1][0]).toMatch(/\/api\/organizations\/3\/roles\/11$/);

  fireEvent.click(screen.getByRole('button', { name: 'Delete Home visitor' }));
  const item = screen.getByRole('listitem');
  expect(within(item).getByText('Delete this role?')).toBeInTheDocument();
  fireEvent.click(within(item).getByRole('button', { name: 'Delete' }));
  expect(await screen.findByText("You haven't listed any roles yet.")).toBeInTheDocument();
  expect(global.fetch.mock.calls[2][1].method).toBe('DELETE');
});

test('hides the add button at the role limit', async () => {
  const many = Array.from({ length: MAX_ROLES }, (_, i) => ({ id: i + 1, title: `Role ${i + 1}`, timeCommitment: '', description: '' }));
  global.fetch = jest.fn(() => respond(many));
  render(<OrgRoles orgId={3} />);
  expect(await screen.findByText(`You can list up to ${MAX_ROLES} roles.`)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Add a role' })).not.toBeInTheDocument();
});
