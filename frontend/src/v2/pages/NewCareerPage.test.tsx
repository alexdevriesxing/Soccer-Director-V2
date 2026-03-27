import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import NewCareerPage from './NewCareerPage';
import { listCareers, listV2Clubs } from '../api';
import { renderV2 } from '../test/renderV2';

jest.mock('../api', () => ({
  createCareer: jest.fn(),
  deleteCareer: jest.fn(),
  listCareers: jest.fn(),
  listV2Clubs: jest.fn()
}));

jest.mock('../careerStore', () => ({
  clearActiveCareerId: jest.fn(),
  getActiveCareerId: jest.fn(),
  setActiveCareerId: jest.fn()
}));

const mockListCareers = listCareers as jest.MockedFunction<typeof listCareers>;
const mockListV2Clubs = listV2Clubs as jest.MockedFunction<typeof listV2Clubs>;

describe('NewCareerPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders club choices even while the careers list is still loading', async () => {
    mockListCareers.mockImplementation(() => new Promise(() => undefined));
    mockListV2Clubs.mockResolvedValue([
      {
        id: 1,
        name: 'Ajax',
        reputation: 90,
        leagueId: 1,
        leagueName: 'Eredivisie',
        leagueTier: 1,
        divisionType: 'PRO',
        ageCategory: 'SENIOR'
      }
    ]);

    renderV2(<NewCareerPage />, {
      route: '/new-career',
      path: '/new-career'
    });

    const clubSelect = await screen.findByTestId('new-career-club-select');

    await waitFor(() => {
      expect(clubSelect).toHaveTextContent('Ajax');
    });

    expect(screen.getByText('Loading careers...')).toBeInTheDocument();
    expect(screen.queryByTestId('new-career-club-error')).not.toBeInTheDocument();
    expect(screen.getByTestId('new-career-selected-club-panel')).toHaveTextContent('Choose a club to preview the save profile');
  });
});
