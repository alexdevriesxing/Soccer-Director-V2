import { Transfer } from '../types';

const API_BASE = process.env.REACT_APP_API_BASE || '';
const API_PREFIX = '/api';

// Helper function to make API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
    try {
        const response = await fetch(`${API_BASE}${API_PREFIX}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

export async function getLeagues() {
    return apiCall('/leagues');
}

export async function getHierarchicalLeagues() {
    return apiCall('/leagues/hierarchical');
}

export async function getLeague(id: string) {
    return apiCall(`/leagues/${id}`);
}

export async function getLeaguesByRegion(region: string) {
    return apiCall(`/leagues/region/${encodeURIComponent(region)}`);
}

export async function getLeaguesByTier(tier: string) {
    return apiCall(`/leagues/tier/${encodeURIComponent(tier)}`);
}

export async function getLeagueTable(leagueId: string) {
    // Backend expects /league/:leagueId/table (no /api/league-table/)
    return apiCall(`/league/${leagueId}/table`);
}

export async function getLeagueTopScorers(leagueId: string) {
    return apiCall(`/league-topscorers/${leagueId}`);
}

export async function getLeagueAssistLeaders(leagueId: string) {
    return apiCall(`/league-assistleaders/${leagueId}`);
}

export async function getLeagueYellowCards(leagueId: string) {
    return apiCall(`/league-yellowcards/${leagueId}`);
}

export async function getLeagueRedCards(leagueId: string) {
    return apiCall(`/league-redcards/${leagueId}`);
}

export async function getLeagueAppearances(leagueId: string) {
    return apiCall(`/league-appearances/${leagueId}`);
}

export async function getLeaguePlayerStats(leagueId: string) {
    return apiCall(`/league-playerstats/${leagueId}`);
}

// NOTE: /clubs requires region and division query params. Use /clubs/all for all clubs.
export async function getClubs() {
    return apiCall('/clubs/all');
}

export async function getClub(id: string) {
    return apiCall(`/clubs/${id}`);
}

export async function getClubsByDivision(leagueId: string) {
    return apiCall(`/leagues/${leagueId}`);
}

export async function getPlayers(params: { clubId?: string } = {}) {
    const queryParams = new URLSearchParams();
    if (params.clubId) queryParams.append('clubId', params.clubId);

    const endpoint = params.clubId ? `/players?${queryParams}` : '/players';
    return apiCall(endpoint);
}

export async function getPlayer(id: string) {
    return apiCall(`/players/${id}`);
}

export async function getFixtures(params: { leagueId?: string; clubId?: string; round?: number } = {}) {
    const queryParams = new URLSearchParams();
    if (params.leagueId) queryParams.append('leagueId', params.leagueId);
    if (params.clubId) {
        // Use the correct backend route for club fixtures
        return apiCall(`/club/${params.clubId}/fixtures`);
    }
    if (params.round) queryParams.append('round', params.round.toString());
    // If no clubId, fallback to league fixtures (if supported)
    const endpoint = queryParams.toString() ? `/fixtures?${queryParams}` : '/fixtures';
    return apiCall(endpoint);
}

export async function getFixture(id: string) {
    return apiCall(`/fixtures/${id}`);
}

export async function updateFixture(id: string, result: any) {
    return apiCall(`/fixtures/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ result }),
    });
}

export async function simulateFixture(id: string) {
    return apiCall(`/fixtures/${id}/simulate`, {
        method: 'POST',
    });
}

export async function simulateWeek(week: number) {
    return apiCall('/simulate-week', {
        method: 'POST',
        body: JSON.stringify({ week }),
    });
}

export async function getFixtureEvents(id: string) {
    return apiCall(`/fixtures/${id}/events`);
}

export async function getFixtureStats(id: string) {
    return apiCall(`/fixtures/${id}/stats`);
}

export async function getNews() {
    return apiCall('/news');
}

export async function postNews(newsItem: any) {
    return apiCall('/news', {
        method: 'POST',
        body: JSON.stringify(newsItem),
    });
}

export async function getTransfers(params?: { status?: string; clubId?: string; playerId?: string }): Promise<Transfer[]> {
    const query = params
        ? '?' + Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => `${k}=${v}`).join('&')
        : '';
    return apiCall(`/transfers${query}`);
}

export async function getTransfer(id: number): Promise<Transfer> {
    return apiCall(`/transfers/${id}`);
}

export async function createTransfer(data: Partial<Transfer>): Promise<Transfer> {
    return apiCall('/transfers', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateTransfer(id: number, data: Partial<Transfer>): Promise<Transfer> {
    return apiCall(`/transfers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function postTransfer(transfer: { playerId: string; fromClubId: string; toClubId: string; fee: number }) {
    return apiCall('/transfers', {
        method: 'POST',
        body: JSON.stringify(transfer),
    });
}

export async function getLoans() {
    return apiCall('/loans');
}

export async function postLoan(loan: { playerId: string; fromClubId: string; toClubId: string; startDate: string; endDate: string; fee?: number; recallable?: boolean }) {
    return apiCall('/loans', {
        method: 'POST',
        body: JSON.stringify(loan),
    });
}

export async function updateLoan(id: string, action: 'recall' | 'end') {
    return apiCall(`/loans/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ action }),
    });
}

export async function getLoansOut() {
    return apiCall('/loans/out');
}

export async function getLoansAvailable() {
    return apiCall('/loans/available');
}

export async function getTraining(clubId: string) {
    return apiCall(`/training?clubId=${clubId}`);
}

export async function postTrainingFocus(focus: { clubId: string; focus: string; playerId?: string; isExtra?: boolean }) {
    return apiCall('/training/focus', {
        method: 'POST',
        body: JSON.stringify(focus),
    });
}

export async function postTrainingStaff(staff: { clubId: string; name: string; role: string; skill: number }) {
    return apiCall('/training/staff', {
        method: 'POST',
        body: JSON.stringify(staff),
    });
}

export async function deleteTrainingStaff(id: string) {
    return apiCall(`/training/staff/${id}`, {
        method: 'DELETE',
    });
}

export async function getTrainingProgress(clubId: string) {
    return apiCall(`/training/progress?clubId=${clubId}`);
}

// Transfer market functions
export async function getTransferMarketPlayers(params: {
    position?: string;
    minSkill?: number;
    maxSkill?: number;
    nationality?: string;
    maxAge?: number;
} = {}) {
    const queryParams = new URLSearchParams();
    if (params.position) queryParams.append('position', params.position);
    if (params.minSkill) queryParams.append('minSkill', params.minSkill.toString());
    if (params.maxSkill) queryParams.append('maxSkill', params.maxSkill.toString());
    if (params.nationality) queryParams.append('nationality', params.nationality);
    if (params.maxAge) queryParams.append('maxAge', params.maxAge.toString());

    const endpoint = queryParams.toString() ? `/transfer-market?${queryParams}` : '/transfer-market';
    return apiCall(endpoint);
}

export async function getTransferMarketPlayer(playerId: string) {
    return apiCall(`/transfer-market/${playerId}`);
}

export async function submitTransferBid(playerId: string, bid: {
    bidAmount: number;
    biddingClubId: number;
    wageOffer: number;
    contractLength: number;
}) {
    return apiCall(`/transfer-market/${playerId}/bid`, {
        method: 'POST',
        body: JSON.stringify(bid),
    });
}

export async function negotiateTransfer(playerId: string, negotiation: {
    negotiationId: string;
    newBidAmount: number;
    newWageOffer: number;
    newContractLength: number;
}) {
    return apiCall(`/transfer-market/${playerId}/negotiate`, {
        method: 'POST',
        body: JSON.stringify(negotiation),
    });
}

// Friendly match functions - now using real backend
export async function getAvailableFriendlyDates(clubId: string) {
    return apiCall(`/friendly/available-dates?clubId=${clubId}`);
}

export async function scheduleFriendly(homeClubId: string, awayClubId: string, date: string) {
    return apiCall('/friendly/schedule', {
        method: 'POST',
        body: JSON.stringify({ homeClubId, awayClubId, date }),
    });
}

export async function cancelFriendly(id: string) {
    return apiCall(`/friendly/${id}/cancel`, {
        method: 'DELETE',
    });
}

// --- Formation & Strategy Endpoints ---
export async function getClubFormation(clubId: string) {
    return apiCall(`/clubs/${clubId}/formation`);
}

export async function updateClubFormation(clubId: string, formation: {
    formation: string;
    style: string;
    intensity: number;
    width: number;
    tempo: number;
}) {
    return apiCall(`/clubs/${clubId}/formation`, {
        method: 'PUT',
        body: JSON.stringify(formation),
    });
}

export async function getClubStrategy(clubId: string) {
    return apiCall(`/clubs/${clubId}/strategy`);
}

export async function updateClubStrategy(clubId: string, strategy: {
    approach: string;
    defensiveStyle: string;
    attackingStyle: string;
    setPieces: string;
    marking: string;
}) {
    return apiCall(`/clubs/${clubId}/strategy`, {
        method: 'PUT',
        body: JSON.stringify(strategy),
    });
}

// Fixture Scheduling API functions
export const generateSeasonSchedule = async () => {
    return apiCall('/fixtures/generate-season', {
        method: 'POST',
    });
};

export const getClubFixtures = async (clubId: number) => {
    return apiCall(`/fixtures/club/${clubId}`);
};

export const getNextFixture = async (clubId: number) => {
    return apiCall(`/fixtures/next/${clubId}`);
};

export const getAvailableWeeks = async (clubId: number) => {
    return apiCall(`/fixtures/available-weeks/${clubId}`);
};

export const getPotentialOpponents = async (clubId: number) => {
    return apiCall(`/fixtures/potential-opponents/${clubId}`);
};

export async function getClubTrainingFocus(clubId: string | number) {
    return apiCall(`/club/${clubId}/training-focus`);
}

export async function setClubTrainingFocus(clubId: string | number, trainingFocus: string) {
    return apiCall(`/club/${clubId}/training-focus`, {
        method: 'POST',
        body: JSON.stringify({ trainingFocus }),
    });
} 