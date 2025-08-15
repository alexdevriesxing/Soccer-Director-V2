import React, { useState, useCallback } from 'react';
import HighlightPhaserScene from '../components/HighlightPhaserScene';
import { HighlightEvent, Team } from '../types/highlight';

const mockTeams: { homeTeam: Team; awayTeam: Team } = {
  homeTeam: {
    id: 'home',
    name: 'Ajax',
    formation: '4-3-3',
    players: [
      { id: 'h1', name: 'Home Striker', number: 9, position: 'ST', team: 'A' as const },
    ],
  },
  awayTeam: {
    id: 'away',
    name: 'PSV',
    formation: '4-3-3',
    players: [
      { id: 'a1', name: 'Away Keeper', number: 1, position: 'GK', team: 'B' as const },
    ],
  },
};

const defaultEvent: HighlightEvent = { id: 'e1', type: 'goal', team: 'A', playerName: 'Home Striker', minute: 23, description: 'Great finish!' };

const HighlightDemoPage: React.FC = () => {
  const [event, setEvent] = useState<HighlightEvent>(defaultEvent);
  const [status, setStatus] = useState<string>('Ready');

  const onComplete = useCallback(() => setStatus('Completed'), []);
  const onReady = useCallback(() => setStatus('Ready'), []);

  const runGoal = () => {
    setStatus('Running');
    setEvent({ id: 'e_goal', type: 'goal', team: 'A', playerName: 'Home Striker', minute: 10 });
  };
  const runMiss = () => {
    setStatus('Running');
    setEvent({ id: 'e_miss', type: 'miss', team: 'B', playerName: 'Away Forward', minute: 38 });
  };
  const runHalftime = () => {
    setStatus('Running');
    setEvent({ id: 'e_half', type: 'halftime', minute: 45, team: 'A' });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-3">Highlight Demo</h1>
      <div className="flex items-center gap-2 mb-3">
        <button onClick={runGoal} className="px-3.5 py-2 rounded-lg bg-green-500 text-gray-900 font-bold border-none cursor-pointer">Run Goal</button>
        <button onClick={runMiss} className="px-3.5 py-2 rounded-lg bg-yellow-500 text-gray-900 font-bold border-none cursor-pointer">Run Miss</button>
        <button onClick={runHalftime} className="px-3.5 py-2 rounded-lg bg-blue-500 text-gray-900 font-bold border-none cursor-pointer">Run Halftime</button>
        <div className="ml-3 opacity-85">Status: {status}</div>
      </div>
      <div className="bg-gray-800 p-2 rounded-xl w-[820px]">
        <HighlightPhaserScene
          highlightEvent={event}
          homeTeam={mockTeams.homeTeam}
          awayTeam={mockTeams.awayTeam}
          onComplete={onComplete}
          onReady={onReady}
        />
      </div>
    </div>
  );
};

export default HighlightDemoPage;