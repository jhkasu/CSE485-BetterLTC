import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import VerifyEmailPage from './VerifyEmailPage';
import { AccessibilityProvider } from './accessibility/AccessibilityContext';

function renderAt(path) {
  return render(
    <AccessibilityProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Routes>
      </MemoryRouter>
    </AccessibilityProvider>,
  );
}

afterEach(() => {
  delete global.fetch;
});

test('confirms the email with the token from the link', async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 204 }));
  renderAt('/verify-email?token=abc123');
  expect(await screen.findByText(/your email is confirmed/i)).toBeInTheDocument();
  expect(screen.getByRole('status')).toContainElement(screen.getAllByRole('link', { name: /sign in/i }).find(link => link.classList.contains('reset-again')));
  expect(global.fetch).toHaveBeenCalledTimes(1);
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/api\/auth\/verify-email$/);
  expect(JSON.parse(options.body)).toEqual({ token: 'abc123' });
});

test('explains an expired or used link', async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 400 }));
  renderAt('/verify-email?token=old');
  expect(await screen.findByText(/invalid or has expired/i)).toBeInTheDocument();
});

test('treats a link without a token as invalid without calling the API', () => {
  global.fetch = jest.fn();
  renderAt('/verify-email');
  expect(screen.getByText(/invalid or has expired/i)).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});
