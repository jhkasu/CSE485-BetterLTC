import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import VolunteerMatchingProfile, { isMatchingProfileComplete } from './VolunteerMatchingProfile';
import { setSession } from './auth/session';
import { futureExp, makeToken } from './auth/testToken';

const volunteer = {
  id: 7, firstName: 'Ana', lastName: 'Lee', email: 'ana@example.test',
  city: '', availableDays: [], availableTimes: [], interests: [], languages: ['English'], recommendationConsent: false,
};

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '7', role: 'volunteer', exp: futureExp() }), { id: 7, role: 'volunteer' });
});

afterEach(() => {
  delete global.fetch;
});

test('a profile is complete only with a city and at least one day', () => {
  expect(isMatchingProfileComplete(volunteer)).toBe(false);
  expect(isMatchingProfileComplete({ ...volunteer, city: 'Regina' })).toBe(false);
  expect(isMatchingProfileComplete({ ...volunteer, city: 'Regina', availableDays: ['Monday'] })).toBe(true);
});

test('requires a city and a day before saving', () => {
  global.fetch = jest.fn();
  render(<VolunteerMatchingProfile volunteer={volunteer} onSaved={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Save profile' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Please choose your city.');
  fireEvent.change(screen.getByLabelText(/location/i), { target: { value: 'Regina' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save profile' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Please choose at least one available day.');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('saves the matching profile with consent', async () => {
  global.fetch = jest.fn((url, options) => Promise.resolve({ ok: true, status: 200, json: async () => ({ ...volunteer, ...JSON.parse(options.body) }) }));
  const onSaved = jest.fn();
  render(<VolunteerMatchingProfile volunteer={volunteer} onSaved={onSaved} />);
  fireEvent.change(screen.getByLabelText(/location/i), { target: { value: 'Regina' } });
  fireEvent.click(screen.getByRole('checkbox', { name: 'Tuesday' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Thursday' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Afternoon' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Transportation Support' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'French' }));
  fireEvent.click(screen.getByRole('checkbox', { name: /agree to be recommended/i }));
  fireEvent.click(screen.getByRole('button', { name: 'Save profile' }));
  expect(await screen.findByText('Saved!')).toBeInTheDocument();
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/api\/volunteers\/7\/matching-profile$/);
  expect(JSON.parse(options.body)).toEqual({
    city: 'Regina',
    availableDays: ['Tuesday', 'Thursday'],
    availableTimes: ['Afternoon'],
    interests: ['Transportation Support'],
    languages: ['English', 'French'],
    recommendationConsent: true,
  });
  expect(onSaved).toHaveBeenCalled();
});
