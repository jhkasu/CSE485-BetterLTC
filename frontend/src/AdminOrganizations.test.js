import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';
import { setSession } from './auth/session';
import { AccessibilityProvider } from './accessibility/AccessibilityContext';
import { futureExp, makeToken } from './auth/testToken';

jest.mock('./RichTextEditor', () => () => null);

const pending = {
  id: 3, orgName: 'Care Home', contactName: 'Bo', email: 'bo@example.test', isApproved: false,
  registryType: 'Charity', registryNumber: '123456789RR0001', rejectionReason: '', serviceAreas: [],
};
const legacy = { ...pending, id: 4, orgName: 'Old Org', isApproved: true, registryType: '', registryNumber: '' };

function respond(body, ok = true) {
  return Promise.resolve({ ok, status: ok ? 200 : 500, json: async () => body });
}

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '1', role: 'admin', exp: futureExp() }), { id: 1, role: 'admin', firstName: 'Kim' });
  global.fetch = jest.fn((url, options) => {
    if (url.endsWith('/api/organizations') && !options?.method) return respond([pending, legacy]);
    if (url.endsWith('/api/organizations/3/reject')) return respond({ ...pending, rejectionReason: JSON.parse(options.body).reason });
    return respond([]);
  });
});

afterEach(() => {
  delete global.fetch;
});

test('shows the registration number with lookup links and rejects with a reason', async () => {
  render(
    <AccessibilityProvider>
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    </AccessibilityProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Organizations' }));
  const row = (await screen.findByText('Care Home')).closest('tr');
  expect(within(row).getByText('123456789RR0001')).toBeInTheDocument();
  expect(within(row).getByRole('link', { name: /CRA charity list/ })).toHaveAttribute('target', '_blank');
  expect(within(screen.getByText('Old Org').closest('tr')).getByText('Not provided')).toBeInTheDocument();

  fireEvent.click(within(row).getByRole('button', { name: 'Reject' }));
  const dialogSave = screen.getAllByRole('button', { name: 'Reject' }).pop();
  fireEvent.click(dialogSave);
  expect(screen.getByRole('alert')).toHaveTextContent('Please enter a reason.');
  fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'The number belongs to another charity.' } });
  fireEvent.click(dialogSave);
  expect(await within(row).findByText('Rejected')).toBeInTheDocument();
  expect(within(row).getByText('The number belongs to another charity.')).toBeInTheDocument();
  const call = global.fetch.mock.calls.find(([url]) => url.endsWith('/reject'));
  expect(call[1].method).toBe('PUT');
  expect(JSON.parse(call[1].body)).toEqual({ reason: 'The number belongs to another charity.' });
});
