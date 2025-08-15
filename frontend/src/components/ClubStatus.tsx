import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ClubStatus: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('overview');

  const clubData = {
    name: 'RBC',
    reputation: 75,
    finances: 85,
    facilities: 60,
    youth: 45,
    staff: 72,
    players: 78,
    overall: 69
  };

  const seasonStats = {
    leaguePosition: 8,
    points: 45,
    matchesPlayed: 28,
    wins: 12,
    draws: 9,
    losses: 7,
    goalsFor: 38,
    goalsAgainst: 32,
    goalDifference: 6
  };

  const recentForm = ['W', 'D', 'L', 'W', 'W', 'D', 'L', 'W', 'D', 'W'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-400">Club Status</h1>
              <p className="text-gray-300">Overview of your club's performance and standing</p>
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
          {/* Club Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Club Rating */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Club Rating</h2>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">{clubData.overall}</div>
                  <div className="text-sm text-gray-400">Overall Rating</div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Reputation</span>
                    <div className="flex items-center">
                      <span className="mr-2">{clubData.reputation}</span>
                      <div className="w-20 bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${clubData.reputation}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Finances</span>
                    <div className="flex items-center">
                      <span className="mr-2">{clubData.finances}</span>
                      <div className="w-20 bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${clubData.finances}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Facilities</span>
                    <div className="flex items-center">
                      <span className="mr-2">{clubData.facilities}</span>
                      <div className="w-20 bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${clubData.facilities}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Youth</span>
                    <div className="flex items-center">
                      <span className="mr-2">{clubData.youth}</span>
                      <div className="w-20 bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${clubData.youth}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Season Stats */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Season Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>League Position:</span>
                  <span className="font-bold text-blue-400">{seasonStats.leaguePosition}</span>
                </div>
                <div className="flex justify-between">
                  <span>Points:</span>
                  <span className="font-bold">{seasonStats.points}</span>
                </div>
                <div className="flex justify-between">
                  <span>Matches Played:</span>
                  <span className="font-bold">{seasonStats.matchesPlayed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wins:</span>
                  <span className="font-bold text-green-400">{seasonStats.wins}</span>
                </div>
                <div className="flex justify-between">
                  <span>Draws:</span>
                  <span className="font-bold text-yellow-400">{seasonStats.draws}</span>
                </div>
                <div className="flex justify-between">
                  <span>Losses:</span>
                  <span className="font-bold text-red-400">{seasonStats.losses}</span>
                </div>
                <div className="flex justify-between">
                  <span>Goal Difference:</span>
                  <span className={`font-bold ${seasonStats.goalDifference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {seasonStats.goalDifference >= 0 ? '+' : ''}{seasonStats.goalDifference}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Form */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Recent Form</h2>
              <div className="flex space-x-2">
                {recentForm.map((result, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      result === 'W' ? 'bg-green-600' :
                      result === 'D' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Performance Analysis</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedTab('overview')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      selectedTab === 'overview' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setSelectedTab('attacking')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      selectedTab === 'attacking' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    Attacking
                  </button>
                  <button
                    onClick={() => setSelectedTab('defending')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      selectedTab === 'defending' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    Defending
                  </button>
                  <button
                    onClick={() => setSelectedTab('financial')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      selectedTab === 'financial' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    Financial
                  </button>
                </div>
              </div>

              {selectedTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-bold mb-3">Goals</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Goals For:</span>
                        <span className="font-bold text-green-400">{seasonStats.goalsFor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Goals Against:</span>
                        <span className="font-bold text-red-400">{seasonStats.goalsAgainst}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Goal Difference:</span>
                        <span className={`font-bold ${seasonStats.goalDifference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {seasonStats.goalDifference >= 0 ? '+' : ''}{seasonStats.goalDifference}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-bold mb-3">Results</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Win Rate:</span>
                        <span className="font-bold text-green-400">{Math.round((seasonStats.wins / seasonStats.matchesPlayed) * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Draw Rate:</span>
                        <span className="font-bold text-yellow-400">{Math.round((seasonStats.draws / seasonStats.matchesPlayed) * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Loss Rate:</span>
                        <span className="font-bold text-red-400">{Math.round((seasonStats.losses / seasonStats.matchesPlayed) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'attacking' && (
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-bold mb-3">Attacking Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{seasonStats.goalsFor}</div>
                        <div className="text-sm text-gray-400">Goals Scored</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">1.36</div>
                        <div className="text-sm text-gray-400">Goals per Game</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">45</div>
                        <div className="text-sm text-gray-400">Shots on Target</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">32%</div>
                        <div className="text-sm text-gray-400">Conversion Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'defending' && (
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-bold mb-3">Defensive Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">{seasonStats.goalsAgainst}</div>
                        <div className="text-sm text-gray-400">Goals Conceded</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">1.14</div>
                        <div className="text-sm text-gray-400">Goals per Game</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">8</div>
                        <div className="text-sm text-gray-400">Clean Sheets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">29%</div>
                        <div className="text-sm text-gray-400">Clean Sheet Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'financial' && (
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-bold mb-3">Financial Health</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">€2.5M</div>
                        <div className="text-sm text-gray-400">Current Balance</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">€1.8M</div>
                        <div className="text-sm text-gray-400">Monthly Wages</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">€450K</div>
                        <div className="text-sm text-gray-400">Matchday Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">65%</div>
                        <div className="text-sm text-gray-400">Wage to Turnover</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Club Actions */}
            <div className="mt-6 bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Club Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button className="p-4 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors">
                  Club Development
                </button>
                <button className="p-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors">
                  Youth Investment
                </button>
                <button className="p-4 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors">
                  Facility Upgrade
                </button>
                <button className="p-4 bg-orange-600 hover:bg-orange-500 rounded-lg font-semibold transition-colors">
                  Club Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubStatus;
