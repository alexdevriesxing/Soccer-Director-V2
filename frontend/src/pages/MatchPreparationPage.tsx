import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getClub, getClubFormation, getClubStrategy } from '../api/footballApi';
import { useManagerProfile } from '../context/ManagerProfileContext';
import { Club, Player, Fixture, ClubFormation, ClubStrategy } from '../types';

interface Formation {
    name: string;
    positions: { [key: string]: number };
}

const formations: Formation[] = [
    { name: '4-4-2', positions: { GK: 1, LB: 1, CB: 2, RB: 1, LM: 1, CM: 2, RM: 1, ST: 2 } },
    { name: '4-3-3', positions: { GK: 1, LB: 1, CB: 2, RB: 1, CM: 3, LW: 1, RW: 1, ST: 1 } },
    { name: '3-5-2', positions: { GK: 1, CB: 3, LM: 1, CM: 3, RM: 1, ST: 2 } },
    { name: '4-2-3-1', positions: { GK: 1, LB: 1, CB: 2, RB: 1, DM: 2, AM: 3, ST: 1 } },
    { name: '5-3-2', positions: { GK: 1, LB: 1, CB: 3, RB: 1, CM: 3, ST: 2 } },
];

const tactics = [
    'Possession', 'Counter Attack', 'High Press', 'Defensive', 'Balanced'
];

const autoSelectTeam = (players: Player[]) => {
    const availablePlayers = players.filter(p => !p.injured && !p.onInternationalDuty);
    const selected: { [position: string]: Player[] } = {};
    const subs: Player[] = [];

    // Sort players by skill for each position
    const positionGroups: { [pos: string]: Player[] } = {};
    availablePlayers.forEach(player => {
        if (!positionGroups[player.position]) {
            positionGroups[player.position] = [];
        }
        positionGroups[player.position].push(player);
    });

    // Sort each position by skill
    Object.keys(positionGroups).forEach(pos => {
        positionGroups[pos].sort((a, b) => b.skill - a.skill);
    });

    // Select starting XI based on formation
    Object.entries(formations[0].positions).forEach(([position, count]) => {
        const playersForPosition = positionGroups[position] || [];
        selected[position] = playersForPosition.slice(0, count);
    });

    // Add remaining players to substitutes
    const selectedPlayers = Object.values(selected).flat();
    availablePlayers.forEach(player => {
        if (!selectedPlayers.find(p => p.id === player.id)) {
            subs.push(player);
        }
    });

    return { startingXI: selected, substitutes: subs.slice(0, 7) }; // Max 7 substitutes
};

const MatchPreparationPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { profile } = useManagerProfile();
    const fixture = location.state?.fixture as Fixture;

    const [squad, setSquad] = useState<Player[]>([]);
    const [currentFormation, setCurrentFormation] = useState<ClubFormation | null>(null);
    const [currentStrategy, setCurrentStrategy] = useState<ClubStrategy | null>(null);
    const [selectedFormation, setSelectedFormation] = useState(formations[0]);
    const [selectedTactic, setSelectedTactic] = useState(tactics[4]); // Balanced
    const [startingXI, setStartingXI] = useState<{ [position: string]: Player[] }>({});
    const [substitutes, setSubstitutes] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!fixture || !profile) {
            navigate('/dashboard');
            return;
        }

        const loadClubData = async () => {
            try {
                const isHomeTeam = fixture.homeClubId === parseInt(profile.club);
                const clubId = isHomeTeam ? fixture.homeClubId : fixture.awayClubId;

                // Load club data
                const clubData = await getClub(clubId.toString());
                setSquad(clubData.players || []);

                // Load current formation and strategy
                const formationData = await getClubFormation(clubId.toString());
                const strategyData = await getClubStrategy(clubId.toString());

                setCurrentFormation(formationData);
                setCurrentStrategy(strategyData);

                // Set selected formation based on current club formation
                if (formationData) {
                    const matchingFormation = formations.find(f => f.name === formationData.formation);
                    if (matchingFormation) {
                        setSelectedFormation(matchingFormation);
                    }
                }

                // Set selected tactic based on current strategy
                if (strategyData) {
                    const tacticMap: { [key: string]: string } = {
                        'possession': 'Possession',
                        'counter': 'Counter Attack',
                        'pressing': 'High Press',
                        'direct': 'Defensive',
                        'balanced': 'Balanced'
                    };
                    const mappedTactic = tacticMap[strategyData.approach] || 'Balanced';
                    setSelectedTactic(mappedTactic);
                }

                setLoading(false);
                // Auto-select best team
                const { startingXI, substitutes } = autoSelectTeam(clubData.players || []);
                setStartingXI(startingXI);
                setSubstitutes(substitutes);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load club data');
                setLoading(false);
            }
        };

        loadClubData();
    }, [fixture, profile, navigate]);

    const handleFormationChange = (formation: Formation) => {
        setSelectedFormation(formation);
        const { startingXI, substitutes } = autoSelectTeam(squad);
        setStartingXI(startingXI);
        setSubstitutes(substitutes);
    };

    const handleKickoff = () => {
        // Navigate to match simulation with team data
        navigate('/match-simulation', {
            state: {
                fixture,
                startingXI,
                substitutes,
                formation: selectedFormation,
                tactic: selectedTactic,
                isHomeTeam: fixture.homeClubId === parseInt(profile?.club || '0')
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
                <div className="text-xl">Loading team data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white">
                <div className="text-red-400 mb-4">Error: {error}</div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const isHomeTeam = fixture.homeClubId === parseInt(profile?.club || '0');
    const opponent = isHomeTeam ? fixture.awayClubId : fixture.homeClubId;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Match Preparation</h1>
                    <div className="text-xl text-gray-300">
                        {profile?.club} vs {opponent}
                    </div>
                    <div className="text-gray-400">Round {fixture.week} • {fixture.date}</div>
                </div>

                {/* Current vs Selected Formation/Strategy */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Current Setup */}
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h2 className="text-xl font-semibold mb-4">Current Setup</h2>
                        <div className="space-y-3">
                            <div>
                                <span className="text-gray-400">Formation:</span>
                                <span className="ml-2 font-semibold">{currentFormation?.formation || 'Not set'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Style:</span>
                                <span className="ml-2 font-semibold">{currentFormation?.style || 'Not set'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Approach:</span>
                                <span className="ml-2 font-semibold">{currentStrategy?.approach || 'Not set'}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Defensive Style:</span>
                                <span className="ml-2 font-semibold">{currentStrategy?.defensiveStyle || 'Not set'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Match Setup */}
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h2 className="text-xl font-semibold mb-4">Match Setup</h2>
                        <div className="space-y-3">
                            <div>
                                <span className="text-gray-400">Selected Formation:</span>
                                <span className="ml-2 font-semibold text-green-400">{selectedFormation.name}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">Selected Tactic:</span>
                                <span className="ml-2 font-semibold text-green-400">{selectedTactic}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Formation and Tactics Selection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Formation Selection */}
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h2 className="text-xl font-semibold mb-4">Formation</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {formations.map((formation) => (
                                <button
                                    key={formation.name}
                                    onClick={() => handleFormationChange(formation)}
                                    className={`p-3 rounded border ${selectedFormation.name === formation.name
                                        ? 'bg-blue-600 border-blue-400'
                                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                                        }`}
                                >
                                    <div className="font-semibold">{formation.name}</div>
                                    <div className="text-sm text-gray-300">
                                        {Object.entries(formation.positions)
                                            .map(([pos, count]) => `${pos}: ${count}`)
                                            .join(', ')}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tactics Selection */}
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h2 className="text-xl font-semibold mb-4">Tactics</h2>
                        <div className="grid grid-cols-1 gap-2">
                            {tactics.map((tactic) => (
                                <button
                                    key={tactic}
                                    onClick={() => setSelectedTactic(tactic)}
                                    className={`p-3 rounded border text-left ${selectedTactic === tactic
                                        ? 'bg-green-600 border-green-400'
                                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                                        }`}
                                >
                                    <div className="font-semibold">{tactic}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Team Selection */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Starting XI */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800 rounded-lg p-4">
                            <h2 className="text-xl font-semibold mb-4">Starting XI</h2>
                            <div className="space-y-4">
                                {Object.entries(selectedFormation.positions).map(([position, count]) => (
                                    <div key={position} className="border border-gray-600 rounded p-3">
                                        <h3 className="font-semibold mb-2">{position} ({count})</h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {Array.from({ length: count }, (_, index) => {
                                                const player = startingXI[position]?.[index];
                                                return (
                                                    <div
                                                        key={`${position}-${index}`}
                                                        className="flex items-center justify-between p-2 bg-gray-700 rounded"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="font-medium">{player?.name || 'Empty'}</div>
                                                            <div className="text-sm text-gray-300">
                                                                Skill: {player?.skill || 0} | Age: {player?.age || 0}
                                                            </div>
                                                        </div>
                                                        {player && (
                                                            <button
                                                                onClick={() => {
                                                                    // Show substitute options
                                                                    const newSubs = [...substitutes];
                                                                    const newStarting = { ...startingXI };
                                                                    newStarting[position][index] = newSubs[0];
                                                                    newSubs[0] = player;
                                                                    setStartingXI(newStarting);
                                                                    setSubstitutes(newSubs);
                                                                }}
                                                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                                                            >
                                                                Swap
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Substitutes */}
                    <div className="bg-gray-800 rounded-lg p-4">
                        <h2 className="text-xl font-semibold mb-4">Substitutes</h2>
                        <div className="space-y-2">
                            {substitutes.map((player, index) => (
                                <div
                                    key={player.id}
                                    className="flex items-center justify-between p-2 bg-gray-700 rounded"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium">{player.name}</div>
                                        <div className="text-sm text-gray-300">
                                            {player.position} | Skill: {player.skill}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-between">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={handleKickoff}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-lg"
                    >
                        🚀 Kickoff!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatchPreparationPage; 