import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClubTacticsPage from './ClubTacticsPage';

// Helper to create a minimal Response-like mock
function createMockResponse({ ok = true, status = 200, json = async () => ({}), statusText = 'OK' } = {}) {
  const response = {
    ok,
    status,
    statusText,
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: '',
    clone: () => response, // Fix: do not use 'this', just return the same object
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    json,
    text: async () => '',
  } as unknown as Response;
  return response;
}

// Helper to mock fetch
function mockFetchImpl(handlers: Record<string, any>) {
  return jest.fn((url, options) => {
    if (url.includes('/tactics')) {
      if (options && options.method === 'PATCH') {
        if (handlers.tacticsPatchError) return Promise.resolve(createMockResponse({ ok: false, status: 400, json: async () => ({ error: 'Failed to save tactics' }), statusText: 'Bad Request' }));
        return Promise.resolve(createMockResponse({ ok: true, json: async () => ({ formation: '4-4-2', strategy: 'Defensive' }) }));
      }
      if (handlers.tacticsError) return Promise.resolve(createMockResponse({ ok: false, status: 400, json: async () => ({ error: 'Failed to fetch tactics' }), statusText: 'Bad Request' }));
      return Promise.resolve(createMockResponse({ ok: true, json: async () => ({ formation: '4-3-3', strategy: 'Attacking' }) }));
    }
    if (url.includes('/set-piece-specialists')) {
      if (handlers.specialistsError) return Promise.resolve(createMockResponse({ ok: false, status: 400, json: async () => ({ error: 'Failed to fetch specialists' }), statusText: 'Bad Request' }));
      return Promise.resolve(createMockResponse({ ok: true, json: async () => ({ specialists: handlers.specialists || [] }) }));
    }
    if (url.includes('/set-piece-specialist/')) {
      const id = parseInt(url.split('/').pop() || '0', 10);
      if (options && options.method === 'PATCH') {
        if (handlers.editError) return Promise.resolve(createMockResponse({ ok: false, status: 400, json: async () => ({ error: 'Failed to update specialist' }), statusText: 'Bad Request' }));
        return Promise.resolve(createMockResponse({ ok: true, json: async () => ({}) }));
      }
      if (options && options.method === 'DELETE') {
        if (handlers.deleteError) return Promise.resolve(createMockResponse({ ok: false, status: 400, json: async () => ({ error: 'Failed to delete specialist' }), statusText: 'Bad Request' }));
        return Promise.resolve(createMockResponse({ ok: true, json: async () => ({}) }));
      }
    }
    if (url.includes('/set-piece-specialist')) {
      if (options && options.method === 'POST') {
        if (handlers.addError) return Promise.resolve(createMockResponse({ ok: false, status: 400, json: async () => ({ error: 'Failed to add specialist' }), statusText: 'Bad Request' }));
        return Promise.resolve(createMockResponse({ ok: true, json: async () => ({}) }));
      }
    }
    if (url.includes('/squad')) {
      return Promise.resolve(createMockResponse({ ok: true, json: async () => ({ players: [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Alex Smith' },
      ] }) }));
    }
    return Promise.resolve(createMockResponse({ ok: true, json: async () => ({}) }));
  });
}

describe('ClubTacticsPage', () => {
  beforeEach(() => {
    jest.spyOn(window, 'fetch').mockImplementation(mockFetchImpl({
      specialists: [
        { id: 1, playerId: 1, playerName: 'John Doe', type: 'Free Kick', skill: 85 },
        { id: 2, playerId: 2, playerName: 'Alex Smith', type: 'Penalty', skill: 90 },
      ],
    }));
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows loading state', async () => {
    render(<ClubTacticsPage />);
    expect(screen.getByText(/loading tactics/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/loading tactics/i)).not.toBeInTheDocument());
  });

  it('shows error state if fetch fails', async () => {
    (window.fetch as jest.Mock).mockImplementationOnce(mockFetchImpl({ tacticsError: true }));
    render(<ClubTacticsPage />);
    await waitFor(() => expect(screen.getByText(/failed to load data/i)).toBeInTheDocument());
  });

  it('displays tactics and specialists', async () => {
    render(<ClubTacticsPage />);
    expect(await screen.findByText('Formation')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4-3-3')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Attacking')).toBeInTheDocument();
    expect(screen.getByText(/Free Kick: John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/Penalty: Alex Smith/)).toBeInTheDocument();
  });

  it('can edit and save tactics', async () => {
    render(<ClubTacticsPage />);
    await screen.findByText('Formation');
    fireEvent.change(screen.getByDisplayValue('4-3-3'), { target: { value: '4-4-2' } });
    fireEvent.change(screen.getByDisplayValue('Attacking'), { target: { value: 'Defensive' } });
    fireEvent.click(screen.getByText('Save Tactics'));
    expect(await screen.findByText('Tactics updated!')).toBeInTheDocument();
  });

  it('shows error if saving tactics fails', async () => {
    (window.fetch as jest.Mock).mockImplementation(mockFetchImpl({ tacticsPatchError: true }));
    render(<ClubTacticsPage />);
    await screen.findByText('Formation');
    fireEvent.click(screen.getByText('Save Tactics'));
    expect(await screen.findByText(/failed to save tactics/i)).toBeInTheDocument();
  });

  it('can add a specialist', async () => {
    render(<ClubTacticsPage />);
    await screen.findByText('Set Piece Specialists');
    fireEvent.click(screen.getByText('+ Add Specialist'));
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'Corner' } });
    fireEvent.change(screen.getByLabelText('Player'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Skill'), { target: { value: '77' } });
    fireEvent.click(screen.getByText('Add Specialist'));
    expect(await screen.findByText('Specialist added!')).toBeInTheDocument();
  });

  it('shows error if adding specialist fails', async () => {
    (window.fetch as jest.Mock).mockImplementation(mockFetchImpl({ addError: true }));
    render(<ClubTacticsPage />);
    await screen.findByText('Set Piece Specialists');
    fireEvent.click(screen.getByText('+ Add Specialist'));
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'Corner' } });
    fireEvent.change(screen.getByLabelText('Player'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Skill'), { target: { value: '77' } });
    fireEvent.click(screen.getByText('Add Specialist'));
    expect(await screen.findByText(/failed to add specialist/i)).toBeInTheDocument();
  });

  it('can edit a specialist', async () => {
    render(<ClubTacticsPage />);
    await screen.findByText('Set Piece Specialists');
    fireEvent.click(screen.getAllByText('Edit')[0]);
    fireEvent.change(screen.getByLabelText('Skill'), { target: { value: '99' } });
    fireEvent.click(screen.getByText('Save'));
    expect(await screen.findByText('Specialist updated!')).toBeInTheDocument();
  });

  it('shows error if editing specialist fails', async () => {
    (window.fetch as jest.Mock).mockImplementation(mockFetchImpl({ editError: true }));
    render(<ClubTacticsPage />);
    await screen.findByText('Set Piece Specialists');
    fireEvent.click(screen.getAllByText('Edit')[0]);
    fireEvent.change(screen.getByLabelText('Skill'), { target: { value: '99' } });
    fireEvent.click(screen.getByText('Save'));
    expect(await screen.findByText(/failed to update specialist/i)).toBeInTheDocument();
  });

  it('can delete a specialist', async () => {
    render(<ClubTacticsPage />);
    await screen.findByText('Set Piece Specialists');
    fireEvent.click(screen.getAllByText('Delete')[0]);
    expect(await screen.findByText('Specialist deleted!')).toBeInTheDocument();
  });

  it('shows error if deleting specialist fails', async () => {
    (window.fetch as jest.Mock).mockImplementation(mockFetchImpl({ deleteError: true }));
    render(<ClubTacticsPage />);
    await screen.findByText('Set Piece Specialists');
    fireEvent.click(screen.getAllByText('Delete')[0]);
    expect(await screen.findByText(/failed to delete specialist/i)).toBeInTheDocument();
  });
}); 