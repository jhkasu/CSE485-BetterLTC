import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ChangePasswordForm from './ChangePasswordForm';
import { setSession } from './session';
import { futureExp, makeToken } from './testToken';

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '1', role: 'admin', exp: futureExp() }), { id: 1, firstName: 'Kim', role: 'admin' });
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 204, json: async () => ({}) }));
});

afterEach(() => {
  delete global.fetch;
});

function fill(current, next, confirm = next) {
  fireEvent.change(screen.getByLabelText('Current Password'), { target: { name: 'current', value: current } });
  fireEvent.change(screen.getByLabelText('New Password'), { target: { name: 'newPass', value: next } });
  fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { name: 'confirm', value: confirm } });
  fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));
}

test('sends the change to the shared auth API with the session token', async () => {
  render(<ChangePasswordForm />);
  fill('oldpassword', 'newpassword1');
  expect(await screen.findByText('Password updated successfully!')).toBeInTheDocument();
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/api\/auth\/password$/);
  expect(options.method).toBe('PUT');
  expect(options.headers.Authorization).toMatch(/^Bearer /);
  expect(screen.getByLabelText('Current Password')).toHaveValue('');
});

test('checks the new password before calling the API', () => {
  render(<ChangePasswordForm />);
  fill('oldpassword', 'short');
  expect(screen.getByText('New password must be at least 8 characters.')).toBeInTheDocument();
  fill('oldpassword', 'newpassword1', 'different1');
  expect(screen.getByText('New passwords do not match.')).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});
