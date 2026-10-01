import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import BackgroundCheck, { backgroundCheckStep, daysUntil } from './BackgroundCheck';
import { setSession } from './auth/session';
import { futureExp, makeToken } from './auth/testToken';

function respond(body, ok = true) {
  return Promise.resolve({ ok, status: ok ? 200 : 400, json: async () => body });
}

function inDays(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '7', role: 'volunteer', exp: futureExp() }), { id: 7, role: 'volunteer' });
});

afterEach(() => {
  delete global.fetch;
});

test('maps each status to a step', () => {
  expect(backgroundCheckStep('NotStarted', false)).toBe(0);
  expect(backgroundCheckStep('ConsentGiven', false)).toBe(1);
  expect(backgroundCheckStep('ConsentGiven', true)).toBe(2);
  expect(backgroundCheckStep('Rejected', false)).toBe(2);
  expect(backgroundCheckStep('Submitted', false)).toBe(3);
  expect(backgroundCheckStep('Approved', false)).toBe(4);
  expect(daysUntil(inDays(10))).toBe(10);
});

test('consent, instructions, then upload a document', async () => {
  global.fetch = jest.fn((url, options = {}) => {
    if (url.endsWith('/me/consent')) return respond({ status: 'ConsentGiven' });
    if (url.endsWith('/me/document')) return respond({ status: 'Submitted', fileName: 'check.pdf', submittedAt: '2026-10-01T12:00:00Z' });
    return respond({ status: 'NotStarted' });
  });
  const onChange = jest.fn();
  render(<BackgroundCheck onChange={onChange} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Start' }));
  fireEvent.click(await screen.findByRole('button', { name: 'I have my document' }));
  const input = screen.getByLabelText(/click to choose a file/i);
  fireEvent.change(input, { target: { files: [new File(['%PDF-1.4'], 'check.pdf', { type: 'application/pdf' })] } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit document' }));
  expect(await screen.findByText(/We received check.pdf/)).toBeInTheDocument();
  const [, options] = global.fetch.mock.calls.find(([url]) => url.endsWith('/me/document'));
  expect(options.method).toBe('POST');
  expect(options.body.get('file').name).toBe('check.pdf');
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'Submitted' }));
});

test('rejects files that are too large or the wrong type before uploading', async () => {
  global.fetch = jest.fn(() => respond({ status: 'Rejected', rejectionReason: 'Too blurry.' }));
  render(<BackgroundCheck />);
  expect(await screen.findByText('Your document was not accepted: Too blurry.')).toBeInTheDocument();
  const input = screen.getByLabelText(/click to choose a file/i);
  fireEvent.change(input, { target: { files: [new File(['x'], 'notes.txt', { type: 'text/plain' })] } });
  expect(screen.getByText('Please choose a PDF, JPG, or PNG file.')).toBeInTheDocument();
  const big = new File(['x'], 'big.pdf', { type: 'application/pdf' });
  Object.defineProperty(big, 'size', { value: 6 * 1024 * 1024 });
  fireEvent.change(input, { target: { files: [big] } });
  expect(screen.getByText('The file must be 5 MB or smaller.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit document' })).toBeDisabled();
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('shows the expiry date and warns when it is close', async () => {
  global.fetch = jest.fn(() => respond({ status: 'Approved', expiresOn: inDays(12) }));
  render(<BackgroundCheck />);
  expect(await screen.findByText('Background check approved')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('expires in 12 days');
});

test('a document under review can be removed after confirming', async () => {
  global.fetch = jest.fn((url, options = {}) => {
    if (options.method === 'DELETE') return respond({ status: 'ConsentGiven' });
    return respond({ status: 'Submitted', fileName: 'wrong-file.pdf', submittedAt: '2026-10-01T12:00:00Z' });
  });
  render(<BackgroundCheck />);
  fireEvent.click(await screen.findByRole('button', { name: 'Remove document' }));
  expect(screen.getByText(/permanently deleted/)).toBeInTheDocument();
  expect(global.fetch.mock.calls.some(([, o]) => o && o.method === 'DELETE')).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
  expect(await screen.findByRole('button', { name: 'Submit document' })).toBeInTheDocument();
  const [url] = global.fetch.mock.calls.find(([, o]) => o && o.method === 'DELETE');
  expect(url).toMatch(/\/api\/background-checks\/me\/document$/);
});

test('an approved document cannot be removed by the volunteer', async () => {
  global.fetch = jest.fn(() => respond({ status: 'Approved', expiresOn: inDays(400) }));
  render(<BackgroundCheck />);
  expect(await screen.findByText('Background check approved')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Remove document' })).not.toBeInTheDocument();
});
