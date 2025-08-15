import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EuropeanCups: React.FC = () => {
  const navigate = useNavigate();

  const competitions = [
    { id: 'champions', name: 'UEFA Champions League', status: 'Not Qualified', stage: 'N/A' },
    { id: 'europa', name: 'UEFA Europa League', status: 'Not Qualified', stage: 'N/A' },
    { id: 'conference', name: 'UEFA Conference League', status: 'Not Qualified', stage: 'N/A' }
  ];

  const mockFixtures = [
    { id: 1, home: 'RBC', away: 'Ajax', date: '2024-09-15', time: '20:00', competition: 'Champions League', stage: 'Group Stage' },
    { id: 2, home: 'PSV', away: 'RBC', date: '2024-09-29', time: '20:00', competition: 'Champions League', stage: 'Group Stage' },
    { id: 3, home: 'RBC', away: 'Bayern Munich', date: '2024-10-20', time: '20:00', competition: 'Champions League', stage: 'Group Stage' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-400">European Competitions</h1>
              <p className="text-gray-300">Manage your club's European campaigns</p>
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
          {/* Competition Status */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Qualification Status</h2>
              <div className="space-y-4">
                {competitions.map((comp) => (
                  <div key={comp.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="font-bold text-lg mb-2">{comp.name}</div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Status:</span>
                      <span className={`font-bold ${
                        comp.status === 'Qualified' ? 'text-green-400' : 
                        comp.status === 'In Progress' ? 'text-yellow-400' : 'text-gray-400'
                      }`}>
                        {comp.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Stage:</span>
                      <span className="text-gray-300">{comp.stage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* European Stats */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">European Statistics</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Champions League Titles:</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex justify-between">
                  <span>Europa League Titles:</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex justify-between">
                  <span>European Matches:</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex justify-between">
                  <span>European Goals:</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex justify-between">
                  <span>UEFA Coefficient:</span>
                  <span className="font-bold">15.000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fixtures and Results */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">European Fixtures</h2>
              
              {mockFixtures.length > 0 ? (
                <div className="space-y-4">
                  {mockFixtures.map((fixture) => (
                    <div key={fixture.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">{fixture.competition} - {fixture.stage}</span>
                        <span className="text-sm text-gray-400">{fixture.date} {fixture.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <span className="font-bold">{fixture.home}</span>
                          <span className="text-gray-400">vs</span>
                          <span className="font-bold">{fixture.away}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors">
                            Prepare
                          </button>
                          <button className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm transition-colors">
                            Play
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-lg mb-2">No European fixtures scheduled</div>
                  <div className="text-gray-500 text-sm">Qualify for European competitions to see fixtures here</div>
                </div>
              )}
            </div>

            {/* European Actions */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">European Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors">
                  Register Squad
                </button>
                <button className="p-4 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors">
                  European Scouting
                </button>
                <button className="p-4 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition-colors">
                  UEFA Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EuropeanCups;
