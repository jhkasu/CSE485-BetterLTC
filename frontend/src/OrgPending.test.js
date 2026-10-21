import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import OrgPending from './OrgPending';
import { setSession } from './auth/session';
import { futureExp, makeToken } from './auth/testToken';

const base = { id: 3, orgName: 'Care Home', isApproved: false, registryType: 'Charity', registryNumber: '123456789RR0001', rejectionReason: '' };

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '3', role: 'organization', exp: futureExp() }), { id: 3, role: 'organization', isApproved: false });
});

afterEach(() => {
  delete global.fetch;
});

test('a pending organization sees its number and can change it', () => {
  render(<OrgPending org={base} onUpdated={() => {}} onLogout={() => {}} />);
  expect(screen.getByRole('heading', { name: 'Account Pending Approval' })).toBeInTheDocument();
  expect(screen.getByText(/123456789RR0001/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Send for review' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Change registration number' }));
  expect(screen.getByLabelText('Registration number')).toHaveValue('123456789RR0001');
});

test('a rejected organization sees the reason and sends a corrected number', async () => {
  const onUpdated = jest.fn();
  global.fetch = jest.fn((url, options) => Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({ ...base, ...JSON.parse(options.body), rejectionReason: '' }),
  }));
  const { rerender } = render(<OrgPending org={{ ...base, rejectionReason: 'The number belongs to another charity.' }} onUpdated={onUpdated} onLogout={() => {}} />);
  expect(screen.getByRole('heading', { name: 'Your Organization Needs Another Look' })).toBeInTheDocument();
  expect(screen.getByText('The number belongs to another charity.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('radio', { name: 'Non-profit corporation' }));
  fireEvent.change(screen.getByLabelText('Registration number'), { target: { value: '12-34' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send for review' }));
  expect(screen.getByRole('alert')).toHaveTextContent('6 to 10 digits');
  expect(global.fetch).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Registration number'), { target: { value: '101 234 567' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send for review' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Sent for review.');
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/api\/organizations\/3\/registry$/);
  expect(options.method).toBe('PUT');
  expect(JSON.parse(options.body)).toEqual({ registryType: 'Nonprofit', registryNumber: '101234567' });
  const saved = onUpdated.mock.calls[0][0];
  rerender(<OrgPending org={saved} onUpdated={onUpdated} onLogout={() => {}} />);
  expect(screen.getByRole('heading', { name: 'Account Pending Approval' })).toBeInTheDocument();
});

test('an organization without a number is asked to add one', () => {
  render(<OrgPending org={{ ...base, registryType: '', registryNumber: '' }} onUpdated={() => {}} onLogout={() => {}} />);
  expect(screen.getByText('Add your registration number so we can review your organization.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Send for review' })).toBeInTheDocument();
});
