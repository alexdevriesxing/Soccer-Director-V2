import React, { useEffect, useState } from 'react';
import { useManagerProfile } from '../context/ManagerProfileContext';
import { getLeagueTable, getFixtures, getClub } from '../api/footballApi';
import { useNavigate } from 'react-router-dom';
import ClubAutocomplete, { ClubOption } from '../components/ClubAutocomplete';
import LoanDurationPicker from '../components/LoanDurationPicker';
import PlayerDetailsPopover from '../components/PlayerDetailsPopover';
import LoanOutModal from '../components/LoanOutModal';
import RecallConfirmModal from '../components/RecallConfirmModal';
import HireStaffModal from '../components/HireStaffModal';
import ConfirmFireModal from '../components/ConfirmFireModal';
import ExtraTrainingModal from '../components/ExtraTrainingModal';
import SeasonProgressionPanel from '../components/SeasonProgressionPanel';

const clubBadges: Record<string, string> = {
    ajax: '🔴',
    psv: '⚪️',
    feyenoord: '⚫️',
    utrecht: '🔵',
    az: '🟣',
    // ...add more as needed
};

const boardMessages = [
    'Board is pleased with your progress!',
    'Board expects you to reach the playoffs.',
    'Board is concerned about recent results.',
    'Fans are excited about your leadership!',
    'Media is speculating about your future.',
    'Board is delighted with your recent win streak!',
];

const avatarOptions = [
    '🧑‍💼', '🧔', '👩‍🦰', '👨‍🦱', '👩‍🦳', '👨‍🦳', '🧑‍🦲', '👩‍🦲', '🧑‍🎤', '🧑‍🚀', '🧑‍🏫', '🧑‍⚖️', '🧑‍🔬', '🧑‍💻', '🧑‍🌾', '🧑‍🍳', '🧑‍🎨', '🧑‍✈️', '🧑‍🚒', '🧑‍🔧', '🧑‍🏭',
];

const TABS = ['Overview', 'Loans', 'Training', 'Attendance'] as const;
type Tab = typeof TABS[number];

// Club badges and names for dropdowns/tables
const clubOptions = [
    { id: 'ajax', name: 'AFC Ajax', badge: '🔴' },
    { id: 'psv', name: 'PSV Eindhoven', badge: '⚪️' },
    { id: 'feyenoord', name: 'Feyenoord', badge: '⚫️' },
    { id: 'utrecht', name: 'FC Utrecht', badge: '🔵' },
    { id: 'az', name: 'AZ Alkmaar', badge: '🟣' },
    // ...add all clubs here
];
function getClubOption(id: string) {
    return clubOptions.find(c => c.id === id) || { id, name: id, badge: '🏟️' };
}

const staffRoles = ['Head Coach', 'Assistant', 'Fitness Coach', 'Goalkeeping Coach'];

// --- Refined LoanOutModal ---
type LoanOutModalState = {
    type: 'loanOut';
    player: any;
    onConfirm: (toClubId: string, fee: number, endDate: string) => void;
    onCancel: () => void;
};
// --- Refined RecallConfirmModal ---
type RecallConfirmModalState = {
    type: 'recallConfirm';
    loanId: string;
    playerName: string;
    onConfirm: () => void;
    onCancel: () => void;
};

// Staff role icons
const staffRoleIcons: Record<string, string> = {
    'Head Coach': '🧑‍🏫',
    'Assistant': '🧑‍💼',
    'Fitness Coach': '🏋️',
    'Goalkeeping Coach': '🧤',
};
function getSkillColor(skill: number) {
    if (skill >= 80) return 'text-green-600 font-bold';
    if (skill >= 50) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
}

// Simple ErrorBoundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }
    componentDidCatch(error: any, errorInfo: any) {
        // Log error if needed
    }
    render() {
        if (this.state.hasError) {
            return <div className="p-8 text-center text-red-700 bg-red-100 rounded">Something went wrong: {this.state.error?.message || 'Unknown error'}</div>;
        }
        return this.props.children;
    }
}

const ManagerDashboardPage: React.FC = () => {
    const { profile } = useManagerProfile();
    const [leagueTable, setLeagueTable] = useState<any>(null);
    const [fixtures, setFixtures] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [simulating, setSimulating] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [fixtureModal, setFixtureModal] = useState<any | null>(null);
    const [boardMsg, setBoardMsg] = useState('');
    const [boardConfidence, setBoardConfidence] = useState(80); // 0-100
    const [recentBoardFeed, setRecentBoardFeed] = useState<string[]>([]);
    const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
    const [squad, setSquad] = useState<any[]>([]);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<Tab>('Overview');
    // Loans state
    const [loansOut, setLoansOut] = useState<any[]>([]);
    const [loansAvailable, setLoansAvailable] = useState<any[]>([]);
    const [loansLoading, setLoansLoading] = useState(false);
    // Training state
    const [trainingProgress, setTrainingProgress] = useState<any[]>([]);
    const [trainingLoading, setTrainingLoading] = useState(false);
    const [clubStaff, setClubStaff] = useState<any[]>([]);
    const [trainingFocus, setTrainingFocus] = useState<any[]>([]);
    // UI state for modals/confirmations
    const [modal, setModal] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState(false);
    // In Loans and Training tables, wrap player names with a span that shows PlayerDetailsPopover on hover/click
    // Use local state: hoveredPlayerId for each table
    const [hoveredLoanPlayerId, setHoveredLoanPlayerId] = useState<string | null>(null);
    const [hoveredTrainingPlayerId, setHoveredTrainingPlayerId] = useState<string | null>(null);
    const [simulationSummary, setSimulationSummary] = useState<any>(null);
    const [currentWeek, setCurrentWeek] = useState<number>(1);
    // Attendance analytics state
    const [attendanceData, setAttendanceData] = useState<any>(null);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [attendanceError, setAttendanceError] = useState<string | null>(null);

    useEffect(() => {
        if (!profile) return;
        setLoading(true);
        setError(null);
        Promise.all([
            getLeagueTable(profile.club),
            getFixtures({ clubId: profile.club }),
            getClub(profile.club),
        ])
            .then(([table, clubFixtures, clubData]) => {
                setLeagueTable(table);
                setFixtures(clubFixtures);
                setSquad(clubData.squad || []);
                setLoading(false);

                // Generate board message based on actual performance
                const recentResults = clubFixtures.slice(-5).filter((f: any) => f.played);
                const wins = recentResults.filter((f: any) => {
                    const isHome = f.homeClubId === profile.club;
                    return isHome ? f.homeGoals > f.awayGoals : f.awayGoals > f.homeGoals;
                }).length;

                let boardMsg = '';
                let confidence = 80;

                if (wins >= 4) {
                    boardMsg = 'Board is delighted with your recent win streak!';
                    confidence = 95;
                } else if (wins >= 3) {
                    boardMsg = 'Board is pleased with your progress!';
                    confidence = 85;
                } else if (wins >= 2) {
                    boardMsg = 'Board expects you to reach the playoffs.';
                    confidence = 75;
                } else if (wins >= 1) {
                    boardMsg = 'Board is concerned about recent results.';
                    confidence = 65;
                } else {
                    boardMsg = 'Board is very concerned about recent results.';
                    confidence = 50;
                }

                setBoardMsg(boardMsg);
                setRecentBoardFeed((feed) => [boardMsg, ...feed.slice(0, 4)]);
                setBoardConfidence(confidence);
            })
            .catch((e) => {
                setError(e.message);
                setLoading(false);
            });
    }, [profile]);

    // Fetch loans data
    const refreshLoans = () => {
        if (!profile) return;
        setLoansLoading(true);
        Promise.all([
            fetch('/api/loans/out').then(r => r.json()),
            fetch('/api/loans/available').then(r => r.json()),
        ]).then(([out, available]) => {
            setLoansOut(out);
            setLoansAvailable(available);
            setLoansLoading(false);
        });
    };
    useEffect(() => {
        if (activeTab !== 'Loans' || !profile) return;
        refreshLoans();
    }, [activeTab, profile]);

    // Fetch training data
    const refreshTraining = () => {
        if (!profile) return;
        setTrainingLoading(true);
        Promise.all([
            fetch(`/api/training/progress?clubId=${profile.club}`).then(r => r.json()),
            fetch(`/api/training?clubId=${profile.club}`).then(r => r.json()),
        ]).then(([progress, { staff, focus }]) => {
            setTrainingProgress(progress);
            setClubStaff(staff);
            setTrainingFocus(focus);
            setTrainingLoading(false);
        });
    };
    useEffect(() => {
        if (activeTab !== 'Training' || !profile) return;
        refreshTraining();
    }, [activeTab, profile]);

    // Fetch attendance analytics when Attendance tab is selected
    useEffect(() => {
        if (activeTab !== 'Attendance') return;
        setAttendanceLoading(true);
        setAttendanceError(null);
        fetch('/api/attendance/analytics')
            .then(res => res.json())
            .then(data => {
                setAttendanceData(data);
                setAttendanceLoading(false);
            })
            .catch(e => {
                setAttendanceError(e.message);
                setAttendanceLoading(false);
            });
    }, [activeTab]);

    // --- Notification helper ---
    function showNotification(type: 'success' | 'error', message: string) {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    }

    // --- Loans Actions ---
    async function handleRecallLoan(loanId: string) {
        if (!profile) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/loans/${loanId}/recall`, { method: 'PATCH' });
            if (!res.ok) throw new Error('Recall failed');
            showNotification('success', 'Player recalled successfully.');
        } catch {
            showNotification('error', 'Failed to recall player.');
        }
        refreshLoans();
        setActionLoading(false);
    }
    async function handleLoanOut(player: any) {
        if (!profile) return;
        setModal({
            type: 'loanOut',
            player,
            onConfirm: async (toClubId: string, fee: number, endDate: string) => {
                setActionLoading(true);
                try {
                    const res = await fetch('/api/loans', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            playerId: player.id,
                            fromClubId: player.clubId,
                            toClubId,
                            startDate: new Date().toISOString(),
                            endDate,
                            fee,
                            recallable: true,
                        }),
                    });
                    if (!res.ok) throw new Error('Loan out failed');
                    showNotification('success', 'Player loaned out successfully.');
                } catch {
                    showNotification('error', 'Failed to loan out player.');
                }
                setModal(null);
                refreshLoans();
                setActionLoading(false);
            },
            onCancel: () => setModal(null),
        });
    }

    // --- Training Actions ---
    async function handleAssignExtraTraining(playerId: string, focus: string) {
        if (!profile) return;
        setActionLoading(true);
        try {
            const res = await fetch('/api/training/focus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clubId: profile.club,
                    focus,
                    playerId,
                    isExtra: true,
                }),
            });
            if (!res.ok) throw new Error('Assign failed');
            showNotification('success', `Extra training assigned to ${focus}.`);
        } catch {
            showNotification('error', 'Failed to assign extra training.');
        }
        refreshTraining();
        setActionLoading(false);
    }
    async function handleHireStaff() {
        if (!profile) return;
        setModal({
            type: 'hireStaff',
            onConfirm: async (name: string, role: string, skill: number) => {
                setActionLoading(true);
                try {
                    const res = await fetch('/api/training/staff', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ clubId: profile.club, name, role, skill }),
                    });
                    if (!res.ok) throw new Error('Hire failed');
                    showNotification('success', 'Staff hired.');
                } catch {
                    showNotification('error', 'Failed to hire staff.');
                }
                setModal(null);
                refreshTraining();
                setActionLoading(false);
            },
            onCancel: () => setModal(null),
        });
    }
    async function handleFireStaff(staffId: string) {
        if (!profile) return;
        setModal({
            type: 'confirmFire',
            staffId,
            onConfirm: async () => {
                setActionLoading(true);
                try {
                    const res = await fetch(`/api/training/staff/${staffId}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Fire failed');
                    showNotification('success', 'Staff fired.');
                } catch {
                    showNotification('error', 'Failed to fire staff.');
                }
                setModal(null);
                refreshTraining();
                setActionLoading(false);
            },
            onCancel: () => setModal(null),
        });
    }
    async function handleSetTeamFocus(focus: string) {
        if (!profile) return;
        setActionLoading(true);
        try {
            const res = await fetch('/api/training/focus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clubId: profile.club, focus, isExtra: false }),
            });
            if (!res.ok) throw new Error('Set focus failed');
            showNotification('success', `Team focus set to ${focus}.`);
        } catch {
            showNotification('error', 'Failed to set team focus.');
        }
        refreshTraining();
        setActionLoading(false);
    }

    // --- Modals ---
    function renderModal() {
        if (!modal) return null;
        if (modal.type === 'loanOut') {
            const { player, onConfirm, onCancel } = modal as LoanOutModalState;
            const clubChoices = clubOptions.filter(c => c.id !== player.clubId);
            return (
                <LoanOutModal
                    player={player}
                    clubOptions={clubChoices}
                    onConfirm={onConfirm}
                    onCancel={onCancel}
                    loading={actionLoading}
                    suggestedFee={Math.round((player.skill || 50) * 10)}
                />
            );
        }
        if (modal.type === 'hireStaff') {
            const { onConfirm, onCancel } = modal;
            return (
                <HireStaffModal
                    onConfirm={onConfirm}
                    onCancel={onCancel}
                    loading={actionLoading}
                    staffRoles={staffRoles}
                />
            );
        }
        if (modal.type === 'confirmFire') {
            const { onConfirm, onCancel, staffName } = modal;
            return (
                <ConfirmFireModal
                    staffName={staffName}
                    onConfirm={onConfirm}
                    onCancel={onCancel}
                    loading={actionLoading}
                />
            );
        }
        if (modal.type === 'extraTraining') {
            const { player, onConfirm, onCancel } = modal;
            const focusOptions = ['Fitness', 'Shooting', 'Passing', 'Tactics', 'Defense', 'Attack'];
            return (
                <ExtraTrainingModal
                    playerName={player.name}
                    onConfirm={onConfirm}
                    onCancel={onCancel}
                    loading={actionLoading}
                    focusOptions={focusOptions}
                />
            );
        }
        return null;
    }

    async function handleSimulateWeek() {
        setSimulating(true);
        setError(null);
        setSimulationSummary(null);
        try {
            const response = await fetch('/league/simulate/week/' + currentWeek, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to simulate week');
            const summary = await response.json();
            setSimulationSummary(summary);
            setNotification({ type: 'success', message: 'Week simulated!' });
            setTimeout(() => setNotification(null), 2000);
            // Update week number if present in summary
            if (summary && summary.week) {
                setCurrentWeek(summary.week + 1);
            } else {
                setCurrentWeek(currentWeek + 1);
            }
            // Merge new match results into fixtures
            if (summary && summary.matches && Array.isArray(summary.matches)) {
                setFixtures(prev => [
                    ...summary.matches.map((m: any) => ({
                        id: m.fixtureId,
                        date: `Week ${summary.week}`,
                        homeClubId: m.homeClub,
                        awayClubId: m.awayClub,
                        played: true,
                        result: { homeGoals: m.homeGoals, awayGoals: m.awayGoals, headline: '' }
                    })),
                    ...prev
                ]);
            }
            // Merge new player development into trainingProgress
            if (summary && summary.playerDevelopment && Array.isArray(summary.playerDevelopment)) {
                setTrainingProgress(prev => [
                    ...summary.playerDevelopment.map((pd: any, i: number) => ({
                        id: `${pd.player}-${summary.week}-${i}`,
                        name: pd.player,
                        club: pd.club,
                        skillGain: pd.skillGain,
                        newSkill: pd.newSkill,
                        isInjured: pd.isInjured
                    })),
                    ...prev
                ]);
            }
            // Refresh dashboard
            if (profile) {
                const [table, clubFixtures] = await Promise.all([
                    getLeagueTable(profile.club),
                    getFixtures({ clubId: profile.club }),
                ]);
                setLeagueTable(table);
                setFixtures(clubFixtures);
                const msg = boardMessages[Math.floor(Math.random() * boardMessages.length)];
                setBoardMsg(msg);
                setRecentBoardFeed((feed) => [msg, ...feed.slice(0, 4)]);
                setBoardConfidence(Math.floor(60 + Math.random() * 40));
            }
        } catch (e: any) {
            setError(e.message || 'Failed to simulate week.');
        } finally {
            setSimulating(false);
        }
    }

    if (!profile) {
        return <div className="p-8 text-center text-lg">No manager profile found.</div>;
    }

    // Find club info and league position
    const clubInfo = leagueTable?.table?.find((c: any) => c.name === profile.club);
    const leagueName = leagueTable?.league;
    const leaguePosition = clubInfo?.position;
    const totalTeams = leagueTable?.table?.length;

    // Next fixture
    const nextFixture = fixtures.find((f: any) => !f.played);
    // Recent results (last 5 played)
    const recentResults = fixtures.filter((f: any) => f.played).slice(-5).reverse();

    // Placeholder stats
    const seasonsManaged = 1;
    const wins = recentResults.filter((f: any) => (f.result?.homeGoals > f.result?.awayGoals && f.homeClubId === clubInfo?.id) || (f.result?.awayGoals > f.result?.homeGoals && f.awayClubId === clubInfo?.id)).length;
    const draws = recentResults.filter((f: any) => f.result?.homeGoals === f.result?.awayGoals).length;
    const losses = recentResults.length - wins - draws;
    const trophies = 0;
    const boardExpectation = 'Reach playoffs';
    const totalMatches = wins + draws + losses;
    const winPct = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
    const promotions = 0; // Placeholder
    const relegations = 0; // Placeholder
    const jobOffers = 0; // Placeholder
    const sackingThreat = false; // Placeholder

    // Placeholder season history
    const seasonHistory = [
        { season: '2024/25', club: profile.club, league: leagueName, finish: leaguePosition, trophies: 0, promoted: false, relegated: false },
        { season: '2023/24', club: profile.club, league: leagueName, finish: 7, trophies: 0, promoted: false, relegated: false },
        { season: '2022/23', club: profile.club, league: leagueName, finish: 12, trophies: 0, promoted: false, relegated: false },
    ];

    // Placeholder career timeline
    const careerTimeline = [
        { year: 2022, event: `Appointed manager of ${profile.club}` },
        { year: 2023, event: 'Finished 12th in league' },
        { year: 2024, event: 'Finished 7th in league' },
        { year: 2025, event: 'Current season' },
    ];

    function clubNameWithBadge(clubId: string) {
        return (
            <span
                className="inline-flex items-center gap-1 cursor-pointer hover:underline"
                onClick={() => navigate('/clubs', { state: { clubId } })}
            >
                <span>{clubBadges[clubId] || '🏟️'}</span>
                <span>{clubId}</span>
            </span>
        );
    }

    function handleShowDetails(fixture: any) {
        setFixtureModal(fixture);
    }

    return (
        <ErrorBoundary>
            <div className="max-w-3xl mx-auto p-4">
                {notification && (
                    <div className={`mb-4 p-3 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        role="alert" aria-live="polite">
                        {notification.message}
                        <button className="float-right text-lg font-bold ml-4" onClick={() => setNotification(null)} aria-label="Dismiss notification">×</button>
                    </div>
                )}
                {renderModal()}
                <h1 className="text-2xl font-bold mb-4">Manager Dashboard</h1>
                {/* Tabs */}
                <div className="mb-6 flex gap-4">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            className={`px-3 py-2 rounded font-semibold shadow ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                            onClick={() => setActiveTab(tab)}
                            aria-label={`Show ${tab}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                {/* Navigation Section */}
                <div className="mb-8 flex flex-wrap gap-4 justify-center">
                    <button onClick={() => navigate('/transfer-market')} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors">Transfers</button>
                    <button onClick={() => navigate('/finances')} className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors">Finances</button>
                    <button onClick={() => navigate('/facilities')} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold transition-colors">Facilities</button>
                    <button onClick={() => navigate('/compliance')} className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-semibold transition-colors">Compliance</button>
                    <button onClick={() => navigate('/stadium')} className="px-6 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-semibold transition-colors">Stadium</button>
                    <button onClick={() => navigate('/club-history')} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors">Club History</button>
                    <button onClick={() => navigate('/fixtures')} className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold transition-colors">Friendlies</button>
                    <button
                        className="bg-indigo-600 text-white px-6 py-2 rounded shadow hover:bg-indigo-700"
                        onClick={() => navigate('/team-selection')}
                    >
                        Team Selection & Tactics
                    </button>
                    <button
                        className="bg-green-700 text-white px-6 py-2 rounded shadow hover:bg-green-800"
                        onClick={() => navigate('/staff-management')}
                    >
                        Staff Management
                    </button>
                    <button
                        className="bg-yellow-700 text-white px-6 py-2 rounded shadow hover:bg-yellow-800"
                        onClick={() => navigate('/scouting-management')}
                    >
                        Scouting Management
                    </button>
                    <button
                        className="bg-pink-700 text-white px-6 py-2 rounded shadow hover:bg-pink-800"
                        onClick={() => navigate('/youth-academy')}
                    >
                        Youth Academy
                    </button>
                </div>
                {/* Tab Content */}
                {activeTab === 'Overview' && (
                    <React.Fragment>
                        {/* Current Week Display */}
                        <div className="mb-2 text-xl font-bold">Current Week: {currentWeek}</div>
                        {/* Avatar Picker */}
                        <div className="mb-4 flex items-center gap-4">
                            <span className="text-4xl">{selectedAvatar}</span>
                            <div>
                                <label className="font-medium mr-2">Avatar:</label>
                                <select
                                    className="border rounded px-2 py-1"
                                    value={selectedAvatar}
                                    onChange={e => setSelectedAvatar(e.target.value)}
                                >
                                    {avatarOptions.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {/* Quick Links */}
                        <div className="mb-6 flex gap-4">
                            <button className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow" onClick={() => navigate('/clubs', { state: { clubId: profile.club } })}>View Squad</button>
                            <button className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow" onClick={() => navigate('/fixtures', { state: { clubId: profile.club } })}>View Fixtures</button>
                            <button className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow" onClick={() => navigate('/')}>View League Table</button>
                        </div>
                        {/* Board Confidence & Feed */}
                        <div className="mb-6 bg-white dark:bg-gray-900 rounded shadow p-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="font-semibold">Board Confidence:</div>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded">
                                        <div className="h-3 rounded bg-green-500" style={{ width: `${boardConfidence}%` }}></div>
                                    </div>
                                    <span className="text-2xl">{boardConfidence > 80 ? '😃' : boardConfidence > 60 ? '😐' : '😟'}</span>
                                    <span className="text-xs text-gray-500">{boardConfidence}%</span>
                                </div>
                            </div>
                            <div className="mb-2 text-gray-500">Board Feedback: <span className="font-semibold">{boardMsg}</span></div>
                            <div className="mb-2 text-gray-500">Recent Board Messages:</div>
                            <ul className="list-disc ml-6 text-sm text-gray-700 dark:text-gray-300">
                                {recentBoardFeed.map((msg, i) => (
                                    <li key={i}>{msg}</li>
                                ))}
                            </ul>
                        </div>
                        {/* Career Stats */}
                        <div className="mb-6 bg-white dark:bg-gray-900 rounded shadow p-4">
                            <div className="mb-2 text-lg font-semibold">Career Stats</div>
                            <div className="mb-2 text-gray-500">Seasons Managed: <span className="font-semibold">{seasonsManaged}</span></div>
                            <div className="mb-2 text-gray-500">Total Matches: <span className="font-semibold">{totalMatches}</span></div>
                            <div className="mb-2 text-gray-500">Record: <span className="font-semibold">{wins}W {draws}D {losses}L</span> (<span className="font-semibold">{winPct}%</span> win)</div>
                            <div className="mb-2 text-gray-500">Trophies: <span className="font-semibold">{trophies}</span></div>
                            <div className="mb-2 text-gray-500">Promotions: <span className="font-semibold">{promotions}</span></div>
                            <div className="mb-2 text-gray-500">Relegations: <span className="font-semibold">{relegations}</span></div>
                            <div className="mb-2 text-gray-500">Job Offers: <span className="font-semibold">{jobOffers}</span></div>
                            {sackingThreat && <div className="mb-2 text-red-500 font-semibold">Warning: Board is considering your position!</div>}
                            <div className="mb-2 text-gray-500">Contract: <span className="font-semibold">2 years left (placeholder)</span></div>
                            <div className="mb-2 text-gray-500">Transfer Window: <span className="font-semibold">Closed (placeholder)</span></div>
                        </div>
                        {/* Key Player Contracts & Transfers */}
                        {!loading && squad.length > 0 && (
                            <div className="mb-6 bg-white dark:bg-gray-900 rounded shadow p-4">
                                <div className="mb-2 text-lg font-semibold">Key Player Contracts & Transfers</div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border text-sm">
                                        <thead>
                                            <tr className="bg-gray-100 dark:bg-gray-800">
                                                <th className="px-2 py-1">Name</th>
                                                <th className="px-2 py-1">Pos</th>
                                                <th className="px-2 py-1">Contract</th>
                                                <th className="px-2 py-1">Expiry</th>
                                                <th className="px-2 py-1">Value</th>
                                                <th className="px-2 py-1">Transfer</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {squad.slice(0, 8).map((p: any) => (
                                                <tr key={p.id} className="border-b">
                                                    <td className="px-2 py-1">
                                                        <span
                                                            className="relative cursor-pointer underline text-blue-700"
                                                            onMouseEnter={() => setHoveredLoanPlayerId(p.id)}
                                                            onMouseLeave={() => setHoveredLoanPlayerId(null)}
                                                            tabIndex={0}
                                                            aria-label={`Show details for ${p.name}`}
                                                        >
                                                            {p.name}
                                                            {hoveredLoanPlayerId === p.id && p && (
                                                                <div className="absolute left-0 top-6 z-50"><PlayerDetailsPopover player={p} /></div>
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-1 text-center">{p.position}</td>
                                                    <td className="px-2 py-1 text-center">{p.contractYears ?? '-'}</td>
                                                    <td className="px-2 py-1 text-center">{p.contractExpiry ?? '-'}</td>
                                                    <td className="px-2 py-1 text-center">{p.contractValue ? `€${p.contractValue.toLocaleString()}` : '-'}</td>
                                                    <td className="px-2 py-1 text-center">{p.isTransferListed ? <span className="text-yellow-600">Listed</span> : p.isOnLoan ? <span className="text-purple-600">On Loan</span> : <span className="text-gray-500">-</span>}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {/* Season History */}
                        <div className="mb-6 bg-white dark:bg-gray-900 rounded shadow p-4">
                            <div className="mb-2 text-lg font-semibold">Season History</div>
                            <table className="min-w-full border text-sm">
                                <thead>
                                    <tr className="bg-gray-100 dark:bg-gray-800">
                                        <th className="px-2 py-1">Season</th>
                                        <th className="px-2 py-1">Club</th>
                                        <th className="px-2 py-1">League</th>
                                        <th className="px-2 py-1">Finish</th>
                                        <th className="px-2 py-1">Trophies</th>
                                        <th className="px-2 py-1">Promoted</th>
                                        <th className="px-2 py-1">Relegated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {seasonHistory.map((s, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="px-2 py-1 text-center">{s.season}</td>
                                            <td className="px-2 py-1 text-center">{clubNameWithBadge(s.club)}</td>
                                            <td className="px-2 py-1 text-center">{s.league}</td>
                                            <td className="px-2 py-1 text-center">{s.finish}</td>
                                            <td className="px-2 py-1 text-center">{s.trophies}</td>
                                            <td className="px-2 py-1 text-center">{s.promoted ? '✅' : ''}</td>
                                            <td className="px-2 py-1 text-center">{s.relegated ? '❌' : ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Career Timeline */}
                        <div className="mb-6 bg-white dark:bg-gray-900 rounded shadow p-4">
                            <div className="mb-2 text-lg font-semibold">Career Timeline</div>
                            <div className="flex flex-col gap-2">
                                {careerTimeline.map((e, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <div className="text-xs text-gray-500">{e.year}</div>
                                        <div className="text-sm">{e.event}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Next Fixture */}
                        <div className="mb-6 bg-white dark:bg-gray-900 rounded shadow p-4">
                            <h2 className="text-lg font-semibold mb-2">Next Fixture</h2>
                            {nextFixture ? (
                                <div>
                                    <div className="mb-1">{nextFixture.date}: <span className="font-semibold">{clubNameWithBadge(nextFixture.homeClubId)} vs {clubNameWithBadge(nextFixture.awayClubId)}</span></div>
                                    <div className="mb-1 text-gray-500">Status: {nextFixture.played ? 'Played' : 'Upcoming'}</div>
                                </div>
                            ) : (
                                <div className="text-gray-500">No upcoming fixtures.</div>
                            )}
                        </div>
                        {/* Recent Results */}
                        <div className="mb-6 bg-white dark:bg-gray-900 rounded shadow p-4">
                            <h2 className="text-lg font-semibold mb-2">Recent Results</h2>
                            {recentResults.length > 0 ? (
                                <table className="min-w-full border text-sm">
                                    <thead>
                                        <tr className="bg-gray-100 dark:bg-gray-800">
                                            <th className="px-2 py-1">Date</th>
                                            <th className="px-2 py-1">Home</th>
                                            <th className="px-2 py-1">Away</th>
                                            <th className="px-2 py-1">Result</th>
                                            <th className="px-2 py-1">Headline</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentResults.map((f: any) => (
                                            <tr
                                                key={f.id}
                                                className="border-b hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer"
                                                onClick={() => handleShowDetails(f)}
                                            >
                                                <td className="px-2 py-1 text-center">{f.date}</td>
                                                <td className="px-2 py-1 text-center">{clubNameWithBadge(f.homeClubId)}</td>
                                                <td className="px-2 py-1 text-center">{clubNameWithBadge(f.awayClubId)}</td>
                                                <td className="px-2 py-1 text-center">{f.result ? `${f.result.homeGoals} - ${f.result.awayGoals}` : '-'}</td>
                                                <td className="px-2 py-1">{f.result?.headline}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-gray-500">No recent results.</div>
                            )}
                        </div>
                        {/* Advance Week Button */}
                        <div className="mb-4">
                            <button
                                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold shadow"
                                onClick={handleSimulateWeek}
                                disabled={simulating}
                            >
                                {simulating ? 'Simulating...' : 'Advance Week'}
                            </button>
                            {error && <div className="text-red-600 mt-2">{error}</div>}
                        </div>
                        {/* Simulation Summary */}
                        {simulationSummary && (
                            <div className="mb-6 bg-white dark:bg-gray-900 rounded shadow p-4">
                                <div className="mb-2 text-lg font-semibold">Simulation Summary</div>
                                {simulationSummary.week && (
                                    <div className="mb-2">Week: <span className="font-bold">{simulationSummary.week}</span></div>
                                )}
                                {/* Match Results */}
                                {simulationSummary.matches && simulationSummary.matches.length > 0 && (
                                    <div className="mb-4">
                                        <div className="font-semibold mb-1">Match Results</div>
                                        <table className="min-w-full text-xs border">
                                            <thead>
                                                <tr className="bg-gray-100 dark:bg-gray-800">
                                                    <th className="px-2 py-1">Home</th>
                                                    <th className="px-2 py-1">Away</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {simulationSummary.matches.map((m: any, i: number) => (
                                                    <tr key={i} className="border-b">
                                                        <td className="px-2 py-1">{m.homeClub}</td>
                                                        <td className="px-2 py-1">{m.awayClub}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                {/* Player Development */}
                                {simulationSummary.playerDevelopment && simulationSummary.playerDevelopment.length > 0 && (
                                    <div className="mb-4">
                                        <div className="font-semibold mb-1">Notable Player Development</div>
                                        <ul className="list-disc ml-6">
                                            {simulationSummary.playerDevelopment.map((pd: any, i: number) => (
                                                <li key={i}>
                                                    <span className="font-bold">{pd.player}</span> ({pd.club}): +{pd.skillGain} skill{pd.newSkill ? ` (New skill: ${pd.newSkill})` : ''}{pd.isInjured ? ' (Injured)' : ''}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {/* Injuries */}
                                {simulationSummary.playerDevelopment && simulationSummary.playerDevelopment.some((pd: any) => pd.isInjured) && (
                                    <div className="mb-4">
                                        <div className="font-semibold mb-1">Injuries</div>
                                        <ul className="list-disc ml-6">
                                            {simulationSummary.playerDevelopment.filter((pd: any) => pd.isInjured).map((inj: any, i: number) => (
                                                <li key={i}>
                                                    <span className="font-bold">{inj.player}</span> ({inj.club})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Match Details Modal */}
                        {fixtureModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setFixtureModal(null)}>
                                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 max-w-lg w-full relative" onClick={e => e.stopPropagation()}>
                                    <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl" onClick={() => setFixtureModal(null)}>&times;</button>
                                    <h2 className="text-xl font-bold mb-2">Match Details</h2>
                                    <div className="mb-2 text-gray-500">Date: <span className="font-semibold">{fixtureModal.date}</span></div>
                                    <div className="mb-2 text-gray-500">Home: {clubNameWithBadge(fixtureModal.homeClubId)}</div>
                                    <div className="mb-2 text-gray-500">Away: {clubNameWithBadge(fixtureModal.awayClubId)}</div>
                                    <div className="mb-2 text-gray-500">Status: {fixtureModal.played ? 'Played' : 'Upcoming'}</div>
                                    {fixtureModal.played && fixtureModal.result && (
                                        <>
                                            <div className="mb-2 text-gray-500">Result: <span className="font-semibold">{fixtureModal.result.homeGoals} - {fixtureModal.result.awayGoals}</span></div>
                                            <div className="mb-2 text-gray-500">Weather: <span className="font-semibold">{fixtureModal.result.weather}</span></div>
                                            <div className="mb-2 text-gray-500">Headline: <span className="font-semibold">{fixtureModal.result.headline}</span></div>
                                            <div className="mb-2">
                                                <div className="font-semibold mb-1">Scorers:</div>
                                                {fixtureModal.result.scorers.length > 0 ? (
                                                    <ul className="list-disc ml-6">
                                                        {fixtureModal.result.scorers.map((s: any, i: number) => (
                                                            <li key={i}>Player {s.playerId} ({s.minute}')
                                                                {s.assists && s.assists.length > 0 && (
                                                                    <span className="ml-2 text-xs text-gray-500">Assists: {s.assists.join(', ')}</span>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : <span className="text-gray-400">None</span>}
                                            </div>
                                            <div className="mb-2">
                                                <div className="font-semibold mb-1">Cards:</div>
                                                {fixtureModal.result.cards.length > 0 ? (
                                                    <ul className="list-disc ml-6">
                                                        {fixtureModal.result.cards.map((c: any, i: number) => (
                                                            <li key={i}>Player {c.playerId} - {c.type} ({c.minute}')</li>
                                                        ))}
                                                    </ul>
                                                ) : <span className="text-gray-400">None</span>}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                )}
                {activeTab === 'Loans' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Players Out on Loan</h2>
                        {loansLoading || actionLoading ? <div>Loading...</div> : (
                            <table className="w-full mb-6">
                                <thead>
                                    <tr>
                                        <th>Name</th><th>To Club</th><th>Skill</th><th>Morale</th><th>Appearances</th><th>Development</th><th>Recall</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loansOut.map(l => (
                                        <tr key={l.id} className="border-b">
                                            <td>
                                                <span
                                                    className="relative cursor-pointer underline text-blue-700"
                                                    onMouseEnter={() => setHoveredLoanPlayerId(l.player?.id)}
                                                    onMouseLeave={() => setHoveredLoanPlayerId(null)}
                                                    tabIndex={0}
                                                    aria-label={`Show details for ${l.player?.name}`}
                                                >
                                                    {l.player?.name}
                                                    {hoveredLoanPlayerId === l.player?.id && l.player && (
                                                        <div className="absolute left-0 top-6 z-50"><PlayerDetailsPopover player={l.player} /></div>
                                                    )}
                                                </span>
                                            </td>
                                            <td>{getClubOption(l.toClubId).badge} {getClubOption(l.toClubId).name}</td>
                                            <td>{l.player?.skill}</td>
                                            <td>{l.player?.morale}</td>
                                            <td>{l.player?.appearances}</td>
                                            <td>{l.player?.development}</td>
                                            <td>{l.recallable ? <button className="px-2 py-1 bg-yellow-500 text-white rounded disabled:opacity-50" onClick={() => handleRecallLoan(l.id)} disabled={actionLoading}>{actionLoading ? '...' : 'Recall'}</button> : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <h2 className="text-xl font-semibold mb-2">Players Available for Loan</h2>
                        {loansLoading || actionLoading ? <div>Loading...</div> : (
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th>Name</th><th>Club</th><th>Skill</th><th>Morale</th><th>Position</th><th>Loan Out</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loansAvailable.map(p => (
                                        <tr key={p.id} className="border-b">
                                            <td>{p.name}</td>
                                            <td>{getClubOption(p.clubId).badge} {getClubOption(p.clubId).name}</td>
                                            <td>{p.skill}</td>
                                            <td>{p.morale}</td>
                                            <td>{p.position}</td>
                                            <td><button className="px-2 py-1 bg-green-600 text-white rounded disabled:opacity-50" onClick={() => handleLoanOut(p)} disabled={actionLoading}>Loan Out</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
                {activeTab === 'Training' && (
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Training Progress</h2>
                        {trainingLoading || actionLoading ? <div>Loading...</div> : (
                            <table className="w-full mb-6">
                                <thead>
                                    <tr>
                                        <th>Name</th><th>Skill Gain</th><th>New Skill</th><th>Injured</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trainingProgress.map((p: any) => (
                                        <tr key={p.id} className="border-b">
                                            <td>{p.name}</td>
                                            <td>{p.skillGain ? `+${p.skillGain}` : '-'}</td>
                                            <td>{p.newSkill || '-'}</td>
                                            <td>{p.isInjured ? <span className="text-red-600 font-bold">Yes</span> : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {/* New Injuries This Week */}
                        {simulationSummary && simulationSummary.playerDevelopment && simulationSummary.playerDevelopment.some((pd: any) => pd.isInjured) && (
                            <div className="mb-4">
                                <div className="font-semibold mb-1 text-red-700">New Injuries This Week</div>
                                <ul className="list-disc ml-6">
                                    {simulationSummary.playerDevelopment.filter((pd: any) => pd.isInjured).map((inj: any, i: number) => (
                                        <li key={i}>
                                            <span className="font-bold">{inj.player}</span> ({inj.club})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <h2 className="text-xl font-semibold mb-2">Staff</h2>
                        <ul className="mb-4">
                            {clubStaff.map(s => (
                                <li key={s.id}>{s.name} - {s.role}</li>
                            ))}
                        </ul>
                        <button className="px-3 py-2 bg-green-700 text-white rounded" onClick={handleHireStaff} disabled={actionLoading}>Hire Staff</button>
                        <h2 className="text-xl font-semibold mb-2 mt-6">Team Training Focus</h2>
                        <ul className="flex gap-2 mb-4">
                            {['Fitness', 'Tactics', 'Defense', 'Attack'].map(focus => (
                                <li key={focus}><button className={`px-2 py-1 rounded ${trainingFocus.some(f => f.focus === focus) ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-700'}`} onClick={() => handleSetTeamFocus(focus)} disabled={actionLoading}>{focus}</button></li>
                            ))}
                        </ul>
                        <div className="text-gray-500 text-sm">(Training actions coming soon)</div>
                    </div>
                )}
                {activeTab === 'Attendance' && (
                    <div>
                        <h2>Attendance Analytics</h2>
                        {attendanceLoading && <div>Loading attendance data...</div>}
                        {attendanceError && <div style={{ color: 'red' }}>{attendanceError}</div>}
                        {attendanceData && (
                            <div>
                                <h3>Average Attendance per Club</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Club</th>
                                            <th>Average Attendance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceData.clubAttendance.map((c: any) => (
                                            <tr key={c.clubId}>
                                                <td>{c.clubName}</td>
                                                <td>{c.averageAttendance ?? '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <h3>Average Attendance per League</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>League</th>
                                            <th>Average Attendance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceData.leagueAttendance.map((l: any) => (
                                            <tr key={l.leagueId}>
                                                <td>{l.leagueName}</td>
                                                <td>{l.averageAttendance ?? '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <h3>Attendance Over Time (All Clubs)</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Week</th>
                                            <th>Average Attendance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceData.attendanceTimeSeries.map((w: any) => (
                                            <tr key={w.week}>
                                                <td>{w.week}</td>
                                                <td>{w.averageAttendance}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {/* Simple ASCII chart for attendance trend */}
                                <pre style={{ marginTop: 16, background: '#222', color: '#4ecdc4', padding: 8 }}>
{asciiAttendanceChart(attendanceData.attendanceTimeSeries)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
};

// Helper: Simple ASCII line chart for attendance trend
function asciiAttendanceChart(timeSeries: any[]) {
    if (!timeSeries || timeSeries.length === 0) return '';
    const max = Math.max(...timeSeries.map((w: any) => w.averageAttendance));
    const min = Math.min(...timeSeries.map((w: any) => w.averageAttendance));
    const height = 10;
    const width = timeSeries.length;
    const scale = (val: number) => Math.round(((val - min) / (max - min || 1)) * (height - 1));
    const grid = Array.from({ length: height }, () => Array(width).fill(' '));
    timeSeries.forEach((w: any, i: number) => {
        const y = height - 1 - scale(w.averageAttendance);
        grid[y][i] = '*';
    });
    return grid.map(row => row.join('')).join('\n');
}

export default ManagerDashboardPage; 