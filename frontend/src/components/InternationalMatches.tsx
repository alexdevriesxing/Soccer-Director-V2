import React from 'react';
import { useNavigate } from 'react-router-dom';

const InternationalMatches: React.FC = () => {
  const navigate = useNavigate();

  const nationalTeams = [
    { id: 'netherlands', name: 'Netherlands', region: 'Europe', ranking: 7, manager: 'Ronald Koeman' },
    { id: 'belgium', name: 'Belgium', region: 'Europe', ranking: 3, manager: 'Domenico Tedesco' },
    { id: 'germany', name: 'Germany', region: 'Europe', ranking: 16, manager: 'Julian Nagelsmann' }
  ];

  const mockFixtures = [
    { id: 1, home: 'Netherlands', away: 'Belgium', date: '2024-09-05', time: '20:45', competition: 'UEFA Nations League', venue: 'Johan Cruyff Arena', status: 'scheduled' },
    { id: 2, home: 'Germany', away: 'Netherlands', date: '2024-09-08', time: '20:45', competition: 'UEFA Nations League', venue: 'Allianz Arena', status: 'scheduled' },
    { id: 3, home: 'Netherlands', away: 'France', date: '2024-10-12', time: '20:45', competition: 'UEFA Nations League', venue: 'Johan Cruyff Arena', status: 'scheduled' }
  ];

  const callUps = [
    { id: 1, name: 'Virgil van Dijk', club: 'Liverpool', position: 'DEF', status: 'Called Up' },
    { id: 2, name: 'Frenkie de Jong', club: 'Barcelona', position: 'MID', status: 'Called Up' },
    { id: 3, name: 'Cody Gakpo', club: 'Liverpool', position: 'FWD', status: 'Called Up' },
    { id: 4, name: 'Xavi Simons', club: 'RB Leipzig', position: 'MID', status: 'Called Up' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-400">International Matches</h1>
              <p className="text-gray-300">Manage national team call-ups and international fixtures</p>
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
          {/* National Teams */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">National Teams</h2>
              <div className="space-y-4">
                {nationalTeams.map((team) => (
                  <div key={team.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-lg">{team.name}</div>
                      <span className="text-sm text-gray-400">#{team.ranking}</span>
                    </div>
                    <div className="text-sm text-gray-300 mb-2">
                      Manager: {team.manager}
                    </div>
                    <div className="text-sm text-gray-400">
                      Region: {team.region}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* International Stats */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">Your Players</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Called Up:</span>
                  <span className="font-bold text-green-400">{callUps.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>On International Duty:</span>
                  <span className="font-bold text-blue-400">2</span>
                </div>
                <div className="flex justify-between">
                  <span>Returning Soon:</span>
                  <span className="font-bold text-yellow-400">1</span>
                </div>
              </div>
            </div>
          </div>

          {/* International Fixtures */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">International Fixtures</h2>
              
              {mockFixtures.length > 0 ? (
                <div className="space-y-4">
                  {mockFixtures.map((fixture) => (
                    <div key={fixture.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">{fixture.competition}</span>
                        <span className="text-sm text-gray-400">{fixture.date} {fixture.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <span className="font-bold">{fixture.home}</span>
                          <span className="text-gray-400">vs</span>
                          <span className="font-bold">{fixture.away}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          📍 {fixture.venue}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-lg mb-2">No international fixtures scheduled</div>
                  <div className="text-gray-500 text-sm">International breaks are scheduled by FIFA/UEFA</div>
                </div>
              )}
            </div>

            {/* Call-ups */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">Recent Call-ups</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-3">Player</th>
                      <th className="text-left p-3">Club</th>
                      <th className="text-left p-3">Position</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {callUps.map((player) => (
                      <tr key={player.id} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="p-3 font-medium">{player.name}</td>
                        <td className="p-3">{player.club}</td>
                        <td className="p-3">{player.position}</td>
                        <td className="p-3">
                          <span className="text-green-400">{player.status}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <button className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs transition-colors">
                              View
                            </button>
                            <button className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-xs transition-colors">
                              Withdraw
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* International Actions */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">International Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors">
                  Request Call-up
                </button>
                <button className="p-4 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors">
                  International Scouting
                </button>
                <button className="p-4 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors">
                  FIFA Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternationalMatches;
