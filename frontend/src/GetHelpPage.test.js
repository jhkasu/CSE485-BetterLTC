import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import GetHelpPage from './GetHelpPage';
import { AccessibilityProvider } from './accessibility/AccessibilityContext';

beforeEach(() => {
  window.localStorage.clear();
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: async () => ({ id: 1, status: 'New', emailSent: false }) }));
});

afterEach(() => {
  delete global.fetch;
});

function renderPage() {
  return render(
    <AccessibilityProvider>
      <MemoryRouter>
        <GetHelpPage />
      </MemoryRouter>
    </AccessibilityProvider>
  );
}

function choose(label, value) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function fillBasics(method) {
  choose(/type of help needed/i, 'Transportation Support');
  choose(/your area \/ city/i, 'Regina');
  choose(/preferred contact method/i, method);
  fireEvent.change(screen.getByLabelText(/first name/i), { target: { name: 'firstName', value: 'Rose' } });
  fireEvent.change(screen.getByLabelText(/last name/i), { target: { name: 'lastName', value: 'Tremblay' } });
}

test('asks for a phone number only when phone is the contact method', () => {
  renderPage();
  expect(screen.queryByLabelText(/phone number/i)).not.toBeInTheDocument();
  choose(/preferred contact method/i, 'Phone');
  expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
  expect(screen.queryByLabelText(/email address/i)).not.toBeInTheDocument();
  choose(/preferred contact method/i, 'Email');
  expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  expect(screen.queryByLabelText(/phone number/i)).not.toBeInTheDocument();
});

test('does not send the request without consent', () => {
  renderPage();
  fillBasics('Phone');
  fireEvent.change(screen.getByLabelText(/phone number/i), { target: { name: 'phone', value: '3065550123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit request' }));
  expect(screen.getByRole('alert')).toHaveTextContent(/agree to share your information/i);
  expect(global.fetch).not.toHaveBeenCalled();
});

test('sends a family member request with the senior name and only the chosen contact', async () => {
  renderPage();
  fillBasics('Phone');
  fireEvent.change(screen.getByLabelText(/phone number/i), { target: { name: 'phone', value: '3065550123' } });
  fireEvent.click(screen.getByLabelText(/on behalf of a senior/i));
  fireEvent.change(screen.getByLabelText(/senior's full name/i), { target: { name: 'seniorName', value: 'Marie Tremblay' } });
  fireEvent.click(screen.getByLabelText(/i agree to share my information/i));
  fireEvent.click(screen.getByRole('button', { name: 'Submit request' }));
  expect(await screen.findByText('Your request has been submitted!')).toBeInTheDocument();
  expect(screen.getByText('They will call you at (306) 555-0123.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/');
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/api\/help-requests$/);
  expect(JSON.parse(options.body)).toEqual({
    helpType: 'Transportation Support',
    city: 'Regina',
    contactMethod: 'Phone',
    firstName: 'Rose',
    lastName: 'Tremblay',
    phone: '(306) 555-0123',
    email: '',
    forFamilyMember: true,
    seniorName: 'Marie Tremblay',
    consentGiven: true,
    language: 'en',
  });
});

test('confirms the email when the request is sent by email', async () => {
  global.fetch.mockImplementation(() => Promise.resolve({ ok: true, status: 200, json: async () => ({ id: 2, status: 'New', emailSent: true }) }));
  renderPage();
  fillBasics('Email');
  fireEvent.change(screen.getByLabelText(/email address/i), { target: { name: 'email', value: 'rose@example.test' } });
  fireEvent.click(screen.getByLabelText(/i agree to share my information/i));
  fireEvent.click(screen.getByRole('button', { name: 'Submit request' }));
  expect(await screen.findByText('We sent a confirmation email to rose@example.test.')).toBeInTheDocument();
  expect(JSON.parse(global.fetch.mock.calls[0][1].body).phone).toBe('');
});
