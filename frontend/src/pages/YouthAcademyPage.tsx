import React, { useCallback, useEffect, useState } from 'react';
import { useManagerProfile } from '../context/ManagerProfileContext';
import { useResolvedClubId } from '../hooks/useResolvedClubId';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

// Interfaces
export interface YouthPlayer {
  id: number;
  name: string;
  age: number;
  position: string;
  skill: number;
  potential: number;
}

export interface TrainingPlan {
  id: number;
  name: string;
  focus: string;
  mentorId?: number | null;
  player?: {
    id: number;
    name: string;
  };
  mentor?: {
    id: number;
    name: string;
  };
}

export interface Trainer {
  id: number;
  name: string;
  skill: number;
  type?: string;
  specialty?: string;
  wage?: number;
}

export interface Tournament {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status?: string;
}

const YouthAcademyPage: React.FC = () => {
  const { profile } = useManagerProfile();
  const { clubId, loading: clubIdLoading } = useResolvedClubId();
  const [youthPlayers, setYouthPlayers] = useState<YouthPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<number | null>(null);
  const [releasingId, setReleasingId] = useState<number | null>(null);
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planPlayerId, setPlanPlayerId] = useState<number | null>(null);
  const [planFocus, setPlanFocus] = useState('Skill');
  const [planMentorId, setPlanMentorId] = useState<number | null>(null);
  const [assigningPlan, setAssigningPlan] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleError = useCallback((e: unknown, defaultMessage: string) => {
    if (e instanceof Error) {
      setError(e.message);
    } else {
      setError(defaultMessage);
    }
  }, []);

  const fetchAll = useCallback(async (clubId: number) => {
    setLoading(true);
    setError(null);
    try {
      const [youthRes, plansRes, trainersRes, tournamentsRes] = await Promise.all([
        fetch(`/api/youth/scout/${clubId}`),
        fetch(`/api/youth-development/plans/${clubId}`),
        fetch(`/api/youth/trainers?clubId=${clubId}`),
        fetch(`/api/youth/tournaments?clubId=${clubId}`)
      ]);

      if (!youthRes.ok || !plansRes.ok || !trainersRes.ok || !tournamentsRes.ok) {
        throw new Error('Failed to fetch youth academy data');
      }

      const [youthData, plansData, trainersData, tournamentsData] = await Promise.all([
        youthRes.json(),
        plansRes.json(),
        trainersRes.json(),
        tournamentsRes.json()
      ]);

      setYouthPlayers(youthData.players || []);
      setPlans(plansData || []);
      setTrainers(trainersData.trainers || []);
      setTournaments(tournamentsData.tournaments || []);
    } catch (e: unknown) {
      handleError(e, 'Failed to fetch youth academy data');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const handlePromote = useCallback(async (playerId: number) => {
    if (!clubId) return;
    
    setPromotingId(playerId);
    setError(null);
    setSuccessMsg(null);
    
    try {
      const response = await fetch(`/api/youth/promote/${clubId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      });

      if (!response.ok) throw new Error('Failed to promote player');
      setSuccessMsg('Player promoted successfully!');
      await fetchAll(clubId);
    } catch (e: unknown) {
      handleError(e, 'Failed to promote player');
    } finally {
      setPromotingId(null);
    }
  }, [clubId, fetchAll, handleError]);

  const handleRelease = useCallback(async (playerId: number) => {
    if (!clubId) return;
    
    setReleasingId(playerId);
    setError(null);
    setSuccessMsg(null);
    
    try {
      const response = await fetch(`/api/youth/release/${clubId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      });

      if (!response.ok) throw new Error('Failed to release player');
      setSuccessMsg('Player released successfully');
      await fetchAll(clubId);
    } catch (e: unknown) {
      handleError(e, 'Failed to release player');
    } finally {
      setReleasingId(null);
    }
  }, [clubId, fetchAll, handleError]);

  const handleAssignPlan = useCallback(async () => {
    if (!clubId || !planPlayerId) return;
    
    setAssigningPlan(true);
    setError(null);
    setSuccessMsg(null);
    
    try {
      const response = await fetch(`/api/youth-development/plan/${clubId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: planPlayerId,
          focus: planFocus,
          mentorId: planMentorId
        })
      });

      if (!response.ok) throw new Error('Failed to assign development plan');
      
      setSuccessMsg('Development plan assigned successfully');
      setShowPlanModal(false);
      setPlanPlayerId(null);
      setPlanFocus('Skill');
      setPlanMentorId(null);
      await fetchAll(clubId);
    } catch (e: unknown) {
      handleError(e, 'Failed to assign development plan');
    } finally {
      setAssigningPlan(false);
    }
  }, [clubId, planPlayerId, planFocus, planMentorId, fetchAll, handleError]);

  useEffect(() => {
    if (clubId) {
      fetchAll(clubId);
    }
  }, [clubId, fetchAll]);

  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found" />;
  if (!profile) return <div>Please log in to view this page</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Youth Academy</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {successMsg && <div className="text-green-500 mb-4">{successMsg}</div>}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-8">
          {/* Youth Players Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Youth Players</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potential</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {youthPlayers.map((player) => (
                    <tr key={player.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{player.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{player.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{player.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{player.skill}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{player.potential}</td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handlePromote(player.id)}
                          disabled={!!promotingId}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                          {promotingId === player.id ? 'Promoting...' : 'Promote'}
                        </button>
                        <button
                          onClick={() => handleRelease(player.id)}
                          disabled={!!releasingId}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                        >
                          {releasingId === player.id ? 'Releasing...' : 'Release'}
                        </button>
                        <button
                          onClick={() => {
                            setPlanPlayerId(player.id);
                            setShowPlanModal(true);
                          }}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Assign Plan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Development Plans Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Development Plans</h2>
            {plans.length === 0 ? (
              <p>No development plans yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Focus</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {plans.map((plan) => (
                      <tr key={plan.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{plan.player?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{plan.focus}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{plan.mentor?.name || 'None'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Youth Tournament Section */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Youth Tournaments</h2>
            {tournaments.length === 0 ? (
              <p>No youth tournaments scheduled.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tournaments.map((tournament) => (
                      <tr key={tournament.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{tournament.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(tournament.startDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(tournament.endDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{tournament.status || 'Scheduled'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Assign Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Assign Development Plan</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Focus</label>
                <select
                  value={planFocus}
                  onChange={(e) => setPlanFocus(e.target.value)}
                  className="w-full p-2 border rounded"
                  disabled={assigningPlan}
                >
                  <option value="Skill">Skill</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Tactics">Tactics</option>
                  <option value="Mental">Mental</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mentor (Optional)</label>
                <select
                  value={planMentorId || ''}
                  onChange={(e) => setPlanMentorId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full p-2 border rounded"
                  disabled={assigningPlan}
                >
                  <option value="">None</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name} ({trainer.specialty || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  disabled={assigningPlan}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignPlan}
                  disabled={assigningPlan}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {assigningPlan ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouthAcademyPage;
