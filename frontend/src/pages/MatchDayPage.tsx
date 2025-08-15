import React, { useEffect, useState, useRef } from 'react';
import { getLeagues, getFixtures, simulateFixture, getPlayer } from '../api/footballApi';
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

interface Club {
    id: string;
    name: string;
    squad?: string[] | any[];
}

const clubBadges: Record<string, string> = {
    ajax: '🔴',
    psv: '⚪️',
    feyenoord: '⚫️',
    utrecht: '🔵',
    az: '🟣',
    // ...add more as needed
};

// Helper to get club color
function getClubColor(clubId: string, homeId: string, awayId: string) {
    if (clubId === homeId) return 'bg-blue-500';
    if (clubId === awayId) return 'bg-red-500';
    return 'bg-gray-400';
}

// Helper: pick a random player from a club, optionally by position
function pickRandomPlayer(clubId: string, clubs: Club[], players: { [id: string]: any }, positionGroup?: string[]): string | undefined {
    const club = clubs.find(c => c.id === clubId);
    if (!club || !club.squad) return undefined;
    let squad = club.squad;
    if (Array.isArray(squad) && typeof squad[0] === 'object') {
        // Already full player objects
        squad = squad as any[];
    } else if (Array.isArray(squad)) {
        // Array of player IDs
        squad = squad.map((pid: string) => players[pid]).filter(Boolean);
    }
    if (positionGroup) {
        squad = squad.filter((p: any) => positionGroup.includes(p.position));
    }
    if (!squad.length) return undefined;
    return squad[Math.floor(Math.random() * squad.length)]?.id;
}

// Use real simulation data instead of generating mock highlights
function generateHighlights(fixture: Fixture, clubs: Club[], players: { [id: string]: any }) {
    const events: any[] = [];
    // Use real scorers if available
    if (fixture.result && fixture.result.scorers && fixture.result.scorers.length > 0) {
        fixture.result.scorers.forEach((s: any) => {
            events.push({
                minute: s.minute,
                type: 'goal',
                description: `⚽ GOAL! ${s.playerName || 'Unknown'} scores!`,
                team: s.team || 'home'
            });
        });
    }
    events.sort((a: any, b: any) => a.minute - b.minute);
    return events;
}

const MatchDayPage: React.FC = () => {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [selectedLeague, setSelectedLeague] = useState('');
    const [round, setRound] = useState('');
    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [allRounds, setAllRounds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [simulatingId, setSimulatingId] = useState<string | null>(null);
    const [simulatingAll, setSimulatingAll] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [fixtureModal, setFixtureModal] = useState<Fixture | null>(null);
    const [playerDetails, setPlayerDetails] = useState<{ [id: string]: any }>({});
    const [simMatchModal, setSimMatchModal] = useState<null | Fixture>(null);
    const [simMinute, setSimMinute] = useState<number>(0);
    const [simState, setSimState] = useState<'idle' | 'firstHalf' | 'halftime' | 'secondHalf' | 'extraTime' | 'finished'>('idle');
    const [simHighlight, setSimHighlight] = useState<any | null>(null);
    const [simHighlights, setSimHighlights] = useState<any[]>([]);
    const [replayHighlight, setReplayHighlight] = useState<any | null>(null);
    const simInterval = useRef<NodeJS.Timeout | null>(null);
    const { profile } = useManagerProfile();

    // Tactical Change Modal state
    const [showTacticalModal, setShowTacticalModal] = useState(false);
    const [tacticalChangeType, setTacticalChangeType] = useState('Substitution');
    const [tacticalDescription, setTacticalDescription] = useState('');
    const [tacticalEffectiveness, setTacticalEffectiveness] = useState(0);
    const [tacticalSubmitting, setTacticalSubmitting] = useState(false);
    const [tacticalError, setTacticalError] = useState<string | null>(null);

    useEffect(() => {
        getLeagues().then(setLeagues).catch(e => setError(e.message));
    }, []);

    useEffect(() => {
        if (!selectedLeague) return;
        setLoading(true);
        setError(null);
        console.log('Fetching fixtures for leagueId:', selectedLeague);
        if (selectedLeague && !isNaN(Number(selectedLeague))) {
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
        } else {
            // Handle invalid leagueId (set error, etc.)
            setError('Invalid league ID');
            setLoading(false);
        }
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

    async function handleSimulate(fixture: Fixture) {
        setSimulatingId(fixture.id);
        try {
            // Use real backend simulation instead of mock data
            await simulateFixture(fixture.id);
            setNotification('Match simulated!');
            setTimeout(() => setNotification(null), 2000);
            const data = await getFixtures({ leagueId: selectedLeague, round: Number(round) });
            setFixtures(data);
        } catch (e) {
            setError('Failed to simulate match.');
        } finally {
            setSimulatingId(null);
        }
    }

    async function handleSimulateAll() {
        setSimulatingAll(true);
        try {
            const unplayedFixtures = fixtures.filter(f => !f.played);
            for (const fixture of unplayedFixtures) {
                await simulateFixture(fixture.id);
            }
            setNotification('All matches simulated!');
            setTimeout(() => setNotification(null), 2000);
            const data = await getFixtures({ leagueId: selectedLeague, round: Number(round) });
            setFixtures(data);
        } catch (e) {
            setError('Failed to simulate all matches.');
        } finally {
            setSimulatingAll(false);
        }
    }

    async function handleTacticalChangeSubmit() {
      if (!simMatchModal) return;
      setTacticalSubmitting(true);
      setTacticalError(null);
      try {
        const res = await fetch(`/api/fixtures/${simMatchModal.id}/tactical-change`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            minute: simMinute,
            changeType: tacticalChangeType,
            description: tacticalDescription,
            effectiveness: tacticalEffectiveness
          })
        });
        if (!res.ok) throw new Error('Failed to submit tactical change');
        const data = await res.json();
        // Add to highlights/event feed
        setSimHighlights(prev => [
          ...prev,
          {
            minute: simMinute,
            type: 'tactical',
            description: `⚙️ ${tacticalChangeType}: ${tacticalDescription}`,
            effectiveness: tacticalEffectiveness
          }
        ]);
        setShowTacticalModal(false);
        setTacticalDescription('');
        setTacticalEffectiveness(0);
        setTacticalChangeType('Substitution');
      } catch (e: any) {
        setTacticalError(e.message || 'Unknown error');
      } finally {
        setTacticalSubmitting(false);
      }
    }

    function clubNameWithBadge(clubId: string) {
        const badge = clubBadges[clubId.toLowerCase()] || '🏟️';
        return (
            <span className="inline-flex items-center gap-1">
                <span>{badge}</span>
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
            const player = await getPlayer(id);
            setPlayerDetails(prev => ({ ...prev, [id]: player }));
        } catch (e) {
            console.error('Failed to fetch player details:', e);
        }
    }

    function handleSimMatch(fixture: Fixture) {
        setSimMatchModal(fixture);
        setSimState('idle');
        setSimMinute(0);
        setSimHighlights([]);
        setSimHighlight(null);

        // Generate highlights from real fixture data
        const highlights = generateHighlights(fixture, [], playerDetails);
        setSimHighlights(highlights);

        // Start simulation
        setSimState('firstHalf');
        simInterval.current = setInterval(() => {
            setSimMinute(prev => {
                const newMinute = prev + 1;

                // Check for events at this minute
                const event = highlights.find(e => e.minute === newMinute);
                if (event) {
                    setSimHighlight(event);
                    setTimeout(() => setSimHighlight(null), 3000);
                }

                // Handle match phases
                if (newMinute === 45 && simState === 'firstHalf') {
                    setSimState('halftime');
                    return 45;
                }
                if (newMinute === 46 && simState === 'halftime') {
                    setSimState('secondHalf');
                    return 46;
                }
                if (newMinute === 90 && simState === 'secondHalf') {
                    setSimState('finished');
                    return 90;
                }

                return newMinute;
            });
        }, 1000);
    }

    function HighlightDot({ type, homeColor, awayColor, playerName }: { type: string; homeColor: string; awayColor: string; playerName?: string }) {
        const colors = {
            goal: 'bg-green-500',
            miss: 'bg-yellow-500',
            save: 'bg-blue-500',
            yellow: 'bg-yellow-400',
            red: 'bg-red-500',
            foul: 'bg-orange-500'
        };
        return (
            <div className={`w-3 h-3 rounded-full ${colors[type as keyof typeof colors] || 'bg-gray-400'} cursor-pointer hover:scale-150 transition-transform`} title={playerName} />
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 text-white">
            <h1 className="text-2xl font-bold mb-4">Match Day</h1>
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
                <button
                    className="ml-4 px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white font-semibold text-sm shadow"
                    onClick={handleSimulateAll}
                    disabled={simulatingAll || fixtures.every(f => f.played)}
                >
                    {simulatingAll ? 'Simulating...' : 'Simulate All'}
                </button>
            </div>
            {notification && <div className="mb-2 text-green-400 font-semibold">{notification}</div>}
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-400">{error}</div>}
            {!loading && !error && fixtures.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-600 text-sm bg-gray-800">
                        <thead>
                            <tr className="bg-gray-700">
                                <th className="px-2 py-1 border-r border-gray-600">Date</th>
                                <th className="px-2 py-1 border-r border-gray-600">Home</th>
                                <th className="px-2 py-1 border-r border-gray-600">Away</th>
                                <th className="px-2 py-1 border-r border-gray-600">Status</th>
                                <th className="px-2 py-1 border-r border-gray-600">Result</th>
                                <th className="px-2 py-1">Simulate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fixtures.map(f => (
                                <tr
                                    key={f.id}
                                    className={`border-b border-gray-600 hover:bg-gray-700 ${profile && (f.homeClubId === profile.club || f.awayClubId === profile.club) ? 'bg-yellow-900 font-bold' : ''}`}
                                    onClick={() => handleShowDetails(f)}
                                    style={{ cursor: f.played ? 'pointer' : 'default' }}
                                >
                                    <td className="px-2 py-1 text-center border-r border-gray-600">{f.date}</td>
                                    <td className="px-2 py-1 text-center border-r border-gray-600">{clubNameWithBadge(f.homeClubId)}</td>
                                    <td className="px-2 py-1 text-center border-r border-gray-600">{clubNameWithBadge(f.awayClubId)}</td>
                                    <td className="px-2 py-1 text-center border-r border-gray-600">{f.played ? 'Played' : 'Upcoming'}</td>
                                    <td className="px-2 py-1 text-center border-r border-gray-600">{f.played && f.result ? `${f.result.homeGoals} - ${f.result.awayGoals}` : '-'}</td>
                                    <td className="px-2 py-1 text-center">
                                        {!f.played && (
                                            <>
                                                <button
                                                    className="px-2 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs mr-1"
                                                    onClick={e => { e.stopPropagation(); handleSimulate(f); }}
                                                    disabled={simulatingId === f.id || simulatingAll}
                                                >
                                                    {simulatingId === f.id ? 'Simulating...' : 'Simulate'}
                                                </button>
                                                <button
                                                    className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                                    onClick={e => { e.stopPropagation(); handleSimMatch(f); }}
                                                >
                                                    Sim w/ Highlights
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {!loading && !error && fixtures.length > 0 && fixtures.every(f => f.played) && (
                <div className="mt-4 text-green-400 font-semibold">All matches in this round have been played!</div>
            )}
            {!loading && !error && fixtures.length === 0 && (
                <div className="mt-4 text-gray-400">No fixtures found for this league/round.</div>
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
            {/* Simulated Match Modal with Highlights */}
            {simMatchModal && (
                (() => {
                    const homeId = simMatchModal.homeClubId;
                    const awayId = simMatchModal.awayClubId;
                    return (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setSimMatchModal(null)}>
                            <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-lg w-full relative text-white" onClick={e => e.stopPropagation()}>
                                <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl" onClick={() => setSimMatchModal(null)}>&times;</button>
                                <h2 className="text-xl font-bold mb-2">Live Match Simulation</h2>
                                <div className="mb-2 text-gray-300">{clubNameWithBadge(homeId)} vs {clubNameWithBadge(awayId)}</div>
                                <div className="mb-2 text-gray-300">Minute: <span className="font-semibold">{simMinute}{simState === 'extraTime' && simMinute > 90 ? `+${simMinute - 90}` : ''}</span></div>
                                <div className="mb-2 text-gray-300">State: <span className="font-semibold">{simState === 'halftime' ? 'Halftime' : simState === 'finished' ? 'Full Time' : simState.replace(/([A-Z])/g, ' $1')}</span></div>
                                <button className="mb-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white font-semibold" onClick={() => setShowTacticalModal(true)}>
                                  Make Tactical Change
                                </button>
                                {showTacticalModal && (
                                  <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setShowTacticalModal(false)}>
                                    <div className="bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md relative text-white" onClick={e => e.stopPropagation()}>
                                      <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl" onClick={() => setShowTacticalModal(false)}>&times;</button>
                                      <h3 className="text-lg font-bold mb-4">Tactical Change</h3>
                                      <form onSubmit={e => { e.preventDefault(); handleTacticalChangeSubmit(); }}>
                                        <div className="mb-2">
                                          <label className="block text-sm mb-1">Minute</label>
                                          <input type="number" value={simMinute} readOnly className="w-full px-2 py-1 rounded bg-gray-700 text-white" />
                                        </div>
                                        <div className="mb-2">
                                          <label className="block text-sm mb-1">Change Type</label>
                                          <select value={tacticalChangeType} onChange={e => setTacticalChangeType(e.target.value)} className="w-full px-2 py-1 rounded bg-gray-700 text-white">
                                            <option value="Substitution">Substitution</option>
                                            <option value="Formation">Formation</option>
                                            <option value="Instructions">Instructions</option>
                                          </select>
                                        </div>
                                        <div className="mb-2">
                                          <label className="block text-sm mb-1">Description</label>
                                          <input type="text" value={tacticalDescription} onChange={e => setTacticalDescription(e.target.value)} className="w-full px-2 py-1 rounded bg-gray-700 text-white" placeholder="Describe the change..." />
                                        </div>
                                        <div className="mb-2">
                                          <label className="block text-sm mb-1">Effectiveness (0-1)</label>
                                          <input type="number" min={0} max={1} step={0.01} value={tacticalEffectiveness} onChange={e => setTacticalEffectiveness(Number(e.target.value))} className="w-full px-2 py-1 rounded bg-gray-700 text-white" />
                                        </div>
                                        {tacticalError && <div className="text-red-400 mb-2">{tacticalError}</div>}
                                        <button type="submit" className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-semibold" disabled={tacticalSubmitting}>
                                          {tacticalSubmitting ? 'Submitting...' : 'Submit Tactical Change'}
                                        </button>
                                      </form>
                                    </div>
                                  </div>
                                )}
                                {simHighlight && (
                                    <div className="flex justify-center items-center my-4">
                                        <HighlightDot
                                            type={simHighlight.type}
                                            homeColor={getClubColor(homeId, homeId, awayId)}
                                            awayColor={getClubColor(awayId, homeId, awayId)}
                                            playerName={simHighlight.playerId && playerDetails[simHighlight.playerId]?.name}
                                        />
                                    </div>
                                )}
                                {replayHighlight && (
                                    <div className="flex justify-center items-center my-4">
                                        <HighlightDot
                                            type={replayHighlight.type}
                                            homeColor={getClubColor(homeId, homeId, awayId)}
                                            awayColor={getClubColor(awayId, homeId, awayId)}
                                            playerName={replayHighlight.playerId && playerDetails[replayHighlight.playerId]?.name}
                                        />
                                        <button className="ml-4 px-2 py-1 bg-gray-600 rounded text-white" onClick={() => setReplayHighlight(null)}>Close</button>
                                    </div>
                                )}
                                {/* Timeline/event log */}
                                <div className="mt-4">
                                    <div className="font-semibold mb-1 text-sm">Highlights Timeline</div>
                                    <ul className="text-xs text-gray-300">
                                        {simHighlights.map((ev, i) => (
                                            <li key={i} className="mb-1 flex items-center">
                                                <button className="underline text-blue-400 mr-2" onClick={() => setReplayHighlight(ev)}>
                                                    {ev.minute}{ev.minute > 90 ? `+${ev.minute - 90}` : ''}'
                                                </button>
                                                <span className={`font-bold mr-1 ${ev.type === 'goal' ? 'text-yellow-400' : 'text-gray-400'}`}>{ev.type === 'goal' ? 'Goal' : 'Miss'}</span>
                                                {ev.playerId && playerDetails[ev.playerId]?.name && (
                                                    <span className="ml-1">({playerDetails[ev.playerId].name})</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                })()
            )}
        </div>
    );
};

export default MatchDayPage; 