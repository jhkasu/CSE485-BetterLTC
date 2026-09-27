import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import SigninForm from './SigninForm';
import { getCurrentUser, getSessionRole } from './auth/session';
import { futureExp, makeToken } from './auth/testToken';

function renderAt(path = '/signin') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/signin" element={<SigninForm />} />
        <Route path="/admin" element={<p>Admin page</p>} />
        <Route path="/dashboard" element={<p>Volunteer page</p>} />
        <Route path="/org-dashboard" element={<p>Organization page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

function fillAndSubmit(email, password) {
  fireEvent.change(screen.getByPlaceholderText(/enter your email/i), { target: { name: 'email', value: email } });
  fireEvent.change(screen.getByPlaceholderText(/enter your password/i), { target: { name: 'password', value: password } });
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
}

beforeEach(() => {
  window.localStorage.clear();
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

test('signs in through the auth API and routes by role', async () => {
  const token = makeToken({ sub: '0', role: 'admin', exp: futureExp() });
  global.fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ token, user: { id: 0, firstName: 'Kim', role: 'admin' } }),
  });
  renderAt();
  fillAndSubmit('kim@test.com', 'password123');
  expect(await screen.findByText('Admin page')).toBeInTheDocument();
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/api\/auth\/signin$/);
  expect(JSON.parse(options.body)).toEqual({ email: 'kim@test.com', password: 'password123' });
  expect(getSessionRole()).toBe('admin');
  expect(getCurrentUser().firstName).toBe('Kim');
});

test('shows invalid credentials on 401', async () => {
  global.fetch.mockResolvedValue({ ok: false, status: 401 });
  renderAt();
  fillAndSubmit('someone@example.test', 'wrongpass1');
  expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  expect(getSessionRole()).toBeNull();
});

test('shows a server error when the API cannot be reached', async () => {
  global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
  renderAt();
  fillAndSubmit('someone@example.test', 'Password123');
  expect(await screen.findByText(/unable to reach the server/i)).toBeInTheDocument();
});

test('explains why the user was sent back to sign in', () => {
  renderAt('/signin?expired=1');
  expect(screen.getByText(/your session has expired/i)).toBeInTheDocument();
});
