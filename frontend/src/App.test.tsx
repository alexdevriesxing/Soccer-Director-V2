import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import ManagerDashboardPage from './pages/ManagerDashboardPage';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

// Mock fetch for simulation endpoint
beforeEach(() => {
  global.fetch = jest.fn((url, options) => {
    if (url.includes('/league/simulate/week/')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          week: 1,
          matches: [
            { fixtureId: 1, homeClub: 'Ajax', awayClub: 'PSV', homeGoals: 2, awayGoals: 1 },
          ],
          playerDevelopment: [
            { player: 'John Doe', club: 'Ajax', skillGain: 2, newSkill: 'Dribbling', isInjured: false },
            { player: 'Jane Smith', club: 'PSV', skillGain: 0, newSkill: '', isInjured: true },
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

test('Advance Week button triggers simulation and displays summary', async () => {
  render(<ManagerDashboardPage />);
  const button = screen.getByText(/Advance Week/i);
  fireEvent.click(button);
  await waitFor(() => expect(screen.getByText(/Simulation Summary/i)).toBeInTheDocument());
  expect(screen.getByText(/Ajax/)).toBeInTheDocument();
  expect(screen.getByText(/PSV/)).toBeInTheDocument();
  expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
  expect(screen.getByText(/New Injuries This Week/i)).toBeInTheDocument();
});

test('Displays error message if simulation fails', async () => {
  (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: false }));
  render(<ManagerDashboardPage />);
  const button = screen.getByText(/Advance Week/i);
  fireEvent.click(button);
  await waitFor(() => expect(screen.getByText(/Failed to simulate week/i)).toBeInTheDocument());
});
