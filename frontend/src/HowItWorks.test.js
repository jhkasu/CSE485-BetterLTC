import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import HowItWorks from './HowItWorks';

test('shows the four steps in order and links each starting point', () => {
  render(
    <MemoryRouter>
      <HowItWorks />
    </MemoryRouter>
  );
  const steps = within(screen.getAllByRole('list')[0]).getAllByRole('listitem');
  expect(steps.map(step => within(step).getByRole('heading').textContent)).toEqual([
    '1. Find an Organization',
    '2. Learn About Them',
    '3. Get in Touch',
    '4. Start Volunteering',
  ]);
  expect(screen.getByRole('link', { name: /^volunteers/i })).toHaveAttribute('href', '/organizations');
  expect(screen.getByRole('link', { name: /^organizations/i })).toHaveAttribute('href', '/signup');
  expect(screen.getByRole('link', { name: /^resources/i })).toHaveAttribute('href', '/resources');
});
