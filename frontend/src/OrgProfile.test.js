import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import OrgProfile, { isValidWebsite, normalizeWebsite } from './OrgProfile';
import { setSession } from './auth/session';
import { futureExp, makeToken } from './auth/testToken';

const org = {
  id: 3, orgName: 'Care Home', contactName: 'Bo', email: 'org@example.test', isApproved: true,
  description: '', serviceAreas: ['Regina'], helpTypes: [], notificationEmail: '',
};

function renderProfile(onSaved = () => {}, value = org) {
  return render(<MemoryRouter><OrgProfile org={value} onSaved={onSaved} /></MemoryRouter>);
}

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '3', role: 'organization', exp: futureExp() }), { id: 3, orgName: 'Care Home', isApproved: true, role: 'organization' });
});

afterEach(() => {
  delete global.fetch;
});

test('saves service areas, help types, and details to the profile API', async () => {
  global.fetch = jest.fn((url, options) => Promise.resolve({ ok: true, status: 200, json: async () => ({ ...org, ...JSON.parse(options.body) }) }));
  const onSaved = jest.fn();
  renderProfile(onSaved);
  expect(screen.getByRole('checkbox', { name: 'Regina' })).toBeChecked();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Saskatoon' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Regina' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Transportation Support' }));
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Rides for seniors.' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(await screen.findByText('Saved!')).toBeInTheDocument();
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/api\/organizations\/3\/profile$/);
  expect(options.method).toBe('PUT');
  expect(JSON.parse(options.body)).toEqual({
    orgName: 'Care Home',
    description: 'Rides for seniors.',
    serviceAreas: ['Saskatoon'],
    helpTypes: ['Transportation Support'],
    notificationEmail: '',
    website: '',
  });
  expect(onSaved).toHaveBeenCalled();
});

test('requires an organization name', () => {
  global.fetch = jest.fn();
  renderProfile();
  fireEvent.change(screen.getByLabelText(/organization name/i), { target: { value: '  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Please enter your organization name.');
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
  global.fetch = jest.fn((url, options) => Promise.resolve({ ok: true, status: 200, json: async () => ({ ...org, ...JSON.parse(options.body) }) }));
  renderProfile();
  fireEvent.change(screen.getByLabelText('Official website'), { target: { value: 'www.care.org' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(await screen.findByText('Saved!')).toBeInTheDocument();
  expect(JSON.parse(global.fetch.mock.calls[0][1].body).website).toBe('https://www.care.org');
});

test('rejects a website that is not a full address', () => {
  global.fetch = jest.fn();
  renderProfile();
  fireEvent.change(screen.getByLabelText('Official website'), { target: { value: 'ftp://care.org' } });
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
  fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Unsaved text' } });
  rerender(<MemoryRouter><OrgProfile org={{ ...org, logoVersion: 7 }} onSaved={() => {}} /></MemoryRouter>);
  expect(screen.getByLabelText('Description')).toHaveValue('Unsaved text');
});
