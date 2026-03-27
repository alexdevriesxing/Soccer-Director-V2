import React from 'react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import SaveLoadPage from './SaveLoadPage';
import { deleteCareer, loadSlot, saveSlot } from '../api';
import { useActiveCareer } from '../useActiveCareer';
import { renderV2 } from '../test/renderV2';

jest.mock('../api', () => ({
  deleteCareer: jest.fn(),
  loadSlot: jest.fn(),
  saveSlot: jest.fn()
}));

jest.mock('../useActiveCareer', () => ({
  useActiveCareer: jest.fn()
}));

const mockDeleteCareer = deleteCareer as jest.MockedFunction<typeof deleteCareer>;
const mockLoadSlot = loadSlot as jest.MockedFunction<typeof loadSlot>;
const mockSaveSlot = saveSlot as jest.MockedFunction<typeof saveSlot>;
const mockUseActiveCareer = useActiveCareer as jest.MockedFunction<typeof useActiveCareer>;

function makeCareers() {
  return [
    {
      id: 'career-123',
      managerName: 'Alex',
      controlledClubId: 1,
      controlledClubName: 'Ajax',
      controlledLeagueName: 'Eredivisie',
      season: '2026/2027',
      weekNumber: 4,
      currentPhase: 'PLANNING',
      currentDate: '2026-08-14T12:00:00.000Z',
      activeLeagueId: 12,
      saveSlots: [
        {
          slotName: 'manual',
          isAuto: false,
          updatedAt: '2026-08-14T12:00:00.000Z',
          stateHash: 'abcd1234efgh5678'
        },
        {
          slotName: 'autosave',
          isAuto: true,
          updatedAt: '2026-08-14T12:30:00.000Z',
          stateHash: 'ffffaaaa22221111'
        }
      ]
    }
  ];
}

describe('SaveLoadPage', () => {
  beforeEach(() => {
    mockUseActiveCareer.mockReturnValue({
      careerId: 'career-123',
      careers: makeCareers(),
      resolving: false,
      resolveError: null,
      refreshCareers: jest.fn().mockResolvedValue(makeCareers()),
      setCareerId: jest.fn(),
      clearCareerId: jest.fn()
    });
    mockSaveSlot.mockResolvedValue({});
    mockLoadSlot.mockResolvedValue({});
    mockDeleteCareer.mockResolvedValue({ id: 'career-123', managerName: 'Alex', deleted: true });
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a friendly integrity error and recovery hint when load validation fails', async () => {
    mockLoadSlot.mockRejectedValueOnce(new Error('Integrity check failed for save slot due to hash mismatch.'));

    renderV2(<SaveLoadPage />, {
      route: '/save-load',
      path: '/save-load'
    });

    fireEvent.click(await screen.findByTestId('save-load-load-button'));

    expect(await screen.findByTestId('save-load-error')).toHaveTextContent('This save slot failed integrity validation and was not loaded.');
    expect(screen.getByTestId('save-load-integrity-hint')).toHaveTextContent('try loading `autosave` or another manual slot');
  });

  it('blocks save attempts when no active career is selected', async () => {
    mockUseActiveCareer.mockReturnValue({
      careerId: null,
      careers: makeCareers(),
      resolving: false,
      resolveError: null,
      refreshCareers: jest.fn().mockResolvedValue(makeCareers()),
      setCareerId: jest.fn(),
      clearCareerId: jest.fn()
    });

    renderV2(<SaveLoadPage />, {
      route: '/save-load',
      path: '/save-load'
    });

    fireEvent.click(await screen.findByTestId('save-load-save-button'));

    expect(await screen.findByTestId('save-load-error')).toHaveTextContent('Select an active career first.');
    expect(mockSaveSlot).not.toHaveBeenCalled();
  });

  it('can save and then load a specific slot from the active career history', async () => {
    renderV2(<SaveLoadPage />, {
      route: '/save-load',
      path: '/save-load'
    });

    fireEvent.change(await screen.findByTestId('save-load-slot-input'), {
      target: { value: 'manual-qa' }
    });
    fireEvent.click(screen.getByTestId('save-load-save-button'));

    await waitFor(() => expect(mockSaveSlot).toHaveBeenCalledWith('career-123', 'manual-qa'));

    const historyRows = await screen.findAllByTestId('save-load-slot-row');
    fireEvent.click(within(historyRows[0]).getByTestId('save-load-slot-row-button'));

    await waitFor(() => expect(mockLoadSlot).toHaveBeenCalledWith('career-123', 'manual'));
    expect(await screen.findByTestId('save-load-message')).toHaveTextContent('Loaded slot "manual".');
  });
});
