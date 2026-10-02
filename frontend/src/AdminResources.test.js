import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import AdminResources from './AdminResources';
import { setSession } from './auth/session';
import { futureExp, makeToken } from './auth/testToken';

const resources = [
  { id: 1, title: 'Volunteer Onboarding Checklist', description: 'Steps.', audience: 'Organizations', topic: 'Onboarding', fileName: 'onboarding-checklist.docx', fileType: 'DOCX', fileSize: 37500 },
];

function respond(body, ok = true) {
  return Promise.resolve({ ok, status: ok ? 200 : 400, json: async () => body });
}

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '1', role: 'admin', exp: futureExp() }), { id: 1, role: 'admin' });
  global.fetch = jest.fn(() => respond(resources));
});

afterEach(() => {
  delete global.fetch;
});

test('adds a resource with a file', async () => {
  render(<AdminResources />);
  await screen.findByText('Volunteer Onboarding Checklist');
  fireEvent.click(screen.getByRole('button', { name: /Add Resource/ }));
  const dialog = screen.getByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  expect(within(dialog).getByRole('alert')).toHaveTextContent('Please enter a title.');

  fireEvent.change(within(dialog).getByLabelText('Title'), { target: { value: 'Thank-you Letter' } });
  fireEvent.change(within(dialog).getByLabelText('Topic'), { target: { value: 'Recognition' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  expect(within(dialog).getByRole('alert')).toHaveTextContent('Please choose a file.');

  fireEvent.change(within(dialog).getByLabelText('File'), { target: { files: [new File(['x'], 'letter.png', { type: 'image/png' })] } });
  expect(within(dialog).getByRole('alert')).toHaveTextContent('Please choose a PDF or Word (.docx) file.');
  fireEvent.change(within(dialog).getByLabelText('File'), { target: { files: [new File(['x'], 'letter.docx')] } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  await screen.findByText('Volunteer Onboarding Checklist');
  const [url, options] = global.fetch.mock.calls.find(([, o]) => o && o.method === 'POST');
  expect(url).toMatch(/\/api\/resources$/);
  expect(options.body.get('title')).toBe('Thank-you Letter');
  expect(options.body.get('topic')).toBe('Recognition');
  expect(options.body.get('file').name).toBe('letter.docx');
});

test('edits without replacing the file and deletes after confirming', async () => {
  render(<AdminResources />);
  await screen.findByText('Volunteer Onboarding Checklist');
  fireEvent.click(screen.getByRole('button', { name: 'Edit Volunteer Onboarding Checklist' }));
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByText('Current file: onboarding-checklist.docx')).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  await screen.findByText('Volunteer Onboarding Checklist');
  const [url, options] = global.fetch.mock.calls.find(([, o]) => o && o.method === 'PUT');
  expect(url).toMatch(/\/api\/resources\/1$/);
  expect(options.body.get('file')).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Delete Volunteer Onboarding Checklist' }));
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  await screen.findByText('Volunteer Onboarding Checklist');
  expect(global.fetch.mock.calls.some(([u, o]) => o && o.method === 'DELETE' && /\/api\/resources\/1$/.test(u))).toBe(true);
});
