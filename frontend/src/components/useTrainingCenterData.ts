import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManagerProfile } from '../context/ManagerProfileContext';

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
  [key: string]: any;
}

/**
 * Custom React hook for managing squad data, training progress, and training focus logic for the Training Center UI.
 * Encapsulates all business/data logic for the TrainingCenter component.
 *
 * @returns {object} State and handlers for Training Center UI:
 *   - players: array of Player
 *   - loading: boolean
 *   - error: string or null
 *   - trainingProgress: any
 *   - loadTrainingProgress: function to load training progress for a player
 *   - setTrainingFocus: function to set training focus for a player
 *   - reload: function to reload squad data
 */
export default function useTrainingCenterData() {
  const navigate = useNavigate();
  const { profile } = useManagerProfile();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trainingProgress, setTrainingProgress] = useState<any>(null);

  const loadSquadData = useCallback(async () => {
    if (!profile) {
      navigate('/game-menu');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`/api/game/club/${profile.club}/squad`);
      const data = await response.json();
      setPlayers(data.players);
    } catch (error) {
      setError('Failed to load squad data');
    } finally {
      setLoading(false);
    }
  }, [profile, navigate]);

  const loadTrainingProgress = useCallback(async (playerId: number) => {
    try {
      const response = await fetch(`/api/game/player/${playerId}/training`);
      const progress = await response.json();
      setTrainingProgress(progress);
    } catch (error) {
      setError('Failed to load training progress');
    }
  }, []);

  const setTrainingFocus = useCallback(async (playerId: number, focus: string, isExtra: boolean = false) => {
    if (!profile) return;
    try {
      const response = await fetch(`/api/game/player/${playerId}/training`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clubId: profile.club,
          focus,
          isExtra
        }),
      });
      if (response.ok) {
        await loadTrainingProgress(playerId);
        await loadSquadData();
      }
    } catch (error) {
      setError('Failed to set training focus');
    }
  }, [profile, loadTrainingProgress, loadSquadData]);

  useEffect(() => {
    loadSquadData();
  }, [loadSquadData]);

  return {
    players,
    loading,
    error,
    trainingProgress,
    loadTrainingProgress,
    setTrainingFocus,
    reload: loadSquadData
  };
} 