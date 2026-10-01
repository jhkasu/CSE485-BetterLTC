import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import AdminMatchingStatus, { requestNumber } from './AdminMatchingStatus';
import { setSession } from './auth/session';
import { futureExp, makeToken } from './auth/testToken';

const requests = [
  { id: 1, firstName: 'Mary', lastName: 'Smith', email: 'mary@example.test', phone: '306-555-0100', contactMethod: 'Phone', helpType: 'Companionship', city: 'Regina', forFamilyMember: false, seniorName: '', language: 'en', status: 'New', submittedAt: '2026-09-20T12:00:00Z', acceptedAt: null, contactedAt: null, organizationId: null, organizationName: null, alert: 'NoOrganization' },
  { id: 2, firstName: 'John', lastName: 'Brown', email: 'john@example.test', phone: '', contactMethod: 'Email', helpType: 'Transportation', city: 'Saskatoon', forFamilyMember: false, seniorName: '', language: 'en', status: 'Accepted', submittedAt: '2026-09-28T12:00:00Z', acceptedAt: '2026-09-29T12:00:00Z', contactedAt: null, organizationId: 4, organizationName: 'Prairie Care', alert: '' },
  { id: 12, firstName: 'Anne', lastName: 'Lee', email: 'anne@example.test', phone: '', contactMethod: 'Email', helpType: 'Companionship', city: 'Regina', forFamilyMember: false, seniorName: '', language: 'en', status: 'Contacted', submittedAt: '2026-09-25T12:00:00Z', acceptedAt: '2026-09-26T12:00:00Z', contactedAt: '2026-09-27T12:00:00Z', organizationId: 4, organizationName: 'Prairie Care', alert: '' },
];

function respond(body, ok = true) {
  return Promise.resolve({ ok, status: ok ? 200 : 400, json: async () => body });
}

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '1', role: 'admin', exp: futureExp() }), { id: 1, role: 'admin' });
  global.fetch = jest.fn(() => respond(requests));
});

afterEach(() => {
  delete global.fetch;
});

test('formats request numbers', () => {
  expect(requestNumber(1)).toBe('REQ-001');
  expect(requestNumber(1234)).toBe('REQ-1234');
});

test('shows counts per tab and filters by status and attention', async () => {
  render(<AdminMatchingStatus />);
  expect(await screen.findByText('REQ-001')).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'All (3)' })).toBeInTheDocument();
  expect(screen.getByText('No organization after 3 days')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('tab', { name: 'Accepted (1)' }));
  expect(screen.queryByText('REQ-001')).not.toBeInTheDocument();
  expect(screen.getByText('REQ-002')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('tab', { name: 'Needs attention (1)' }));
  expect(screen.getByText('REQ-001')).toBeInTheDocument();
  expect(screen.queryByText('REQ-012')).not.toBeInTheDocument();
});

test('view shows history and releases an accepted request after confirming', async () => {
  render(<AdminMatchingStatus />);
  await screen.findByText('REQ-002');
  const row = screen.getAllByRole('row').find(r => within(r).queryByText('REQ-002'));
  fireEvent.click(within(row).getByRole('button', { name: 'View' }));
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByText('Prairie Care')).toBeInTheDocument();
  expect(within(dialog).getByText(/^Contacted:/)).toBeInTheDocument();

  fireEvent.click(within(dialog).getByRole('button', { name: 'Release' }));
  expect(within(dialog).getByText(/goes back to Waiting/)).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Release' }));
  await screen.findByText('REQ-002');
  const [url, options] = global.fetch.mock.calls.find(([u]) => u.endsWith('/release'));
  expect(url).toMatch(/\/api\/help-requests\/2\/release$/);
  expect(options.method).toBe('PUT');
});

test('a new request has no release button and can be deleted', async () => {
  render(<AdminMatchingStatus />);
  await screen.findByText('REQ-001');
  const row = screen.getAllByRole('row').find(r => within(r).queryByText('REQ-001'));
  fireEvent.click(within(row).getByRole('button', { name: 'View' }));
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByText(/No organization has accepted/)).toBeInTheDocument();
  expect(within(dialog).queryByRole('button', { name: 'Release' })).not.toBeInTheDocument();

  fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
  await screen.findByText('REQ-001');
  const [url, options] = global.fetch.mock.calls.find(([, o]) => o && o.method === 'DELETE');
  expect(url).toMatch(/\/api\/help-requests\/1$/);
  expect(options.method).toBe('DELETE');
});
