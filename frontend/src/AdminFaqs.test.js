import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import AdminFaqs from './AdminFaqs';
import { setSession } from './auth/session';
import { futureExp, makeToken } from './auth/testToken';

const faqs = [
  { id: 1, topic: 'GettingStarted', questionEn: 'How do I start?', answerEn: 'Browse.', questionFr: 'Comment commencer?', answerFr: 'Parcourez.', sortOrder: 1 },
  { id: 2, topic: 'GettingStarted', questionEn: 'Do I need an account?', answerEn: 'No.', questionFr: '', answerFr: '', sortOrder: 2 },
];

function respond(body, ok = true) {
  return Promise.resolve({ ok, status: ok ? 200 : 400, json: async () => body });
}

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '1', role: 'admin', exp: futureExp() }), { id: 1, role: 'admin' });
  global.fetch = jest.fn(() => respond(faqs));
});

afterEach(() => {
  delete global.fetch;
});

test('lists questions by topic with move buttons disabled at the ends', async () => {
  render(<AdminFaqs />);
  expect(await screen.findByText('How do I start?')).toBeInTheDocument();
  expect(screen.getByText('No French version yet')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Move up: How do I start?' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Move down: Do I need an account?' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Move down: How do I start?' }));
  const [url, options] = global.fetch.mock.calls.find(([u]) => u.endsWith('/move'));
  expect(url).toMatch(/\/api\/faqs\/1\/move$/);
  expect(JSON.parse(options.body)).toEqual({ direction: 'down' });
});

test('adds a question and requires English text', async () => {
  render(<AdminFaqs />);
  await screen.findByText('How do I start?');
  fireEvent.click(screen.getByRole('button', { name: /Add Question/ }));
  const dialog = screen.getByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  expect(within(dialog).getByRole('alert')).toHaveTextContent('Please enter the English question and answer.');
  fireEvent.change(within(dialog).getByLabelText('Topic'), { target: { value: 'Training' } });
  fireEvent.change(within(dialog).getByLabelText('Question (English)'), { target: { value: 'Is training free?' } });
  fireEvent.change(within(dialog).getByLabelText('Answer (English)'), { target: { value: 'Usually.' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  await screen.findByText('How do I start?');
  const [, options] = global.fetch.mock.calls.find(([, o]) => o && o.method === 'POST');
  expect(JSON.parse(options.body)).toEqual({ topic: 'Training', questionEn: 'Is training free?', answerEn: 'Usually.', questionFr: '', answerFr: '' });
});
