import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ScoutingManagementPage from './ScoutingManagementPage';

const mockScouts = [
  { id: 1, name: 'Scout One', region: 'Netherlands', ability: 80, network: 70 },
  { id: 2, name: 'Scout Two', region: 'Germany', ability: 75, network: 65 }
];
const mockReports = [
  {
    scout: { id: 1, name: 'Scout One', region: 'Netherlands' },
    prospects: [
      { name: 'Young Talent', position: 'Forward', age: 17, skill: 72, talent: 85, personality: 'Driven', nationality: 'Netherlands' }
    ]
  }
];

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/api/youth-scouting/scouts/')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockScouts) });
    }
    if (url.includes('/api/youth-scouting/reports/')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockReports) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
  }) as jest.Mock;
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders loading state', () => {
  (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));
  render(<ScoutingManagementPage />);
  expect(screen.getByText(/Loading/i)).toBeInTheDocument();
});

test('renders scouts and reports after fetch', async () => {
  render(<ScoutingManagementPage />);
  await waitFor(() => expect(screen.getByText('Scouting Management')).toBeInTheDocument());
  expect(screen.getByText('Scout One')).toBeInTheDocument();
  expect(screen.getByText('Scout Two')).toBeInTheDocument();
  expect(screen.getByText('Young Talent')).toBeInTheDocument();
  expect(screen.getByText('Netherlands')).toBeInTheDocument();
});

test('renders error state on fetch failure', async () => {
  (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('API error')));
  render(<ScoutingManagementPage />);
  await waitFor(() => expect(screen.getByText(/Unknown error/i)).toBeInTheDocument());
});

test('renders empty state if no scouts or reports', async () => {
  (global.fetch as jest.Mock).mockImplementation(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }));
  render(<ScoutingManagementPage />);
  await waitFor(() => expect(screen.getByText('Scouting Management')).toBeInTheDocument());
  expect(screen.queryByText('Scout One')).not.toBeInTheDocument();
  expect(screen.getByRole('table')).toBeInTheDocument();
  expect(screen.getByText(/No reports yet/i)).toBeInTheDocument();
}); 