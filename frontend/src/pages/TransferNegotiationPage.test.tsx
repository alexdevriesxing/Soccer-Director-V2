import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TransferNegotiationPage from './TransferNegotiationPage';

const mockPlayer = {
  id: 1,
  name: 'John Doe',
  nationality: 'Netherlands',
  position: 'Forward',
  age: 25,
  skill: 85,
  currentClub: 'Ajax',
  estimatedValue: 20000000,
  wage: 50000,
  agent: { name: 'Super Agent', style: 'Aggressive', reputation: 90 },
  ambition: 80,
  loyalty: 70
};

jest.mock('../api/footballApi', () => ({
  getTransferMarketPlayer: jest.fn((id) => {
    if (id === '1') return Promise.resolve(mockPlayer);
    if (id === '404') return Promise.resolve(null);
    return Promise.reject(new Error('API error'));
  })
}));

test('renders loading state', () => {
  render(
    <MemoryRouter initialEntries={[{ pathname: '/transfer-market/1', key: 'test', search: '', hash: '', state: null }]}> 
      <Routes>
        <Route path="/transfer-market/:id" element={<TransferNegotiationPage />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText(/Loading/i)).toBeInTheDocument();
});

test('renders transfer negotiation modal after fetch', async () => {
  render(
    <MemoryRouter initialEntries={[{ pathname: '/transfer-market/1', key: 'test', search: '', hash: '', state: null }]}> 
      <Routes>
        <Route path="/transfer-market/:id" element={<TransferNegotiationPage />} />
      </Routes>
    </MemoryRouter>
  );
  await screen.findByText(/Transfer Negotiation/i);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('Ajax')).toBeInTheDocument();
  expect(screen.getByText('Super Agent')).toBeInTheDocument();
});

test('renders error state on fetch failure', async () => {
  // Simulate API error
  jest.resetModules();
  jest.doMock('../api/footballApi', () => ({
    getTransferMarketPlayer: jest.fn(() => Promise.reject(new Error('API error')))
  }));
  const TransferNegotiationPageReloaded = (await import('./TransferNegotiationPage')).default;
  render(
    <MemoryRouter initialEntries={[{ pathname: '/transfer-market/2', key: 'test', search: '', hash: '', state: null }]}> 
      <Routes>
        <Route path="/transfer-market/:id" element={<TransferNegotiationPageReloaded />} />
      </Routes>
    </MemoryRouter>
  );
  await screen.findByText(/Failed to load player/i);
});

test('renders not found state if player not found', async () => {
  render(
    <MemoryRouter initialEntries={[{ pathname: '/transfer-market/404', key: 'test', search: '', hash: '', state: null }]}> 
      <Routes>
        <Route path="/transfer-market/:id" element={<TransferNegotiationPage />} />
      </Routes>
    </MemoryRouter>
  );
  await screen.findByText(/Player not found/i);
}); 