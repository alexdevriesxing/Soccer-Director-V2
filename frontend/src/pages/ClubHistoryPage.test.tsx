import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ClubHistoryPage from './ClubHistoryPage';

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/api/clubs/1/history')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          history: [
            {
              season: '2023/24',
              league: 'Eredivisie',
              position: 1,
              points: 85,
              won: 27,
              drawn: 4,
              lost: 3,
              goalsFor: 90,
              goalsAgainst: 30,
              goalDifference: 60
            },
            {
              season: '2022/23',
              league: 'Eredivisie',
              position: 2,
              points: 78,
              won: 24,
              drawn: 6,
              lost: 4,
              goalsFor: 80,
              goalsAgainst: 35,
              goalDifference: 45
            }
          ]
        })
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }) as jest.Mock;
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders loading state', () => {
  (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));
  render(<ClubHistoryPage />);
  expect(screen.getByText(/Loading club history/i)).toBeInTheDocument();
});

test('renders club history table after fetch', async () => {
  render(<ClubHistoryPage />);
  await waitFor(() => expect(screen.getByText('Club History')).toBeInTheDocument());
  expect(screen.getByText('2023/24')).toBeInTheDocument();
  expect(screen.getByText('Eredivisie')).toBeInTheDocument();
  expect(screen.getByText('85')).toBeInTheDocument();
  expect(screen.getByText('2022/23')).toBeInTheDocument();
});

test('renders error state on fetch failure', async () => {
  (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('API error')));
  render(<ClubHistoryPage />);
  await waitFor(() => expect(screen.getByText(/Failed to load club history/i)).toBeInTheDocument());
});

test('renders empty state if no history', async () => {
  (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ history: [] })
  }));
  render(<ClubHistoryPage />);
  await waitFor(() => expect(screen.getByText('Club History')).toBeInTheDocument());
  // Table should be present but empty
  expect(screen.queryByText('2023/24')).not.toBeInTheDocument();
  expect(screen.getByRole('table')).toBeInTheDocument();
}); 