import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import IntergenerationalPage from './IntergenerationalPage';
import { AccessibilityProvider } from './accessibility/AccessibilityContext';

function renderPage(orgs) {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: async () => orgs }));
  return render(
    <AccessibilityProvider>
      <MemoryRouter>
        <IntergenerationalPage />
      </MemoryRouter>
    </AccessibilityProvider>,
  );
}

afterEach(() => {
  delete global.fetch;
});

test('explains the three ways and lists organizations with intergenerational roles', async () => {
  renderPage([{ id: 7, orgName: 'Green Youth', serviceAreas: ['Regina'], categories: [], offersIntergenerational: true, logoVersion: null }]);
  expect(screen.getByRole('heading', { name: 'Mentorship pairs' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Mixed-age teams' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Roles suited to older adults' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Download free templates/ })).toHaveAttribute('href', '/resources');
  expect(await screen.findByRole('link', { name: /Green Youth/ })).toHaveAttribute('href', '/organizations/7');
  expect(global.fetch.mock.calls[0][0]).toMatch(/\/api\/organizations\/directory\?intergenerational=true$/);
});

test('says when no organization offers intergenerational roles yet', async () => {
  renderPage([]);
  expect(await screen.findByText('No organizations have listed intergenerational roles yet.')).toBeInTheDocument();
});
