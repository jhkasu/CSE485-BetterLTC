import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import TestimonialsSection, { testimonialPhotoUrl, testimonialQuote } from './TestimonialsSection';

const items = [
  { id: 1, quoteEn: 'Volunteering gave me new friends.', quoteFr: "Le bénévolat m'a donné de nouveaux amis.", name: 'Anna', role: 'Volunteer', city: 'Regina', isVisible: true, photoVersion: 5 },
  { id: 2, quoteEn: 'Our residents look forward to every visit.', quoteFr: '', name: 'Marc', role: 'Organization', city: '', isVisible: true, photoVersion: null },
];

function renderSection(data) {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: async () => data }));
  return render(<MemoryRouter><TestimonialsSection /></MemoryRouter>);
}

afterEach(() => {
  delete global.fetch;
});

test('helpers pick the language and photo url', () => {
  expect(testimonialQuote(items[0], 'fr')).toBe("Le bénévolat m'a donné de nouveaux amis.");
  expect(testimonialQuote(items[1], 'fr')).toBe('Our residents look forward to every visit.');
  expect(testimonialPhotoUrl(items[0])).toMatch(/\/api\/testimonials\/1\/photo\?v=5$/);
  expect(testimonialPhotoUrl(items[1])).toBeNull();
});

test('shows one testimonial at a time and moves with the buttons', async () => {
  renderSection(items);
  expect(await screen.findByText('Volunteering gave me new friends.')).toBeInTheDocument();
  expect(screen.getByText('Volunteer · Regina')).toBeInTheDocument();
  expect(screen.getByText('1 / 2')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Next testimonial' }));
  expect(screen.getByText('Our residents look forward to every visit.')).toBeInTheDocument();
  expect(screen.queryByText('Volunteering gave me new friends.')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Next testimonial' }));
  expect(screen.getByText('Volunteering gave me new friends.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Previous testimonial' }));
  expect(screen.getByText('2 / 2')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Read more stories/ })).toHaveAttribute('href', '/our-work');
});

test('hides the buttons for a single testimonial and the section when empty', async () => {
  const { unmount } = renderSection([items[0]]);
  await screen.findByText('Volunteering gave me new friends.');
  expect(screen.queryByRole('button', { name: 'Next testimonial' })).not.toBeInTheDocument();
  unmount();
  renderSection([]);
  await new Promise(resolve => setTimeout(resolve, 0));
  expect(screen.queryByRole('heading', { name: 'What people are saying' })).not.toBeInTheDocument();
});
