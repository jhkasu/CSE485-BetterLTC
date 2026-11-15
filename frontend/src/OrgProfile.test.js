import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import OrgProfile, { isValidWebsite, normalizeWebsite } from './OrgProfile';
import { setSession } from './auth/session';
import { futureExp, makeToken } from './auth/testToken';

const SIXTY_WORDS = Array.from({ length: 60 }, (_, i) => `word${i}`).join(' ');

const org = {
  id: 3, orgName: 'Care Home', legalName: 'Care Home Society Inc.', contactName: 'Bo', email: 'org@example.test', isApproved: true,
  orgType: 'Registered Charity', geographicScope: ['Local Community'], serviceAreas: ['Regina'],
  streetAddress: '1 Main St', city: 'Regina', province: 'Saskatchewan', postalCode: 'S4P 1A1',
  website: 'https://care.org', shortDescription: SIXTY_WORDS, description: '',
  categories: ['Seniors and Healthy Aging'], populationsServed: ['Seniors'], notificationEmail: '',
  representativeName: 'Bo', consentedAt: '2026-11-01T12:00:00Z',
};

function renderProfile(onSaved = () => {}, value = org) {
  return render(<MemoryRouter><OrgProfile org={value} onSaved={onSaved} /></MemoryRouter>);
}

function okFetch() {
  return jest.fn((url, options) => Promise.resolve({ ok: true, status: 200, json: async () => ({ ...org, ...JSON.parse(options.body) }) }));
}

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '3', role: 'organization', exp: futureExp() }), { id: 3, orgName: 'Care Home', isApproved: true, role: 'organization' });
});

afterEach(() => {
  delete global.fetch;
});

test('shows the form in the sections of the sponsor questionnaire', () => {
  global.fetch = jest.fn();
  renderProfile();
  ['Organization Identification', 'About Your Organization', 'Areas of Focus and Populations Served', 'Profile Management and Administration', 'Authorization and Consent']
    .forEach(name => expect(screen.getByRole('heading', { name: new RegExp(name) })).toBeInTheDocument());
  expect(screen.getByLabelText(/legal name of organization/i)).toHaveValue('Care Home Society Inc.');
  expect(screen.getByLabelText(/public or operating name/i)).toHaveValue('Care Home');
  expect(screen.getByRole('radio', { name: 'Registered Charity' })).toBeChecked();
});

test('saves the profile with the sponsor questionnaire fields', async () => {
  global.fetch = okFetch();
  const onSaved = jest.fn();
  renderProfile(onSaved);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Saskatoon' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Food Security' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Families' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Cree' }));
  fireEvent.change(screen.getByLabelText(/which services are available/i), { target: { value: 'Home visits' } });
  fireEvent.change(screen.getByLabelText(/year established/i), { target: { value: '1998' } });
  fireEvent.change(screen.getByLabelText('Facebook'), { target: { value: 'facebook.com/carehome' } });
  fireEvent.change(screen.getByLabelText(/organization's mission/i), { target: { value: 'Help seniors stay home.' } });
  fireEvent.click(screen.getByRole('radio', { name: 'Annually' }));
  fireEvent.click(screen.getByRole('checkbox', { name: /Hide our street address/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(await screen.findByText('Saved!')).toBeInTheDocument();
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/api\/organizations\/3\/profile$/);
  expect(options.method).toBe('PUT');
  expect(JSON.parse(options.body)).toEqual(expect.objectContaining({
    legalName: 'Care Home Society Inc.',
    orgName: 'Care Home',
    yearEstablished: 1998,
    serviceAreas: ['Regina', 'Saskatoon'],
    categories: ['Seniors and Healthy Aging', 'Food Security'],
    populationsServed: ['Seniors', 'Families'],
    serviceLanguages: ['Cree'],
    languageServices: 'Home visits',
    facebook: 'https://facebook.com/carehome',
    mission: 'Help seniors stay home.',
    reviewFrequency: 'Annually',
    hideStreetAddress: true,
    confirmAuthorized: true,
    confirmUpdates: true,
  }));
  expect(onSaved).toHaveBeenCalled();
});

test('requires the legal name', () => {
  global.fetch = jest.fn();
  renderProfile();
  fireEvent.change(screen.getByLabelText(/legal name of organization/i), { target: { value: '  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Please enter the legal name of your organization.');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('requires a short description of 50 to 100 words and counts them', () => {
  global.fetch = jest.fn();
  renderProfile();
  fireEvent.change(screen.getByLabelText(/short organization description/i), { target: { value: 'Too short.' } });
  expect(screen.getByText('2 words')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(screen.getByRole('alert')).toHaveTextContent('The short description must be 50 to 100 words.');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('asks to specify an Other choice', () => {
  global.fetch = jest.fn();
  renderProfile();
  fireEvent.click(screen.getAllByRole('checkbox', { name: 'Other' })[1]);
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Please fill in the "Please specify" box');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('requires every consent box before saving', () => {
  global.fetch = jest.fn();
  renderProfile();
  fireEvent.click(screen.getByRole('checkbox', { name: /accurate to the best of my knowledge/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Please check all authorization and consent boxes.');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('normalizes and validates website addresses', () => {
  expect(normalizeWebsite(' www.care.org ')).toBe('https://www.care.org');
  expect(normalizeWebsite('https://care.org')).toBe('https://care.org');
  expect(normalizeWebsite('')).toBe('');
  expect(isValidWebsite('https://care.org')).toBe(true);
  expect(isValidWebsite('http://care.org')).toBe(false);
  expect(isValidWebsite('https://care')).toBe(false);
});

test('saves the website with https added', async () => {
  global.fetch = okFetch();
  renderProfile();
  fireEvent.change(screen.getByLabelText(/official website/i), { target: { value: 'www.care.org' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(await screen.findByText('Saved!')).toBeInTheDocument();
  expect(JSON.parse(global.fetch.mock.calls[0][1].body).website).toBe('https://www.care.org');
});

test('rejects a website that is not a full address', () => {
  global.fetch = jest.fn();
  renderProfile();
  fireEvent.change(screen.getByLabelText(/official website/i), { target: { value: 'ftp://care.org' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Please enter a full website address');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('uploads a logo image and rejects other file types', async () => {
  const onSaved = jest.fn();
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: async () => ({ ...org, logoVersion: 5 }) }));
  renderProfile(onSaved);
  const input = screen.getByLabelText('Upload image');

  fireEvent.change(input, { target: { files: [new File(['x'], 'logo.gif', { type: 'image/gif' })] } });
  expect(screen.getByRole('alert')).toHaveTextContent('Please choose a JPG or PNG image.');
  expect(global.fetch).not.toHaveBeenCalled();

  fireEvent.change(input, { target: { files: [new File(['x'], 'logo.png', { type: 'image/png' })] } });
  await screen.findByRole('link', { name: /View your public page/ });
  await new Promise(resolve => setTimeout(resolve, 0));
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/api\/organizations\/3\/logo$/);
  expect(options.method).toBe('PUT');
  expect(options.body).toBeInstanceOf(FormData);
  expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ logoVersion: 5 }));
});

test('explains the public page waits for approval', () => {
  global.fetch = jest.fn();
  renderProfile(() => {}, { ...org, isApproved: false });
  expect(screen.getByText(/visible once an administrator approves/)).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /View your public page/ })).not.toBeInTheDocument();
});

test('uploading a logo keeps unsaved edits', async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: async () => ({ ...org, logoVersion: 7 }) }));
  const { rerender } = renderProfile();
  fireEvent.change(screen.getByLabelText(/full organization description/i), { target: { value: 'Unsaved text' } });
  rerender(<MemoryRouter><OrgProfile org={{ ...org, logoVersion: 7 }} onSaved={() => {}} /></MemoryRouter>);
  expect(screen.getByLabelText(/full organization description/i)).toHaveValue('Unsaved text');
});
