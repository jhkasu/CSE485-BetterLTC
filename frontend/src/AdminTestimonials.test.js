import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import AdminTestimonials from './AdminTestimonials';
import { setSession } from './auth/session';
import { futureExp, makeToken } from './auth/testToken';

const items = [
  { id: 1, quoteEn: 'Volunteering gave me new friends.', quoteFr: '', name: 'Anna', role: 'Volunteer', city: 'Regina', isVisible: true, photoVersion: null },
];

function respond(body, ok = true) {
  return Promise.resolve({ ok, status: ok ? 200 : 400, json: async () => body });
}

beforeEach(() => {
  window.localStorage.clear();
  setSession(makeToken({ sub: '1', role: 'admin', exp: futureExp() }), { id: 1, role: 'admin' });
  global.fetch = jest.fn((url, options = {}) => {
    if (options.method === 'POST') return respond({ id: 9 });
    return respond(items);
  });
});

afterEach(() => {
  delete global.fetch;
});

test('adds a testimonial with a photo', async () => {
  render(<AdminTestimonials />);
  await screen.findByText('Anna');
  fireEvent.click(screen.getByRole('button', { name: /Add Testimonial/ }));
  const dialog = screen.getByRole('dialog');
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  expect(within(dialog).getByRole('alert')).toHaveTextContent('Please enter the English quote and a first name.');
  fireEvent.change(within(dialog).getByLabelText('Quote (English)'), { target: { value: 'A great experience.' } });
  fireEvent.change(within(dialog).getByLabelText('First name'), { target: { value: 'Ben' } });
  fireEvent.change(within(dialog).getByLabelText('Role'), { target: { value: 'Family' } });
  fireEvent.change(within(dialog).getByLabelText(/Photo/), { target: { files: [new File(['x'], 'ben.png', { type: 'image/png' })] } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  await screen.findByText('Anna');
  await new Promise(resolve => setTimeout(resolve, 0));
  const [, post] = global.fetch.mock.calls.find(([, o]) => o && o.method === 'POST');
  expect(JSON.parse(post.body)).toEqual({ quoteEn: 'A great experience.', quoteFr: '', name: 'Ben', role: 'Family', city: '', isVisible: true });
  const [photoUrl, photo] = global.fetch.mock.calls.find(([u]) => u.endsWith('/photo'));
  expect(photoUrl).toMatch(/\/api\/testimonials\/9\/photo$/);
  expect(photo.body.get('file').name).toBe('ben.png');
});

test('hides a testimonial from the site with the toggle', async () => {
  render(<AdminTestimonials />);
  await screen.findByText('Anna');
  fireEvent.click(screen.getByRole('checkbox', { name: "Show Anna's testimonial on the site" }));
  const [url, options] = global.fetch.mock.calls.find(([, o]) => o && o.method === 'PUT');
  expect(url).toMatch(/\/api\/testimonials\/1$/);
  expect(JSON.parse(options.body).isVisible).toBe(false);
});
