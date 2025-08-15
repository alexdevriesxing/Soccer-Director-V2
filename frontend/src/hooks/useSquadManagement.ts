import { useState, useEffect } from 'react';
import { getPlayers } from '../api/footballApi';
import { NavigateFunction } from 'react-router-dom';
import { autoSelectBestXI, setStartingXI as apiSetStartingXI } from '../services/club-data-service';

/**
 * Custom hook for managing squad data, pagination, and player status filtering.
 * @param profile The manager profile object (should contain clubId or club.id)
 * @param navigate React Router navigate function for redirection
 * @returns Squad data, loading/error state, pagination controls, and status filter function
 */
export function useSquadManagement(profile: any, navigate: NavigateFunction) {
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
    onLoan: boolean;
    loanClub?: string;
    wage?: number;
    contractExpiry?: string;
  }

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedXI, setSelectedXI] = useState<Player[] | null>(null);

  useEffect(() => {
    if (!profile) {
      navigate('/game-menu');
      return;
    }
    setLoading(true);
    setError(null);
    // Determine clubId from profile
    let clubId: number | string | undefined = (profile as any).clubId || (profile as any).club?.id;
    if (!clubId) {
      setError('No club ID found in profile.');
      setLoading(false);
      return;
    }
    getPlayers({ clubId: String(clubId) })
      .then((res: any) => {
        // If paginated response
        if (res.data && res.data.players) {
          setPlayers(res.data.players || []);
          setTotalPlayers(res.data.totalPlayers || 0);
          setTotalPages(res.data.totalPages || 1);
        } else if (Array.isArray(res.data)) {
          // If just an array of players
          setPlayers(res.data);
          setTotalPlayers(res.data.length);
          setTotalPages(1);
        } else {
          setPlayers([]);
          setTotalPlayers(0);
          setTotalPages(1);
        }
      })
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, [profile, navigate, page, pageSize]);

  /**
   * Filter players by status
   * @param status Player status: 'available', 'injured', 'international', or 'loan'
   * @returns Filtered array of players
   */
  const getPlayersByStatus = (status: 'available' | 'injured' | 'international' | 'loan') => {
    switch (status) {
      case 'available':
        return players.filter((p) => !p.injured && !p.onInternationalDuty && !p.onLoan);
      case 'injured':
        return players.filter((p) => p.injured);
      case 'international':
        return players.filter((p) => p.onInternationalDuty);
      case 'loan':
        return players.filter((p) => p.onLoan);
      default:
        return players;
    }
  };

  /**
   * Calls backend to auto-select the best XI and updates state
   */
  const handleAutoSelectBestXI = async () => {
    let clubId: number | string | undefined = (profile as any).clubId || (profile as any).club?.id;
    if (!clubId) {
      setError('No club ID found in profile.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const xi = await autoSelectBestXI(clubId);
      setSelectedXI(xi);
      return xi;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Persists the selected XI as the club's starting lineup
   */
  const setStartingXI = async (xi: Player[]) => {
    let clubId: number | string | undefined = (profile as any).clubId || (profile as any).club?.id;
    if (!clubId) {
      setError('No club ID found in profile.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Map players to required format (id, position, order)
      const payload = xi.map((p, idx) => ({ id: p.id, position: p.position, order: idx + 1 }));
      const result = await apiSetStartingXI(clubId, payload);
      return result;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    players,
    loading,
    error,
    page,
    pageSize,
    totalPlayers,
    totalPages,
    setPage,
    setPageSize,
    getPlayersByStatus,
    selectedXI,
    autoSelectBestXI: handleAutoSelectBestXI,
    setStartingXI,
  };
} 