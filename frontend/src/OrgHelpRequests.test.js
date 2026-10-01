import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HelpRequestList, HelpRequestDetail } from './OrgHelpRequests';
import { setSession } from './auth/session';
import { futureExp, makeToken } from './auth/testToken';

const open = [
  { id: 1, helpType: 'Transportation Support', city: 'Regina', contactMethod: 'Phone', forFamilyMember: false, submittedAt: '2026-10-01T12:00:00Z' },
  { id: 2, helpType: 'Meal Assistance', city: 'Saskatoon', contactMethod: 'Email', forFamilyMember: true, submittedAt: '2026-10-01T13:00:00Z' },
];

const detail = {
  id: 1, helpType: 'Transportation Support', city: 'Regina', contactMethod: 'Phone',
  firstName: 'Rose', lastName: 'Tremblay', phone: '(306) 555-0123', email: '',
  forFamilyMember: true, seniorName: 'Marie Tremblay', status: 'Accepted',
  submittedAt: '2026-10-01T12:00:00Z', acceptedAt: '2026-10-01T14:00:00Z', contactedAt: null,
};

function respond(body, status = 200) {
  return Promise.resolve({ ok: status < 300, status, json: async () => body });
}

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '3', role: 'organization', exp: futureExp() }), { id: 3, orgName: 'Care Home', isApproved: true, role: 'organization' });
});

afterEach(() => {
  delete global.fetch;
});

test('lists open requests without contact details and filters them', async () => {
  global.fetch = jest.fn(() => respond(open));
  render(<HelpRequestList onAccepted={() => {}} />);
  expect(await screen.findByRole('heading', { name: 'Transportation Support' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Meal Assistance' })).toBeInTheDocument();
  expect(screen.queryByText(/555/)).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('combobox', { name: 'All areas' }), { target: { value: 'Regina' } });
  expect(screen.getByRole('heading', { name: 'Transportation Support' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Meal Assistance' })).not.toBeInTheDocument();
});

test('accepting a request opens it', async () => {
  global.fetch = jest.fn((url) => (url.endsWith('/accept') ? respond(detail) : respond(open)));
  const onAccepted = jest.fn();
  render(<HelpRequestList onAccepted={onAccepted} />);
  fireEvent.click((await screen.findAllByRole('button', { name: 'Accept request' }))[0]);
  await waitFor(() => expect(onAccepted).toHaveBeenCalledWith(1));
  const [url, options] = global.fetch.mock.calls.find(([u]) => u.endsWith('/accept'));
  expect(url).toMatch(/\/api\/help-requests\/1\/accept$/);
  expect(options.method).toBe('PUT');
});

test('a request taken by another organization is removed with a message', async () => {
  global.fetch = jest.fn((url) => (url.endsWith('/accept') ? respond('taken', 409) : respond(open)));
  const onAccepted = jest.fn();
  render(<HelpRequestList onAccepted={onAccepted} />);
  fireEvent.click((await screen.findAllByRole('button', { name: 'Accept request' }))[0]);
  expect(await screen.findByRole('alert')).toHaveTextContent('Another organization already accepted this request.');
  expect(screen.queryByRole('heading', { name: 'Transportation Support' })).not.toBeInTheDocument();
  expect(onAccepted).not.toHaveBeenCalled();
});

test('detail shows contact details and marks the request as contacted', async () => {
  global.fetch = jest.fn((url) => (url.endsWith('/contacted')
    ? respond({ ...detail, status: 'Contacted', contactedAt: '2026-10-01T15:00:00Z' })
    : respond(detail)));
  render(<HelpRequestDetail id={1} onBack={() => {}} />);
  expect(await screen.findByText('(306) 555-0123')).toBeInTheDocument();
  expect(screen.getByText('Help is for: Marie Tremblay')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Mark as contacted' }));
  expect(await screen.findByText('The senior has been contacted and you can proceed with volunteer matching.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Mark as contacted' })).not.toBeInTheDocument();
});

test('asks the organization to set up its profile before showing requests', async () => {
  global.fetch = jest.fn(() => respond([]));
  const onSetupProfile = jest.fn();
  render(<HelpRequestList onAccepted={() => {}} needsProfile onSetupProfile={onSetupProfile} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Set up profile' }));
  expect(onSetupProfile).toHaveBeenCalled();
  expect(screen.queryByText('There are no open requests right now.')).not.toBeInTheDocument();
});
