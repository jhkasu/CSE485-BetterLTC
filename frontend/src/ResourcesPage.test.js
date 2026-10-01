import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import ResourcesPage from './ResourcesPage';
import { AccessibilityProvider } from './accessibility/AccessibilityContext';
import { formatFileSize, resourceFileError } from './resourceOptions';

const resources = [
  { id: 1, title: 'Volunteer Onboarding Checklist', description: 'Steps to welcome a new volunteer.', audience: 'Organizations', topic: 'Onboarding', fileName: 'onboarding-checklist.docx', fileType: 'DOCX', fileSize: 37500 },
  { id: 2, title: 'Certificate of Appreciation', description: '', audience: 'Organizations', topic: 'Recognition', fileName: 'certificate.pdf', fileType: 'PDF', fileSize: 2 * 1024 * 1024 },
  { id: 3, title: 'Your First Shift', description: 'What to expect.', audience: 'Volunteers', topic: 'Onboarding', fileName: 'first-shift.pdf', fileType: 'PDF', fileSize: 1000 },
];

function renderPage() {
  return render(
    <AccessibilityProvider>
      <MemoryRouter>
        <ResourcesPage />
      </MemoryRouter>
    </AccessibilityProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: async () => resources }));
});

afterEach(() => {
  delete global.fetch;
});

test('formats sizes and checks file types', () => {
  expect(formatFileSize(37500)).toBe('37 KB');
  expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
  expect(resourceFileError(new File(['x'], 'a.png', { type: 'image/png' }))).toBe('resources.errors.type');
  expect(resourceFileError(new File(['x'], 'a.DOCX'))).toBe('');
});

test('shows organization resources with download links', async () => {
  renderPage();
  expect(await screen.findByRole('heading', { name: 'Volunteer Onboarding Checklist' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'For Organizations (2)' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.queryByRole('heading', { name: 'Your First Shift' })).not.toBeInTheDocument();
  const link = screen.getByRole('link', { name: 'Download Volunteer Onboarding Checklist (DOCX, 37 KB)' });
  expect(link.getAttribute('href')).toMatch(/\/api\/resources\/1\/file$/);
});

test('switches audience and filters by topic', async () => {
  renderPage();
  await screen.findByRole('heading', { name: 'Volunteer Onboarding Checklist' });
  fireEvent.click(screen.getByRole('button', { name: /Topic/ }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Recognition' }));
  expect(screen.getByRole('heading', { name: 'Certificate of Appreciation' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Volunteer Onboarding Checklist' })).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole('tab', { name: 'For Volunteers (1)' }));
  expect(screen.getByText('No resources match this topic.')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
  expect(screen.getByRole('heading', { name: 'Your First Shift' })).toBeInTheDocument();
});
