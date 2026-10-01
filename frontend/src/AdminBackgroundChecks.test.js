import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import AdminBackgroundChecks from './AdminBackgroundChecks';
import { setSession } from './auth/session';
import { futureExp, makeToken } from './auth/testToken';

const checks = [
  { id: 1, volunteerId: 7, volunteerName: 'Emily Carter', volunteerEmail: 'emily@example.test', status: 'Submitted', fileName: 'emily.pdf', fileSize: 100, submittedAt: '2026-10-01T12:00:00Z', expiresOn: null, expiringSoon: false, rejectionReason: '' },
  { id: 2, volunteerId: 8, volunteerName: 'James Wilson', volunteerEmail: 'james@example.test', status: 'Approved', fileName: 'james.pdf', fileSize: 100, submittedAt: '2026-09-01T12:00:00Z', expiresOn: '2026-10-20', expiringSoon: true, rejectionReason: '' },
];

function respond(body, ok = true) {
  return Promise.resolve({ ok, status: ok ? 200 : 400, json: async () => body });
}

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '1', role: 'admin', exp: futureExp() }), { id: 1, role: 'admin' });
  global.fetch = jest.fn(() => respond(checks));
});

afterEach(() => {
  delete global.fetch;
});

test('lists checks with status and expiring soon flag, and filters by status', async () => {
  render(<AdminBackgroundChecks />);
  expect(await screen.findByText('Emily Carter')).toBeInTheDocument();
  expect(screen.getByText('Expiring soon')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Show'), { target: { value: 'Approved' } });
  expect(screen.queryByText('Emily Carter')).not.toBeInTheDocument();
  expect(screen.getByText('James Wilson')).toBeInTheDocument();
});

test('approves with an expiry date', async () => {
  render(<AdminBackgroundChecks />);
  await screen.findByText('Emily Carter');
  const row = screen.getAllByRole('row').find(r => within(r).queryByText('Emily Carter'));
  fireEvent.click(within(row).getByRole('button', { name: 'Approve' }));
  const dialog = screen.getByRole('dialog');
  fireEvent.change(within(dialog).getByLabelText('Valid until'), { target: { value: '2029-10-01' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Approve' }));
  await screen.findByText('Emily Carter');
  const [url, options] = global.fetch.mock.calls.find(([u]) => u.endsWith('/approve'));
  expect(url).toMatch(/\/api\/background-checks\/1\/approve$/);
  expect(JSON.parse(options.body)).toEqual({ expiresOn: '2029-10-01' });
});

test('rejecting needs a reason', async () => {
  render(<AdminBackgroundChecks />);
  await screen.findByText('Emily Carter');
  const row = screen.getAllByRole('row').find(r => within(r).queryByText('Emily Carter'));
  fireEvent.click(within(row).getByRole('button', { name: 'Reject' }));
  const dialog = screen.getByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Reject' }));
  expect(within(dialog).getByRole('alert')).toHaveTextContent('Please give a reason.');
  expect(global.fetch.mock.calls.some(([u]) => u.endsWith('/reject'))).toBe(false);
});

test('deletes a document after confirming', async () => {
  render(<AdminBackgroundChecks />);
  await screen.findByText('Emily Carter');
  fireEvent.click(screen.getByRole('button', { name: 'Delete document for Emily Carter' }));
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByText(/emily.pdf will be permanently deleted/)).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
  await screen.findByText('Emily Carter');
  const [url, options] = global.fetch.mock.calls.find(([, o]) => o && o.method === 'DELETE');
  expect(url).toMatch(/\/api\/background-checks\/1\/document$/);
  expect(options.method).toBe('DELETE');
});
