import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManagerProfile } from '../context/ManagerProfileContext';
import useTrainingCenterData from './useTrainingCenterData';

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
  loans?: any[];
}

const TrainingCenter: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useManagerProfile();
  const {
    players,
    loading,
    trainingProgress,
    loadTrainingProgress,
    setTrainingFocus,
    reload
  } = useTrainingCenterData();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [sessionType, setSessionType] = useState<'light' | 'normal' | 'intensive'>('normal');
  const [trainingResults, setTrainingResults] = useState<any[]>([]);

  const focusOptions = [
    { value: 'technical', label: 'Technical Skills', description: 'Improve ball control and technique' },
    { value: 'physical', label: 'Physical Conditioning', description: 'Enhance strength and stamina' },
    { value: 'mental', label: 'Mental Strength', description: 'Improve decision making and composure' },
    { value: 'tactical', label: 'Tactical Awareness', description: 'Better understanding of game situations' },
    { value: 'finishing', label: 'Finishing', description: 'Improve goal scoring ability' },
    { value: 'defending', label: 'Defending', description: 'Enhance defensive skills' },
    { value: 'passing', label: 'Passing', description: 'Improve passing accuracy and vision' },
    { value: 'dribbling', label: 'Dribbling', description: 'Enhance dribbling skills' },
    { value: 'shooting', label: 'Shooting', description: 'Improve shooting technique' },
    { value: 'stamina', label: 'Stamina', description: 'Increase endurance' },
    { value: 'strength', label: 'Strength', description: 'Build physical strength' },
    { value: 'speed', label: 'Speed', description: 'Improve acceleration and pace' },
    { value: 'leadership', label: 'Leadership', description: 'Develop leadership qualities' },
    { value: 'teamwork', label: 'Teamwork', description: 'Improve team coordination' }
  ];

  useEffect(() => {
    if (!profile) {
      navigate('/game-menu');
      return;
    }

    reload();
  }, [profile, navigate, reload]);

  const conductTrainingSession = async () => {
    if (!profile) return;
    
    try {
      const response = await fetch(`/api/game/club/${profile.club}/training`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionType
        }),
      });

      if (response.ok) {
        const results = await response.json();
        setTrainingResults(results);
        reload(); // Refresh squad data
      }
    } catch (error) {
      console.error('Failed to conduct training session:', error);
    }
  };

  const endTrainingFocus = async (playerId: number) => {
    try {
      const response = await fetch(`/api/game/player/${playerId}/training`, {
        method: 'DELETE',
      });

      if (response.ok) {
        reload(); // Refresh squad data
      }
    } catch (error) {
      console.error('Failed to end training focus:', error);
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'GK': return 'text-blue-400';
      case 'DEF': return 'text-green-400';
      case 'MID': return 'text-yellow-400';
      case 'FWD': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono">
        <div className="w-full max-w-lg bg-gray-800 rounded-xl shadow-lg p-8 mt-12 flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">Loading Training Center...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
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
              <h1 className="text-3xl font-bold text-green-400">Training Center</h1>
              <p className="text-gray-300">Develop your players and improve team performance</p>
            </div>
            <button
              onClick={() => navigate('/game-menu')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
            >
              ← Back to Menu
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Squad List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Squad</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {players
                  .filter(p => !p.injured && !p.onInternationalDuty && p.loans?.length === 0)
                  .map((player) => (
                    <div
                      key={player.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedPlayer?.id === player.id
                          ? 'bg-green-600'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      onClick={() => {
                        setSelectedPlayer(player);
                        loadTrainingProgress(player.id);
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className={`text-sm ${getPositionColor(player.position)}`}>
                            {player.position} • Age: {player.age}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{player.skill}</div>
                          <div className="text-sm text-blue-400">{player.morale}</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Training Focus */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Training Focus</h2>
              {selectedPlayer ? (
                <div>
                  <div className="mb-4 p-4 bg-gray-700 rounded-lg">
                    <h3 className="font-bold text-lg">{selectedPlayer.name}</h3>
                    <div className={`text-sm ${getPositionColor(selectedPlayer.position)}`}>
                      {selectedPlayer.position} • Skill: {selectedPlayer.skill} • Morale: {selectedPlayer.morale}
                    </div>
                  </div>

                  {trainingProgress?.activeFocus ? (
                    <div className="mb-4 p-4 bg-green-700 rounded-lg">
                      <h4 className="font-bold">Current Focus</h4>
                      <div>{trainingProgress.activeFocus.focus}</div>
                      <div className="text-sm">Intensity: {trainingProgress.activeFocus.intensity}/10</div>
                      <button
                        onClick={() => endTrainingFocus(selectedPlayer.id)}
                        className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm transition-colors"
                      >
                        End Focus
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <h4 className="font-bold mb-2">Set Training Focus</h4>
                      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                        {focusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setTrainingFocus(selectedPlayer.id, option.value)}
                            className="p-2 text-left bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                          >
                            <div className="font-medium">{option.label}</div>
                            <div className="text-xs text-gray-300">{option.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {trainingProgress?.recommendations && trainingProgress.recommendations.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-bold mb-2">Recommendations</h4>
                      <div className="space-y-2">
                        {trainingProgress.recommendations.map((rec: any, index: number) => (
                          <div key={index} className="p-2 bg-blue-700 rounded text-sm">
                            <div className="font-medium">{rec.focus}</div>
                            <div className="text-xs">{rec.reason}</div>
                            <div className="text-xs text-yellow-400">Priority: {rec.priority}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  Select a player to set training focus
                </div>
              )}
            </div>
          </div>

          {/* Training Session */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Training Session</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Session Type</label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value as any)}
                  className="w-full p-2 bg-gray-700 rounded border border-gray-600"
                >
                  <option value="light">Light Training</option>
                  <option value="normal">Normal Training</option>
                  <option value="intensive">Intensive Training</option>
                </select>
              </div>

              <div className="mb-4 p-3 bg-gray-700 rounded">
                <h4 className="font-bold mb-2">Session Effects</h4>
                <div className="text-sm space-y-1">
                  <div>Skill Gain: {sessionType === 'light' ? 'Low' : sessionType === 'normal' ? 'Medium' : 'High'}</div>
                  <div>Fatigue: {sessionType === 'light' ? 'Low' : sessionType === 'normal' ? 'Medium' : 'High'}</div>
                  <div>Injury Risk: {sessionType === 'light' ? 'Very Low' : sessionType === 'normal' ? 'Low' : 'Medium'}</div>
                </div>
              </div>

              <button
                onClick={conductTrainingSession}
                className="w-full p-3 bg-green-600 hover:bg-green-500 rounded-lg transition-colors font-bold"
              >
                Conduct Training Session
              </button>

              {trainingResults.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold mb-2">Training Results</h4>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {trainingResults.slice(0, 5).map((result, index) => {
                      const player = players.find(p => p.id === result.playerId);
                      return (
                        <div key={index} className="p-2 bg-gray-700 rounded text-sm">
                          <div className="font-medium">{player?.name}</div>
                          <div className="text-green-400">Skill +{result.skillGain.toFixed(2)}</div>
                          <div className="text-blue-400">Morale {result.moraleChange > 0 ? '+' : ''}{result.moraleChange}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingCenter;
