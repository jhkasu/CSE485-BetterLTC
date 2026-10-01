import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import OrgProfile from './OrgProfile';
import { setSession } from './auth/session';
import { futureExp, makeToken } from './auth/testToken';

const org = {
  id: 3, orgName: 'Care Home', contactName: 'Bo', email: 'org@example.test', isApproved: true,
  description: '', serviceAreas: ['Regina'], helpTypes: [], notificationEmail: '',
};

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
  render(<OrgProfile org={org} onSaved={onSaved} />);
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
  });
  expect(onSaved).toHaveBeenCalled();
});

test('requires an organization name', () => {
  global.fetch = jest.fn();
  render(<OrgProfile org={org} onSaved={() => {}} />);
  fireEvent.change(screen.getByLabelText(/organization name/i), { target: { value: '  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Please enter your organization name.');
  expect(global.fetch).not.toHaveBeenCalled();
});
