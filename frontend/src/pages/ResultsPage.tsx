import React, { useEffect, useState } from 'react';
import { getLeagues, getFixtures, getPlayer } from '../api/footballApi';
import { useNavigate } from 'react-router-dom';
import { useManagerProfile } from '../context/ManagerProfileContext';

interface League { id: string; name: string; }

interface Fixture {
    id: string;
    leagueId: string;
    homeClubId: string;
    awayClubId: string;
    round: number;
    date: string;
    played: boolean;
    result?: {
        homeGoals: number;
        awayGoals: number;
        scorers: { playerId: string; minute: number; assists?: string[] }[];
        cards: { playerId: string; type: 'yellow' | 'red'; minute: number; }[];
        weather: string;
        headline: string;
    };
}

const ResultsPage: React.FC = () => {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [selectedLeague, setSelectedLeague] = useState('');
    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [round, setRound] = useState('');
    const [allRounds, setAllRounds] = useState<number[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fixtureModal, setFixtureModal] = useState<Fixture | null>(null);
    const [playerDetails, setPlayerDetails] = useState<{ [id: string]: any }>({});
    const navigate = useNavigate();
    const { profile } = useManagerProfile();

    // Ensure clubBadges is defined in the correct scope for clubNameWithBadge
    const clubBadges: Record<string, string> = {
        ajax: '🔴',
        psv: '⚪️',
        feyenoord: '⚫️',
        utrecht: '🔵',
        az: '🟣',
        // ...add more as needed
    };

    useEffect(() => {
        getLeagues().then(setLeagues).catch(e => setError(e.message));
    }, []);

    useEffect(() => {
        if (!selectedLeague) return;
        setLoading(true);
        setError(null);
        getFixtures({ leagueId: selectedLeague })
            .then((data) => {
                setFixtures(data);
                const rounds = Array.from(new Set(data.map((f: Fixture) => f.round))) as number[];
                rounds.sort((a, b) => a - b);
                setAllRounds(rounds);
                if (!round && rounds.length > 0) setRound(String(rounds[0]));
                setLoading(false);
            })
            .catch((e) => {
                setError(e.message);
                setLoading(false);
            });
    }, [selectedLeague]);

    useEffect(() => {
        if (!selectedLeague || !round) return;
        setLoading(true);
        setError(null);
        getFixtures({ leagueId: selectedLeague, round: Number(round) })
            .then((data) => {
                setFixtures(data);
                setLoading(false);
            })
            .catch((e) => {
                setError(e.message);
                setLoading(false);
            });
    }, [round, selectedLeague]);

    // Filter for played fixtures
    const playedFixtures = fixtures.filter(f => f.played && f.result);

    // Search filter
    const filteredFixtures = playedFixtures.filter(f => {
        const clubMatch =
            f.homeClubId.toLowerCase().includes(search.toLowerCase()) ||
            f.awayClubId.toLowerCase().includes(search.toLowerCase());
        const headlineMatch = f.result?.headline?.toLowerCase().includes(search.toLowerCase());
        return !search || clubMatch || headlineMatch;
    });

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

    function handleShowDetails(fixture: Fixture) {
        setFixtureModal(fixture);
    }

    async function fetchPlayerDetails(id: string) {
        if (playerDetails[id]) return;
        try {
            const p = await getPlayer(id);
            setPlayerDetails(prev => ({ ...prev, [id]: p }));
        } catch {
            setPlayerDetails(prev => ({ ...prev, [id]: { id } }));
        }
    }

    useEffect(() => {
        if (!fixtureModal || !fixtureModal.result) return;
        fixtureModal.result.scorers.forEach((s: any) => fetchPlayerDetails(s.playerId));
        fixtureModal.result.cards.forEach((c: any) => fetchPlayerDetails(c.playerId));
        // eslint-disable-next-line
    }, [fixtureModal]);

    return (
        <div className="max-w-4xl mx-auto p-4 text-white">
            <h1 className="text-2xl font-bold mb-4">Results</h1>
            <div className="mb-4 flex flex-wrap gap-4 items-center">
                <label className="font-medium">League:</label>
                <select
                    className="border rounded px-2 py-1 bg-gray-700 text-white border-gray-600"
                    value={selectedLeague}
                    onChange={e => { setSelectedLeague(e.target.value); setRound(''); }}
                >
                    <option value="">Select League</option>
                    {leagues.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                </select>
                <label className="ml-4 font-medium">Round:</label>
                <select
                    className="border rounded px-2 py-1 bg-gray-700 text-white border-gray-600"
                    value={round}
                    onChange={e => setRound(e.target.value)}
                    disabled={!selectedLeague}
                >
                    <option value="">Select Round</option>
                    {allRounds.map(r => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
                <input
                    className="ml-4 border rounded px-2 py-1 bg-gray-700 text-white border-gray-600"
                    type="text"
                    placeholder="Search club or headline..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-400">{error}</div>}
            {!loading && !error && filteredFixtures.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-600 text-sm bg-gray-800">
                        <thead>
                            <tr className="bg-gray-700">
                                <th className="px-2 py-1 border-r border-gray-600">Date</th>
                                <th className="px-2 py-1 border-r border-gray-600">Home</th>
                                <th className="px-2 py-1 border-r border-gray-600">Away</th>
                                <th className="px-2 py-1 border-r border-gray-600">Result</th>
                                <th className="px-2 py-1 border-r border-gray-600">Weather</th>
                                <th className="px-2 py-1 border-r border-gray-600">Cards</th>
                                <th className="px-2 py-1">Headline</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFixtures.map(f => (
                                <tr
                                    key={f.id}
                                    className={`border-b border-gray-600 hover:bg-gray-700 ${profile && (f.homeClubId === profile.club || f.awayClubId === profile.club) ? 'bg-yellow-900 font-bold' : ''}`}
                                    onClick={() => handleShowDetails(f)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td className="px-2 py-1 text-center border-r border-gray-600">{f.date}</td>
                                    <td className="px-2 py-1 text-center border-r border-gray-600">{clubNameWithBadge(f.homeClubId)}</td>
                                    <td className="px-2 py-1 text-center border-r border-gray-600">{clubNameWithBadge(f.awayClubId)}</td>
                                    <td className="px-2 py-1 text-center border-r border-gray-600">{f.result ? `${f.result.homeGoals} - ${f.result.awayGoals}` : '-'}</td>
                                    <td className="px-2 py-1 text-center border-r border-gray-600">{f.result?.weather}</td>
                                    <td className="px-2 py-1 text-center border-r border-gray-600">{f.result?.cards?.length ?? 0}</td>
                                    <td className="px-2 py-1">{f.result?.headline}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {!loading && !error && filteredFixtures.length === 0 && (
                <div className="mt-4 text-gray-400">No results found for this league/round/search.</div>
            )}
            {/* Match Details Modal */}
            {fixtureModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setFixtureModal(null)}>
                    <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-lg w-full relative text-white" onClick={e => e.stopPropagation()}>
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl" onClick={() => setFixtureModal(null)}>&times;</button>
                        <h2 className="text-xl font-bold mb-2">Match Details</h2>
                        <div className="mb-2 text-gray-300">Date: <span className="font-semibold">{fixtureModal.date}</span></div>
                        <div className="mb-2 text-gray-300">Home: {clubNameWithBadge(fixtureModal.homeClubId)}</div>
                        <div className="mb-2 text-gray-300">Away: {clubNameWithBadge(fixtureModal.awayClubId)}</div>
                        <div className="mb-2 text-gray-300">Status: {fixtureModal.played ? 'Played' : 'Upcoming'}</div>
                        {fixtureModal.played && fixtureModal.result && (
                            <>
                                <div className="mb-2 text-gray-300">Result: <span className="font-semibold">{fixtureModal.result.homeGoals} - {fixtureModal.result.awayGoals}</span></div>
                                <div className="mb-2 text-gray-300">Weather: <span className="font-semibold">{fixtureModal.result.weather}</span></div>
                                <div className="mb-2 text-gray-300">Headline: <span className="font-semibold">{fixtureModal.result.headline}</span></div>
                                <div className="mb-2">
                                    <div className="font-semibold mb-1">Scorers:</div>
                                    {fixtureModal.result.scorers.length > 0 ? (
                                        <ul className="list-disc ml-6">
                                            {fixtureModal.result.scorers.map((s: any, i: number) => (
                                                <li key={i}>
                                                    Player {s.playerId} ({s.minute}')
                                                    {s.assists && s.assists.length > 0 && (
                                                        <span className="ml-2 text-xs text-gray-400">Assists: {s.assists.join(', ')}</span>
                                                    )}
                                                    {playerDetails[s.playerId] && (
                                                        <div className="ml-4 text-xs text-gray-400">
                                                            <span>Contract: {playerDetails[s.playerId].contractYears ?? '-'}</span>,
                                                            <span> Expiry: {playerDetails[s.playerId].contractExpiry ?? '-'}</span>,
                                                            <span> Value: {playerDetails[s.playerId].contractValue ? `€${playerDetails[s.playerId].contractValue.toLocaleString()}` : '-'}</span>,
                                                            <span> Transfer: {playerDetails[s.playerId].isTransferListed ? 'Listed' : playerDetails[s.playerId].isOnLoan ? 'On Loan' : '-'}</span>
                                                        </div>
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
                                                <li key={i}>
                                                    Player {c.playerId} - {c.type} ({c.minute}')
                                                    {playerDetails[c.playerId] && (
                                                        <div className="ml-4 text-xs text-gray-400">
                                                            <span>Contract: {playerDetails[c.playerId].contractYears ?? '-'}</span>,
                                                            <span> Expiry: {playerDetails[c.playerId].contractExpiry ?? '-'}</span>,
                                                            <span> Value: {playerDetails[c.playerId].contractValue ? `€${playerDetails[c.playerId].contractValue.toLocaleString()}` : '-'}</span>,
                                                            <span> Transfer: {playerDetails[c.playerId].isTransferListed ? 'Listed' : playerDetails[c.playerId].isOnLoan ? 'On Loan' : '-'}</span>
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <span className="text-gray-400">None</span>}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsPage; 