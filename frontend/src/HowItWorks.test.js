import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import HowItWorks from './HowItWorks';

test('shows the six matching steps in order and links each role', () => {
  render(
    <MemoryRouter>
      <HowItWorks />
    </MemoryRouter>
  );
  const steps = within(screen.getAllByRole('list')[0]).getAllByRole('listitem');
  expect(steps.map(step => within(step).getByRole('heading').textContent)).toEqual([
    '1. Senior Request',
    '2. Auto Match',
    '3. Organization Accepts',
    '4. Contact',
    '5. Volunteer Assigned',
    '6. Service & Log Hours',
  ]);
  expect(screen.getByRole('link', { name: /seniors/i })).toHaveAttribute('href', '/get-help');
  expect(screen.getByRole('link', { name: /organizations/i })).toHaveAttribute('href', '/signup');
  expect(screen.getByRole('link', { name: /volunteers/i })).toHaveAttribute('href', '/volunteer');
});
