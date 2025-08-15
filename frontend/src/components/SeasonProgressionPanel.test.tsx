import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import SeasonProgressionPanel from './SeasonProgressionPanel';

const mockSummary = {
  currentWeek: 10,
  totalWeeks: 34,
  remainingFixtures: [{}, {}, {}],
  seasonStatus: 'in_progress'
};

beforeEach(() => {
  global.fetch = jest.fn((url, options) => {
    if (url && url.toString().includes('/season/summary')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockSummary) });
    }
    if (url && url.toString().includes('/season/advance-week')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ result: 'week advanced' }) });
    }
    if (url && url.toString().includes('/season/advance-to-end')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ result: 'season finished' }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }) as jest.Mock;
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders loading state', () => {
  (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));
  render(<SeasonProgressionPanel />);
  expect(screen.getByText(/Loading season summary/i)).toBeInTheDocument();
});

test('renders season summary after fetch', async () => {
  render(<SeasonProgressionPanel />);
  await waitFor(() => expect(screen.getByText('Season Progression')).toBeInTheDocument());
  expect(screen.getByText(/Current Week/i)).toBeInTheDocument();
  expect(screen.getByText(/Remaining Fixtures/i)).toBeInTheDocument();
  expect(screen.getByText(/Advance Week/i)).toBeInTheDocument();
});

test('renders error state on fetch failure', async () => {
  (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('API error')));
  render(<SeasonProgressionPanel />);
  await waitFor(() => expect(screen.getByText(/Unknown error/i)).toBeInTheDocument());
});

test('advances week and shows simulation result', async () => {
  render(<SeasonProgressionPanel />);
  await waitFor(() => expect(screen.getByText(/Advance Week/i)).toBeInTheDocument());
  fireEvent.click(screen.getByText(/Advance Week/i));
  await waitFor(() => expect(screen.getByText(/Simulation Result/i)).toBeInTheDocument());
});

test('advances to end of season and shows simulation result', async () => {
  render(<SeasonProgressionPanel />);
  await waitFor(() => expect(screen.getByText(/Advance to End of Season/i)).toBeInTheDocument());
  fireEvent.click(screen.getByText(/Advance to End of Season/i));
  await waitFor(() => expect(screen.getByText(/Simulation Result/i)).toBeInTheDocument());
});

test('disables buttons if season is finished', async () => {
  (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ ...mockSummary, seasonStatus: 'finished' })
  }));
  render(<SeasonProgressionPanel />);
  await waitFor(() => expect(screen.getByText('Season Progression')).toBeInTheDocument());
  expect(screen.getByText(/Advance Week/i)).toBeDisabled();
  expect(screen.getByText(/Advance to End of Season/i)).toBeDisabled();
}); 