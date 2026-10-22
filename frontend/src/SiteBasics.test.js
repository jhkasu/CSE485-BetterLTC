import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';
import Navbar from './Navbar';
import usePageTitle from './usePageTitle';
import { AccessibilityProvider } from './accessibility/AccessibilityContext';

function renderWithRouter(ui) {
  return render(
    <AccessibilityProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </AccessibilityProvider>,
  );
}

function TitledPage({ title }) {
  usePageTitle(title);
  return null;
}

beforeEach(() => {
  window.localStorage.clear();
});

test('the footer shows no placeholder contact details or empty social links', () => {
  renderWithRouter(<Footer />);
  expect(screen.queryByText(/Placeholder/)).not.toBeInTheDocument();
  expect(screen.queryByText(/555/)).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Facebook' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Resources' })).toHaveAttribute('href', '/resources');
});

test('the navbar hides the donate button until a donation link is set', () => {
  renderWithRouter(<Navbar />);
  expect(screen.queryByText('Donate now')).not.toBeInTheDocument();
});

test('pages set a descriptive browser tab title', () => {
  const { rerender } = render(<TitledPage title="Resources" />);
  expect(document.title).toBe('Resources | VolunteerConnect Saskatchewan');
  rerender(<TitledPage title="" />);
  expect(document.title).toBe('VolunteerConnect Saskatchewan');
});
