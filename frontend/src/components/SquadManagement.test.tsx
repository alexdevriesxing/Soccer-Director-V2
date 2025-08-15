import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SquadManagement from './SquadManagement';
import * as footballApi from '../api/footballApi';
import * as playerApi from '../api/playerApi';
import type { AxiosRequestHeaders } from 'axios';

// Mock hooks
jest.mock('../hooks/useSquadManagement', () => ({
  useSquadManagement: () => ({
    players: [
      { id: 1, name: 'John Doe', position: 'GK', skill: 80, age: 25, nationality: 'NED', morale: 90, injured: false, onInternationalDuty: false, onLoan: false },
      { id: 2, name: 'Alex Smith', position: 'DEF', skill: 75, age: 27, nationality: 'ENG', morale: 85, injured: true, onInternationalDuty: false, onLoan: false },
      { id: 3, name: 'Carlos Ruiz', position: 'MID', skill: 78, age: 23, nationality: 'ESP', morale: 88, injured: false, onInternationalDuty: true, onLoan: false },
      { id: 4, name: "Liam O'Brien", position: 'FWD', skill: 82, age: 22, nationality: 'IRL', morale: 92, injured: false, onInternationalDuty: false, onLoan: true, loanClub: 'Ajax' },
    ],
    loading: false,
    error: null,
    page: 1,
    pageSize: 10,
    totalPlayers: 4,
    totalPages: 1,
    setPage: jest.fn(),
    setPageSize: jest.fn(),
    getPlayersByStatus: (status: string) => {
      switch (status) {
        case 'available': return [{ id: 1, name: 'John Doe', position: 'GK', skill: 80, age: 25, nationality: 'NED', morale: 90, injured: false, onInternationalDuty: false, onLoan: false }];
        case 'injured': return [{ id: 2, name: 'Alex Smith', position: 'DEF', skill: 75, age: 27, nationality: 'ENG', morale: 85, injured: true, onInternationalDuty: false, onLoan: false }];
        case 'international': return [{ id: 3, name: 'Carlos Ruiz', position: 'MID', skill: 78, age: 23, nationality: 'ESP', morale: 88, injured: false, onInternationalDuty: true, onLoan: false }];
        case 'loan': return [{ id: 4, name: "Liam O'Brien", position: 'FWD', skill: 82, age: 22, nationality: 'IRL', morale: 92, injured: false, onInternationalDuty: false, onLoan: true, loanClub: 'Ajax' }];
        default: return [];
      }
    },
    selectedXI: [],
    autoSelectBestXI: jest.fn(),
    setStartingXI: jest.fn(),
  })
}));
jest.mock('../context/ManagerProfileContext', () => ({
  useManagerProfile: () => ({ profile: { clubId: 1 } })
}));

describe('SquadManagement', () => {
  beforeEach(() => {
    jest.spyOn(footballApi, 'getClubs').mockResolvedValue([
      { id: 1, name: 'John Doe FC' },
      { id: 2, name: 'Alex Smith FC' },
    ]);
    jest.spyOn(footballApi, 'getClubTrainingFocus').mockResolvedValue({ trainingFocus: 'Fitness' });
    jest.spyOn(footballApi, 'setClubTrainingFocus').mockResolvedValue({ trainingFocus: 'Tactics' });
    jest.spyOn(footballApi, 'postLoan').mockResolvedValue({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows all players by default', () => {
    render(<SquadManagement />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Alex Smith')).toBeInTheDocument();
    expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument();
    expect(screen.getByText("Liam O'Brien")).toBeInTheDocument();
  });

  it('filters available players', () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getByText('Available'));
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Alex Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Carlos Ruiz')).not.toBeInTheDocument();
    expect(screen.queryByText("Liam O'Brien")).not.toBeInTheDocument();
  });

  it('filters injured players', () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getByText('Injured'));
    expect(screen.getByText('Alex Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('filters international players', () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getByText('International'));
    expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('filters on loan players', () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getByText('On Loan'));
    expect(screen.getByText("Liam O'Brien")).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('opens and closes the player modal', () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getAllByText('View')[0]);
    expect(screen.getByText('Position:')).toBeInTheDocument();
    // Close with close button
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByText('Position:')).not.toBeInTheDocument();
  });

  it('closes the modal on overlay click', () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getAllByText('View')[0]);
    const overlay = screen.getByText('Position:').closest('.bg-gray-900')?.parentElement;
    if (overlay) {
      fireEvent.click(overlay);
    }
    expect(screen.queryByText('Position:')).not.toBeInTheDocument();
  });

  it('shows toast when Train is clicked', async () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getAllByText('View')[0]);
    fireEvent.click(screen.getByText('Train'));
    expect(await screen.findByText('Train feature coming soon!')).toBeInTheDocument();
  });

  it('shows toast when Loan is clicked', async () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getAllByText('View')[0]);
    fireEvent.click(screen.getByText('Loan'));
    expect(await screen.findByText('Loan feature coming soon!')).toBeInTheDocument();
  });

  it('opens and closes the training focus modal', () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getByText('Set Training Focus'));
    expect(screen.getByText('Set Training Focus')).toBeInTheDocument(); // Modal title
    // Close with cancel
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Set Training Focus')).not.toBeInTheDocument();
  });

  it('disables confirm until a focus is selected', () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getByText('Set Training Focus'));
    const confirmBtn = screen.getByText('Confirm');
    expect(confirmBtn).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Fitness'));
    expect(confirmBtn).not.toBeDisabled();
  });

  it('sets training focus and shows toast', async () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getByText('Set Training Focus'));
    fireEvent.click(screen.getByLabelText('Tactics'));
    fireEvent.click(screen.getByText('Confirm'));
    expect(await screen.findByText('Training focus set to Tactics!')).toBeInTheDocument();
  });

  it('closes the training modal on overlay click', () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getByText('Set Training Focus'));
    const overlay = screen.getByText('Set Training Focus').closest('.bg-gray-900')?.parentElement;
    if (overlay) {
      fireEvent.click(overlay);
    }
    expect(screen.queryByText('Set Training Focus')).not.toBeInTheDocument();
  });

  it('opens and closes the loan out players modal', () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getByText('Loan Out Players'));
    expect(screen.getByText('Loan Out Players')).toBeInTheDocument(); // Modal title
    // Close with cancel
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Loan Out Players')).not.toBeInTheDocument();
  });

  it('disables confirm until a player is selected for loan', () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getByText('Loan Out Players'));
    const confirmBtn = screen.getByText('Confirm');
    expect(confirmBtn).toBeDisabled();
    fireEvent.click(screen.getByLabelText('John Doe (GK, Age 25)'));
    expect(confirmBtn).not.toBeDisabled();
  });

  it('shows toast when players are loaned out', async () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getByText('Loan Out Players'));
    fireEvent.click(screen.getByLabelText('John Doe (GK, Age 25)'));
    fireEvent.click(screen.getByText('Confirm'));
    expect(await screen.findByText('Loaned out 1 player(s)!')).toBeInTheDocument();
  });

  it('closes the loan modal on overlay click', () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getByText('Loan Out Players'));
    const overlay = screen.getByText('Loan Out Players').closest('.bg-gray-900')?.parentElement;
    if (overlay) {
      fireEvent.click(overlay);
    }
    expect(screen.queryByText('Loan Out Players')).not.toBeInTheDocument();
  });

  it('fetches and displays the club training focus on mount', async () => {
    render(<SquadManagement />);
    expect(await screen.findByText('Fitness')).toBeInTheDocument();
  });

  it('sets a new training focus and updates the UI', async () => {
    render(<SquadManagement />);
    fireEvent.click(await screen.findByText('Set Training Focus'));
    fireEvent.click(screen.getByLabelText('Tactics'));
    fireEvent.click(screen.getByText('Confirm'));
    expect(await screen.findByText('Training focus set to Tactics!')).toBeInTheDocument();
    expect(await screen.findByText('Tactics')).toBeInTheDocument();
  });

  it('shows error toast if fetching training focus fails', async () => {
    (footballApi.getClubTrainingFocus as jest.Mock).mockRejectedValueOnce(new Error('API error'));
    render(<SquadManagement />);
    expect(await screen.findByText('Error loading training focus')).toBeInTheDocument();
  });

  it('shows error toast if setting training focus fails', async () => {
    (footballApi.setClubTrainingFocus as jest.Mock).mockRejectedValueOnce(new Error('API error'));
    render(<SquadManagement />);
    fireEvent.click(await screen.findByText('Set Training Focus'));
    fireEvent.click(screen.getByLabelText('Tactics'));
    fireEvent.click(screen.getByText('Confirm'));
    expect(await screen.findByText('Error setting training focus')).toBeInTheDocument();
  });

  it('calls postLoan for each selected player and shows success toast', async () => {
    const reloadSpy = jest.spyOn(window.location, 'reload').mockImplementation(() => {});
    render(<SquadManagement />);
    fireEvent.click(await screen.findByText('Loan Out Players'));
    fireEvent.click(screen.getByLabelText('John Doe (GK, Age 25)'));
    // Dropdown should appear
    expect(screen.getByText('Select destination club')).toBeInTheDocument();
    // Confirm should be disabled until a club is selected
    const confirmBtn = screen.getByText('Confirm');
    expect(confirmBtn).toBeDisabled();
    // Select a destination club
    fireEvent.change(screen.getByDisplayValue(''), { target: { value: '2' } });
    expect(confirmBtn).not.toBeDisabled();
    // Club badge should be present in dropdown
    expect(screen.getByText(/🔵 Alex Smith FC/)).toBeInTheDocument();
    // Player skill and morale should be displayed
    expect(screen.getByText(/Skill: 80/)).toBeInTheDocument();
    expect(screen.getByText(/Morale: 90/)).toBeInTheDocument();
    fireEvent.click(confirmBtn);
    // Spinner should show while processing
    expect(screen.getByText(/Processing/)).toBeInTheDocument();
    await screen.findByText('Loaned out 1 player(s)!');
    expect(footballApi.postLoan).toHaveBeenCalledWith(expect.objectContaining({ playerId: '1', fromClubId: '1', toClubId: '2' }));
    expect(reloadSpy).toHaveBeenCalled();
    reloadSpy.mockRestore();
  });

  it('shows error toast if postLoan fails', async () => {
    (footballApi.postLoan as jest.Mock).mockRejectedValueOnce(new Error('API error'));
    render(<SquadManagement />);
    fireEvent.click(await screen.findByText('Loan Out Players'));
    fireEvent.click(screen.getByLabelText('John Doe (GK, Age 25)'));
    fireEvent.click(screen.getByText('Confirm'));
    await screen.findByText('Error loaning player 1');
  });

  it('opens and closes the Manage Contract modal from player row', () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getAllByText('Manage Contract')[0]);
    expect(screen.getByText('Manage Contract')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByText('Manage Contract')).not.toBeInTheDocument();
  });

  it('opens and closes the Manage Contract modal from player detail modal', () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getAllByText('View')[0]);
    fireEvent.click(screen.getByText('Manage Contract'));
    expect(screen.getByText('Manage Contract')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByText('Manage Contract')).not.toBeInTheDocument();
  });

  it('validates contract form fields', () => {
    render(<SquadManagement />);
    fireEvent.click(screen.getAllByText('Manage Contract')[0]);
    fireEvent.change(screen.getByLabelText('Wage (€ per week):'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Contract Expiry:'), { target: { value: '' } });
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByText('Wage and expiry are required')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Wage (€ per week):'), { target: { value: '-100' } });
    fireEvent.change(screen.getByLabelText('Contract Expiry:'), { target: { value: '2030-01-01' } });
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByText('Wage must be a positive number')).toBeInTheDocument();
  });

  it('calls API and shows toast on successful contract update', async () => {
    jest.spyOn(playerApi, 'updatePlayerContract').mockResolvedValue({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {} as AxiosRequestHeaders,
      config: { headers: {} as AxiosRequestHeaders },
    });
    render(<SquadManagement />);
    fireEvent.click(screen.getAllByText('Manage Contract')[0]);
    fireEvent.change(screen.getByLabelText('Wage (€ per week):'), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText('Contract Expiry:'), { target: { value: '2030-01-01' } });
    fireEvent.click(screen.getByText('Save'));
    expect(await screen.findByText('Contract updated!')).toBeInTheDocument();
  });

  it('shows error if API call fails', async () => {
    jest.spyOn(playerApi, 'updatePlayerContract').mockRejectedValue(new Error('API error'));
    render(<SquadManagement />);
    fireEvent.click(screen.getAllByText('Manage Contract')[0]);
    fireEvent.change(screen.getByLabelText('Wage (€ per week):'), { target: { value: '5000' } });
    fireEvent.change(screen.getByLabelText('Contract Expiry:'), { target: { value: '2030-01-01' } });
    fireEvent.click(screen.getByText('Save'));
    expect(await screen.findByText('API error')).toBeInTheDocument();
  });
}); 