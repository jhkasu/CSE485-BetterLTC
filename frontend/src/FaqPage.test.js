import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import FaqPage from './FaqPage';
import { AccessibilityProvider } from './accessibility/AccessibilityContext';
import { faqText } from './faqOptions';

const faqs = [
  { id: 1, topic: 'GettingStarted', questionEn: 'How do I start volunteering?', answerEn: 'Browse the directory.', questionFr: 'Comment commencer?', answerFr: 'Parcourez le répertoire.', sortOrder: 1 },
  { id: 2, topic: 'Insurance', questionEn: 'Am I covered by insurance?', answerEn: 'Ask the organization.', questionFr: '', answerFr: '', sortOrder: 1 },
];

function renderPage() {
  return render(
    <AccessibilityProvider>
      <MemoryRouter>
        <FaqPage />
      </MemoryRouter>
    </AccessibilityProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, json: async () => faqs }));
});

afterEach(() => {
  delete global.fetch;
});

test('falls back to English when French is missing', () => {
  expect(faqText(faqs[0], 'fr')).toEqual({ question: 'Comment commencer?', answer: 'Parcourez le répertoire.' });
  expect(faqText(faqs[1], 'fr')).toEqual({ question: 'Am I covered by insurance?', answer: 'Ask the organization.' });
  expect(faqText(faqs[0], 'en').question).toBe('How do I start volunteering?');
});

test('groups questions by topic with jump links', async () => {
  renderPage();
  expect(await screen.findByRole('heading', { name: 'Getting Started' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Insurance and Liability' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Insurance and Liability' })).toHaveAttribute('href', '#faq-Insurance');
  expect(screen.getByText('How do I start volunteering?')).toBeInTheDocument();
});

test('search keeps matching questions open and says when nothing matches', async () => {
  renderPage();
  await screen.findByText('How do I start volunteering?');
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search questions' }), { target: { value: 'insurance' } });
  expect(screen.queryByText('How do I start volunteering?')).not.toBeInTheDocument();
  expect(screen.getByText('Ask the organization.')).toBeVisible();
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search questions' }), { target: { value: 'parking' } });
  expect(screen.getByRole('status')).toHaveTextContent('No questions match "parking".');
});
