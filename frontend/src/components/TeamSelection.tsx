import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManagerProfile } from '../context/ManagerProfileContext';
import { getFixtures } from '../api/footballApi';

interface Player {
  id: number;
  name: string;
  position: string;
  skill: number;
  age: number;
  nationality: string;
  morale: number;
  injured: boolean;
  onInternationalDuty: boolean;
  isJongTeam: boolean;
}

interface TeamSelectionProps {}

const TeamSelection: React.FC<TeamSelectionProps> = () => {
  const navigate = useNavigate();
  const { profile } = useManagerProfile();
  const [nextFixture, setNextFixture] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedFormation, setSelectedFormation] = useState('4-4-2');
  const [selectedStrategy, setSelectedStrategy] = useState('Balanced');
  const [selectedPlayers, setSelectedPlayers] = useState<{ [key: string]: Player }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoSelected, setAutoSelected] = useState(false);

  const formations = [
    { name: '4-4-2', description: 'Classic balanced formation' },
    { name: '4-3-3', description: 'Attacking formation' },
    { name: '3-5-2', description: 'Wing-back formation' },
    { name: '4-2-3-1', description: 'Modern attacking formation' },
    { name: '5-3-2', description: 'Defensive formation' },
    { name: '3-4-3', description: 'Very attacking formation' }
  ];

  const strategies = [
    { name: 'Defensive', description: 'Focus on defending' },
    { name: 'Balanced', description: 'Equal focus on attack and defense' },
    { name: 'Attacking', description: 'Focus on scoring goals' },
    { name: 'Counter-Attack', description: 'Defend deep and counter' },
    { name: 'Possession', description: 'Keep the ball and control play' },
    { name: 'High Press', description: 'Press high up the pitch' }
  ];

  const autoSelectTeam = () => {
    const positionRequirements = getPositionRequirements(selectedFormation);
    const newSelection: { [key: string]: Player } = {};
    const usedPlayerIds = new Set<number>();

    // Get all available players (not injured, not on international duty, not jong team)
    const availablePlayers = players.filter(p => 
      !p.injured && 
      !p.onInternationalDuty &&
      !p.isJongTeam
    );

    // Sort players by position and skill (highest first)
    const playersByPosition: { [key: string]: Player[] } = {
      GK: availablePlayers.filter(p => p.position === 'GK').sort((a, b) => b.skill - a.skill),
      DEF: availablePlayers.filter(p => p.position === 'DEF').sort((a, b) => b.skill - a.skill),
      MID: availablePlayers.filter(p => p.position === 'MID').sort((a, b) => b.skill - a.skill),
      FWD: availablePlayers.filter(p => p.position === 'FWD').sort((a, b) => b.skill - a.skill)
    };

    // Select players for each position
    Object.entries(positionRequirements).forEach(([position, count]) => {
      const positionPlayers = playersByPosition[position] || [];
      
      for (let i = 0; i < count && i < positionPlayers.length; i++) {
        const player = positionPlayers[i];
        if (!usedPlayerIds.has(player.id)) {
          // Use position with index for multiple players of same position
          const positionKey = count === 1 ? position : `${position}${i + 1}`;
          newSelection[positionKey] = player;
          usedPlayerIds.add(player.id);
        }
      }
    });

    setSelectedPlayers(newSelection);
    setAutoSelected(true);
  };

  useEffect(() => {
    if (!profile) {
      navigate('/game-menu');
      return;
    }

    const loadMatchData = async () => {
      try {
        setLoading(true);
        const fixtures = await getFixtures({ clubId: profile.club });
        const next = fixtures.find((f: any) => !f.played);
        
        if (!next) {
          setError('No upcoming matches found');
          setLoading(false);
          return;
        }

        setNextFixture(next);

        // Mock players data - in real app this would come from API
        const mockPlayers: Player[] = [
          { id: 1, name: 'Jan van der Berg', position: 'GK', skill: 75, age: 28, nationality: 'Netherlands', morale: 80, injured: false, onInternationalDuty: false, isJongTeam: false },
          { id: 2, name: 'Piet Bakker', position: 'DEF', skill: 72, age: 25, nationality: 'Netherlands', morale: 75, injured: false, onInternationalDuty: false, isJongTeam: false },
          { id: 3, name: 'Klaas Visser', position: 'DEF', skill: 70, age: 27, nationality: 'Netherlands', morale: 78, injured: false, onInternationalDuty: false, isJongTeam: false },
          { id: 4, name: 'Henk Smit', position: 'DEF', skill: 68, age: 24, nationality: 'Netherlands', morale: 72, injured: false, onInternationalDuty: false, isJongTeam: false },
          { id: 5, name: 'Willem de Boer', position: 'DEF', skill: 71, age: 26, nationality: 'Netherlands', morale: 76, injured: false, onInternationalDuty: false, isJongTeam: false },
          { id: 6, name: 'Johan Mulder', position: 'MID', skill: 73, age: 29, nationality: 'Netherlands', morale: 79, injured: false, onInternationalDuty: false, isJongTeam: false },
          { id: 7, name: 'Marco de Groot', position: 'MID', skill: 69, age: 23, nationality: 'Netherlands', morale: 74, injured: false, onInternationalDuty: false, isJongTeam: false },
          { id: 8, name: 'Ruud Bos', position: 'MID', skill: 72, age: 25, nationality: 'Netherlands', morale: 77, injured: false, onInternationalDuty: false, isJongTeam: false },
          { id: 9, name: 'Dennis Vos', position: 'MID', skill: 70, age: 24, nationality: 'Netherlands', morale: 73, injured: false, onInternationalDuty: false, isJongTeam: false },
          { id: 10, name: 'Patrick Peters', position: 'FWD', skill: 76, age: 26, nationality: 'Netherlands', morale: 81, injured: false, onInternationalDuty: false, isJongTeam: false },
          { id: 11, name: 'Frank Hendriks', position: 'FWD', skill: 74, age: 27, nationality: 'Netherlands', morale: 78, injured: false, onInternationalDuty: false, isJongTeam: false },
          { id: 12, name: 'Ronald van Dijk', position: 'GK', skill: 65, age: 22, nationality: 'Netherlands', morale: 70, injured: false, onInternationalDuty: false, isJongTeam: false },
          { id: 13, name: 'Edwin Jansen', position: 'DEF', skill: 67, age: 23, nationality: 'Netherlands', morale: 71, injured: false, onInternationalDuty: false, isJongTeam: false },
          { id: 14, name: 'Jaap van der Berg', position: 'MID', skill: 68, age: 24, nationality: 'Netherlands', morale: 72, injured: false, onInternationalDuty: false, isJongTeam: false },
          { id: 15, name: 'Clarence de Vries', position: 'FWD', skill: 71, age: 25, nationality: 'Netherlands', morale: 75, injured: false, onInternationalDuty: false, isJongTeam: false },
          // Add some injured and international duty players
          { id: 16, name: 'Tom van der Meer', position: 'DEF', skill: 69, age: 26, nationality: 'Netherlands', morale: 65, injured: true, onInternationalDuty: false, isJongTeam: false },
          { id: 17, name: 'Lars de Vries', position: 'MID', skill: 71, age: 24, nationality: 'Netherlands', morale: 70, injured: false, onInternationalDuty: true, isJongTeam: false },
          { id: 18, name: 'Bas Jansen', position: 'FWD', skill: 73, age: 25, nationality: 'Netherlands', morale: 68, injured: true, onInternationalDuty: false, isJongTeam: false }
        ];

        setPlayers(mockPlayers);
        setLoading(false);
        
        // Auto-select team after players are loaded
        setTimeout(() => {
          autoSelectTeam();
        }, 100);
      } catch (error) {
        setError('Failed to load match data');
        setLoading(false);
      }
    };

    loadMatchData();
  }, [profile, navigate]);

  // Auto-select team when formation changes
  useEffect(() => {
    if (players.length > 0) {
      autoSelectTeam();
    }
  }, [selectedFormation, players.length, autoSelectTeam]);

  const getPlayersByPosition = (position: string) => {
    return players.filter(p => p.position === position && !p.injured && !p.onInternationalDuty && !p.isJongTeam);
  };

  const handlePlayerSelect = (position: string, player: Player) => {
    // Find if this player is already selected in any position
    const existingPosition = Object.keys(selectedPlayers).find(pos => 
      selectedPlayers[pos]?.id === player.id
    );
    
    if (existingPosition) {
      // Remove player from existing position
      const newSelection = { ...selectedPlayers };
      delete newSelection[existingPosition];
      setSelectedPlayers(newSelection);
    } else {
      // Find an available position slot for this player type
      const positionRequirements = getPositionRequirements(selectedFormation);
      const count = positionRequirements[position as keyof typeof positionRequirements] || 0;
      
      // Find an empty slot for this position
      let slotFound = false;
      for (let i = 1; i <= count; i++) {
        const positionKey = count === 1 ? position : `${position}${i}`;
        if (!selectedPlayers[positionKey]) {
          setSelectedPlayers(prev => ({
            ...prev,
            [positionKey]: player
          }));
          slotFound = true;
          break;
        }
      }
      
      // If no slot found, replace the lowest skill player of this position
      if (!slotFound) {
        const positionPlayers = Object.entries(selectedPlayers)
          .filter(([pos]) => pos.startsWith(position))
          .sort(([, a], [, b]) => a.skill - b.skill);
        
        if (positionPlayers.length > 0) {
          const [lowestPosition] = positionPlayers[0];
          setSelectedPlayers(prev => ({
            ...prev,
            [lowestPosition]: player
          }));
        }
      }
    }
  };

  const getPositionRequirements = (formation: string) => {
    switch (formation) {
      case '4-4-2': return { GK: 1, DEF: 4, MID: 4, FWD: 2 };
      case '4-3-3': return { GK: 1, DEF: 4, MID: 3, FWD: 3 };
      case '3-5-2': return { GK: 1, DEF: 3, MID: 5, FWD: 2 };
      case '4-2-3-1': return { GK: 1, DEF: 4, MID: 5, FWD: 1 };
      case '5-3-2': return { GK: 1, DEF: 5, MID: 3, FWD: 2 };
      case '3-4-3': return { GK: 1, DEF: 3, MID: 4, FWD: 3 };
      default: return { GK: 1, DEF: 4, MID: 4, FWD: 2 };
    }
  };

  const handleKickOff = () => {
    // Validate team selection
    const positionRequirements = getPositionRequirements(selectedFormation);
    const requiredTotal = Object.values(positionRequirements).reduce((sum, count) => sum + count, 0);
    const selectedCount = Object.keys(selectedPlayers).length;
    
    if (selectedCount < requiredTotal) {
      setError(`Please select ${requiredTotal} players for your starting lineup (${selectedCount}/${requiredTotal} selected)`);
      return;
    }

    // Navigate to match simulation with selected team
    navigate('/match-simulation', {
      state: {
        fixture: nextFixture,
        selectedPlayers,
        formation: selectedFormation,
        strategy: selectedStrategy
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono">
        <div className="w-full max-w-lg bg-gray-800 rounded-xl shadow-lg p-8 mt-12 flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">Loading...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono">
        <div className="w-full max-w-lg bg-gray-800 rounded-xl shadow-lg p-8 mt-12 flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4 text-red-400">Error</h2>
          <div className="text-red-300 mb-4">{error}</div>
          <button onClick={() => navigate('/game-menu')} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white">
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-400">Team Selection</h1>
              <p className="text-gray-300">Select your starting lineup and tactics</p>
            </div>
            <button
              onClick={() => navigate('/game-menu')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
            >
              Back to Menu
            </button>
          </div>
          
          {nextFixture && (
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <div className="text-lg font-semibold mb-2">Next Match</div>
              <div className="flex items-center justify-between">
                <div className="text-green-400">
                  {nextFixture.homeClub?.name || 'TBD'} vs {nextFixture.awayClub?.name || 'TBD'}
                </div>
                <div className="text-sm text-gray-400">
                  Week {nextFixture.week} • {nextFixture.date ? new Date(nextFixture.date).toLocaleDateString() : 'TBD'}
                </div>
              </div>
            </div>
          )}
          
          {autoSelected && (
            <div className="mt-4 p-4 bg-green-600 rounded-lg">
              <div className="text-lg font-semibold mb-2">✅ Team Auto-Selected</div>
              <div className="text-sm">
                Your best 11 players have been automatically selected based on skill level. 
                You can modify the selection below or click "Kickoff!" to proceed.
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formation & Strategy */}
          <div className="lg:col-span-1 space-y-6">
            {/* Formation Selection */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Formation</h2>
              <div className="space-y-3">
                {formations.map((formation) => (
                  <button
                    key={formation.name}
                    onClick={() => setSelectedFormation(formation.name)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedFormation === formation.name
                        ? 'bg-green-600 border-green-400'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    } border`}
                  >
                    <div className="font-semibold">{formation.name}</div>
                    <div className="text-sm text-gray-300">{formation.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Strategy Selection */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Strategy</h2>
              <div className="space-y-3">
                {strategies.map((strategy) => (
                  <button
                    key={strategy.name}
                    onClick={() => setSelectedStrategy(strategy.name)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedStrategy === strategy.name
                        ? 'bg-green-600 border-green-400'
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    } border`}
                  >
                    <div className="font-semibold">{strategy.name}</div>
                    <div className="text-sm text-gray-300">{strategy.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Team Summary */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Selected Team</h2>
              <div className="space-y-2">
                {Object.entries(selectedPlayers).map(([position, player]) => (
                  <div key={position} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <div className="flex-1">
                      <div className="font-medium text-green-400">{player.name}</div>
                      <div className="text-sm text-gray-300">
                        <span className="text-blue-400 font-semibold">{position}</span> • Skill: {player.skill} • Age: {player.age}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">#{player.id}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-400">
                  {Object.keys(selectedPlayers).length}/{Object.values(getPositionRequirements(selectedFormation)).reduce((sum, count) => sum + count, 0)} players selected
                </div>
                {Object.keys(selectedPlayers).length === Object.values(getPositionRequirements(selectedFormation)).reduce((sum, count) => sum + count, 0) && (
                  <div className="text-green-400 font-semibold mt-2">✅ Team Complete!</div>
                )}
                {autoSelected && Object.keys(selectedPlayers).length === Object.values(getPositionRequirements(selectedFormation)).reduce((sum, count) => sum + count, 0) && (
                  <div className="text-blue-400 text-xs mt-1">Auto-selected based on skill</div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => navigate('/game-menu')}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
              >
                Back to Dashboard
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={autoSelectTeam}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
                >
                  🔄 Reset to Auto-Selection
                </button>
                <button
                  onClick={handleKickOff}
                  className={`px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-lg ${Object.keys(selectedPlayers).length < Object.values(getPositionRequirements(selectedFormation)).reduce((sum, count) => sum + count, 0) ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  🚀 Kickoff!
                </button>
              </div>
            </div>
          </div>

          {/* Player Selection */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6">Select Your Team</h2>
              
              {/* Position Tabs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Goalkeepers */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">Goalkeepers</h3>
                  <div className="space-y-2">
                    {getPlayersByPosition('GK').map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handlePlayerSelect('GK', player)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          selectedPlayers['GK']?.id === player.id
                            ? 'bg-green-600 text-white border-2 border-green-400'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-sm opacity-75">
                              Age: {player.age} • Skill: {player.skill} • Morale: {player.morale}
                            </div>
                          </div>
                          {selectedPlayers['GK']?.id === player.id && (
                            <div className="text-green-300">✓</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Defenders */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-green-400">Defenders</h3>
                  <div className="space-y-2">
                    {getPlayersByPosition('DEF').map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handlePlayerSelect('DEF', player)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          Object.values(selectedPlayers).some(p => p.id === player.id)
                            ? 'bg-green-600 text-white border-2 border-green-400'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-sm opacity-75">
                              Age: {player.age} • Skill: {player.skill} • Morale: {player.morale}
                            </div>
                          </div>
                          {Object.values(selectedPlayers).some(p => p.id === player.id) && (
                            <div className="text-green-300">✓</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Midfielders */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-yellow-400">Midfielders</h3>
                  <div className="space-y-2">
                    {getPlayersByPosition('MID').map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handlePlayerSelect('MID', player)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          Object.values(selectedPlayers).some(p => p.id === player.id)
                            ? 'bg-green-600 text-white border-2 border-green-400'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-sm opacity-75">
                              Age: {player.age} • Skill: {player.skill} • Morale: {player.morale}
                            </div>
                          </div>
                          {Object.values(selectedPlayers).some(p => p.id === player.id) && (
                            <div className="text-green-300">✓</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Forwards */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-red-400">Forwards</h3>
                  <div className="space-y-2">
                    {getPlayersByPosition('FWD').map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handlePlayerSelect('FWD', player)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          Object.values(selectedPlayers).some(p => p.id === player.id)
                            ? 'bg-green-600 text-white border-2 border-green-400'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-sm opacity-75">
                              Age: {player.age} • Skill: {player.skill} • Morale: {player.morale}
                            </div>
                          </div>
                          {Object.values(selectedPlayers).some(p => p.id === player.id) && (
                            <div className="text-green-300">✓</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Injured/International Duty Players */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-400">Unavailable Players</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {players.filter(p => p.injured || p.onInternationalDuty || p.isJongTeam).map((player) => (
                    <div key={player.id} className="p-3 bg-gray-700 rounded-lg opacity-50">
                      <div className="font-medium">{player.name}</div>
                      <div className="text-sm">
                        {player.injured ? '🩹 Injured' : player.onInternationalDuty ? '🏴 On International Duty' : '🤖 Jong Team'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSelection;