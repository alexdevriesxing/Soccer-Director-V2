import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import JongTeamManagement from './JongTeamManagement';

// Mock the custom hook
jest.mock('../hooks/useJongTeamManagement', () => () => ({
  jongSquad: [
    { id: 1, name: 'Player 1', age: 19, skill: 70 },
    { id: 2, name: 'Player 2', age: 20, skill: 65 }
  ],
  firstSquad: [
    { id: 3, name: 'Player 3', age: 21, skill: 75 }
  ],
  loading: false,
  loadingJong: false,
  loadingFirst: false,
  jongTeam: { id: 10, name: 'Jong Test', leagueId: 1 },
  leagueTable: [],
  fixtures: [],
  graduations: [],
  showGraduation: false,
  currentGrad: null,
  jongPage: 1,
  setJongPage: jest.fn(),
  jongPageSize: 25,
  setJongPageSize: jest.fn(),
  jongTotalPlayers: 2,
  jongTotalPages: 1,
  firstPage: 1,
  setFirstPage: jest.fn(),
  firstPageSize: 25,
  setFirstPageSize: jest.fn(),
  firstTotalPlayers: 1,
  firstTotalPages: 1,
  handleGraduationDecision: jest.fn(),
  setShowGraduation: jest.fn(),
  setCurrentGrad: jest.fn()
}));

describe('JongTeamManagement', () => {
  const parentClub = { id: 99, name: 'Parent Club', leagueId: 1, morale: 70 };
  const onClose = jest.fn();

  it('renders the modal and help button', () => {
    render(<JongTeamManagement open={true} onClose={onClose} parentClub={parentClub} />);
    expect(screen.getByText('Jong Team Management')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /help/i })).toBeInTheDocument();
  });

  it('shows the help modal when help button is clicked', () => {
    render(<JongTeamManagement open={true} onClose={onClose} parentClub={parentClub} />);
    fireEvent.click(screen.getByRole('button', { name: /help/i }));
    expect(screen.getByText(/Jong Team Management Help/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByText(/Jong Team Management Help/i)).not.toBeInTheDocument();
  });

  it('shows analytics, finances, and notifications tooltips', async () => {
    render(<JongTeamManagement open={true} onClose={onClose} parentClub={parentClub} />);
    // Analytics button
    const analyticsBtn = screen.getByText(/Show Analytics/i);
    fireEvent.mouseOver(analyticsBtn.parentElement!);
    expect(screen.getByText(/player development, staff impact/i)).toBeInTheDocument();
    // Finances button
    const financesBtn = screen.getByText(/Show Finances/i);
    fireEvent.mouseOver(financesBtn.parentElement!);
    expect(screen.getByText(/wage\/transfer budgets/i)).toBeInTheDocument();
    // Notifications button
    const notificationsBtn = screen.getByText(/Show Notifications/i);
    fireEvent.mouseOver(notificationsBtn.parentElement!);
    expect(screen.getByText(/promotion-eligible players/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<JongTeamManagement open={true} onClose={onClose} parentClub={parentClub} />);
    fireEvent.click(screen.getByRole('button', { name: /×/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders squad lists', () => {
    render(<JongTeamManagement open={true} onClose={onClose} parentClub={parentClub} />);
    expect(screen.getByText('Player 1')).toBeInTheDocument();
    expect(screen.getByText('Player 2')).toBeInTheDocument();
    expect(screen.getByText('Player 3')).toBeInTheDocument();
  });

  // Add more tests for CRUD, bulk actions, error/loading states as needed
}); 