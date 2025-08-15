import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import StaffManagementPage from './StaffManagementPage';

const mockStaff = [
  {
    id: 1,
    name: 'Jane Doe',
    role: 'Head Coach',
    skill: 90,
    hiredDate: '2023-07-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'John Smith',
    role: 'Scout',
    skill: 75,
    hiredDate: '2022-08-15T00:00:00Z'
  }
];

beforeEach(() => {
  global.fetch = jest.fn((url, options) => {
    if (url.includes('/api/staff/1') && (!options || options.method === 'GET')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ staff: mockStaff })
      });
    }
    if (url.includes('/api/staff/1') && options && options.method === 'POST') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }
    if (url.includes('/api/staff/1') && options && options.method === 'DELETE') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }
    if (url.includes('/api/staff/1') && options && options.method === 'PUT') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ staff: [] }) });
  }) as jest.Mock;
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders loading state', () => {
  (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));
  render(<StaffManagementPage />);
  expect(screen.getByText(/Loading/i)).toBeInTheDocument();
});

test('renders staff table after fetch', async () => {
  render(<StaffManagementPage />);
  await screen.findByText('Staff Management');
  expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  expect(screen.getByText('Head Coach')).toBeInTheDocument();
  expect(screen.getByText('John Smith')).toBeInTheDocument();
  expect(screen.getByText('Scout')).toBeInTheDocument();
});

test('renders error state on fetch failure', async () => {
  (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('API error')));
  render(<StaffManagementPage />);
  await screen.findByText(/Unknown error/i);
});

test('renders empty state if no staff', async () => {
  (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ staff: [] })
  }));
  render(<StaffManagementPage />);
  await screen.findByText('Staff Management');
  expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
  expect(screen.getByRole('table')).toBeInTheDocument();
});

// Modal interaction tests (hire, fire, edit) can be added here for full coverage 