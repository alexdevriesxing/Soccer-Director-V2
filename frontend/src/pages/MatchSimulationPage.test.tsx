import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MatchSimulationPage from './MatchSimulationPage';

jest.mock('../assets/matchAssets', () => ({
  MatchAssets: {
    goalTop: '',
    goalBottom: '',
    pitch: ''
  }
}));

jest.mock('../components/HighlightPhaserScene', () => () => <div data-testid="highlight-scene">Highlight Scene</div>);

test('renders match simulation and progresses to full time', async () => {
  render(<MatchSimulationPage />);
  // Should show timer at 0'
  expect(screen.getByText(/0'/)).toBeInTheDocument();
  // Wait for match to progress (simulate a few seconds)
  await waitFor(() => expect(screen.getByText(/Full Time/)).toBeInTheDocument(), { timeout: 15000 });
  // Should show final score and key events
  expect(screen.getByText(/Key Events/)).toBeInTheDocument();
  expect(screen.getByText(/Continue/)).toBeInTheDocument();
});

test('renders with no events (edge case)', async () => {
  // Mock generateMatchEvents to return []
  jest.spyOn(require('./MatchSimulationPage'), 'generateMatchEvents').mockReturnValue([]);
  render(<MatchSimulationPage />);
  await waitFor(() => expect(screen.getByText(/Full Time/)).toBeInTheDocument(), { timeout: 15000 });
  expect(screen.getByText(/Key Events/)).toBeInTheDocument();
}); 