import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import i18n from './i18n';
import SignupForm from './SignupForm';

function renderSignup() {
  return render(
    <MemoryRouter initialEntries={['/signup']}>
      <Routes>
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/signin" element={<p>Sign in page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

function fill(placeholder, value) {
  fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value, name: screen.getByPlaceholderText(placeholder).name } });
}

function fillForm(email) {
  fill(i18n.t('auth.placeholders.firstName'), 'Amy');
  fill(i18n.t('auth.placeholders.lastName'), 'Lee');
  fill(i18n.t('auth.placeholders.email'), email);
  fill(i18n.t('auth.placeholders.password'), 'AmyPass123');
  fill(i18n.t('auth.placeholders.confirmPassword'), 'AmyPass123');
}

function conflict() {
  return { ok: false, status: 409, text: async () => 'This email is already registered.' };
}

beforeEach(async () => {
  global.fetch = jest.fn();
  await act(() => i18n.changeLanguage('en'));
});

afterEach(async () => {
  delete global.fetch;
  await act(() => i18n.changeLanguage('en'));
});

test('a volunteer email that is already registered shows the message', async () => {
  global.fetch.mockResolvedValue(conflict());
  renderSignup();
  fillForm('amy@example.test');
  fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
  expect(await screen.findByText('This email is already registered.')).toBeInTheDocument();
  expect(global.fetch.mock.calls[0][0]).toMatch(/\/api\/volunteers$/);
});

test('an organization email that is already registered shows the message', async () => {
  global.fetch.mockResolvedValue(conflict());
  renderSignup();
  fireEvent.click(screen.getByRole('button', { name: /i represent an organization/i }));
  fill(i18n.t('auth.placeholders.orgName'), 'Prairie Care');
  fillForm('amy@example.test');
  fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
  expect(await screen.findByText('This email is already registered.')).toBeInTheDocument();
  expect(global.fetch.mock.calls[0][0]).toMatch(/\/api\/organizations$/);
});

test('the message follows the page language', async () => {
  global.fetch.mockResolvedValue(conflict());
  await act(() => i18n.changeLanguage('fr'));
  renderSignup();
  fillForm('amy@example.test');
  fireEvent.click(screen.getByRole('button', { name: /^s'inscrire$/i }));
  expect(await screen.findByText('Ce courriel est déjà enregistré.')).toBeInTheDocument();
});

test('extra spaces around the email are removed before signing up', async () => {
  global.fetch.mockResolvedValue({ ok: true, status: 200, text: async () => '' });
  renderSignup();
  fillForm('  Amy@Example.TEST  ');
  fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
  expect(await screen.findByText('Sign in page')).toBeInTheDocument();
  expect(JSON.parse(global.fetch.mock.calls[0][1].body).email).toBe('Amy@Example.TEST');
});
