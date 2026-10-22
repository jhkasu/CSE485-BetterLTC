import React from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import ForgotPasswordPage from './ForgotPasswordPage';
import ResetPasswordPage from './ResetPasswordPage';
import { AccessibilityProvider } from './accessibility/AccessibilityContext';

function SigninProbe() {
  const location = useLocation();
  return <p>Sign in page: {location.state?.success}</p>;
}

function renderAt(path) {
  return render(
    <AccessibilityProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/signin" element={<SigninProbe />} />
        </Routes>
      </MemoryRouter>
    </AccessibilityProvider>,
  );
}

function respond(status) {
  return Promise.resolve({ ok: status < 400, status, json: async () => ({}) });
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  delete global.fetch;
});

test('asks for an email and shows the same message whether or not the account exists', async () => {
  global.fetch = jest.fn(() => respond(204));
  renderAt('/forgot-password');
  fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address.');
  expect(global.fetch).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: ' amy@example.test ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
  expect(await screen.findByRole('status')).toHaveTextContent('If an account uses amy@example.test, we sent it a link');
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/api\/auth\/forgot-password$/);
  expect(JSON.parse(options.body)).toEqual(expect.objectContaining({ email: 'amy@example.test' }));
});

test('sets a new password from the link and returns to sign in', async () => {
  global.fetch = jest.fn(() => respond(204));
  renderAt('/reset-password?token=abc123');
  fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'short' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save new password' }));
  expect(screen.getByRole('alert')).toHaveTextContent('at least 8 characters');
  fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewPass123' } });
  fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'NewPass124' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save new password' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match.');
  fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'NewPass123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save new password' }));
  expect(await screen.findByText(/Sign in page: reset.done/)).toBeInTheDocument();
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ token: 'abc123', newPassword: 'NewPass123' });
});

test('explains an expired or used link', async () => {
  global.fetch = jest.fn(() => respond(400));
  renderAt('/reset-password?token=old');
  fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewPass123' } });
  fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'NewPass123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save new password' }));
  expect(await screen.findByText(/This link is invalid or has expired/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Request a new link' })).toHaveAttribute('href', '/forgot-password');
});

test('a link without a token is treated as invalid', () => {
  global.fetch = jest.fn();
  renderAt('/reset-password');
  expect(screen.getByText(/This link is invalid or has expired/)).toBeInTheDocument();
});
