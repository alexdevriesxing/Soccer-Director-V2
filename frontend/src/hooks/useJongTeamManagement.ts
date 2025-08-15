import { useState, useEffect, useCallback } from 'react';

interface Player {
  id: number;
  name: string;
  position: string;
  age: number;
  skill: number;
  [key: string]: any;
}

interface Club {
  id: number;
  name: string;
  [key: string]: any;
}

interface Graduation {
  id: number;
  playerName: string;
  age: number;
  stats?: string;
  [key: string]: any;
}

interface UseJongTeamManagementProps {
  open: boolean;
  parentClub: Club | null;
}

/**
 * Custom React hook for managing Jong team and first squad data, graduation logic, and pagination.
 * Encapsulates all business/data logic for the JongTeamManagement UI component.
 *
 * @param {object} props - Hook props
 * @param {boolean} props.open - Whether the management modal is open
 * @param {object|null} props.parentClub - The parent club object (or null)
 * @returns {object} State and handlers for Jong team management UI
 *   - jongSquad, firstSquad: Player arrays
 *   - loading, loadingJong, loadingFirst: Loading states
 *   - jongTeam: Club object
 *   - leagueTable, fixtures: Arrays
 *   - graduations, showGraduation, currentGrad: Graduation state
 *   - pagination state and setters for both squads
 *   - errorJong, errorFirst: Error states
 *   - handleGraduationDecision: Graduation handler
 *   - setShowGraduation, setCurrentGrad: Graduation state setters
 */
export default function useJongTeamManagement({ open, parentClub }: UseJongTeamManagementProps) {
  const [jongSquad, setJongSquad] = useState<Player[]>([]);
  const [firstSquad, setFirstSquad] = useState<Player[]>([]);
  const [loadingJong, setLoadingJong] = useState(false);
  const [loadingFirst, setLoadingFirst] = useState(false);
  const [errorJong, setErrorJong] = useState<string | null>(null);
  const [errorFirst, setErrorFirst] = useState<string | null>(null);
  const [jongPage, setJongPage] = useState(1);
  const [jongPageSize, setJongPageSize] = useState(25);
  const [jongTotalPlayers, setJongTotalPlayers] = useState(0);
  const [jongTotalPages, setJongTotalPages] = useState(1);
  const [firstPage, setFirstPage] = useState(1);
  const [firstPageSize, setFirstPageSize] = useState(25);
  const [firstTotalPlayers, setFirstTotalPlayers] = useState(0);
  const [firstTotalPages, setFirstTotalPages] = useState(1);
  const [graduations, setGraduations] = useState<Graduation[]>([]);
  const [showGraduation, setShowGraduation] = useState(false);
  const [currentGrad, setCurrentGrad] = useState<Graduation | null>(null);
  const [loading, setLoading] = useState(false);
  const [jongTeam, setJongTeam] = useState<Club | null>(null);
  const [leagueTable, setLeagueTable] = useState<any[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);

  // --- ADMIN GATING (for demonstration, hardcoded) ---
  const isAdmin = true; // Replace with real auth in production

  // --- CRUD for Jong Team ---
  const [feedback, setFeedback] = useState('');

  const createJongTeam = async (parentClubId: number, name: string, leagueId: string) => {
    try {
      const response = await fetch(`/api/jong-team/${parentClubId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, leagueId })
      });
      if (!response.ok) throw new Error('Failed to create Jong team');
      setFeedback('Jong team created.');
      await loadJongTeamData();
    } catch (e) {
      setFeedback('Error creating Jong team.');
    }
  };

  const editJongTeam = async (jongTeamId: number, name: string, leagueId: string) => {
    try {
      const response = await fetch(`/api/jong-team/${jongTeamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, leagueId })
      });
      if (!response.ok) throw new Error('Failed to update Jong team');
      setFeedback('Jong team updated.');
      await loadJongTeamData();
    } catch (e) {
      setFeedback('Error updating Jong team.');
    }
  };

  const deleteJongTeam = async (jongTeamId: number) => {
    try {
      const response = await fetch(`/api/jong-team/${jongTeamId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete Jong team');
      setFeedback('Jong team deleted.');
      await loadJongTeamData();
    } catch (e) {
      setFeedback('Error deleting Jong team.');
    }
  };

  const moveToFirst = async (parentClubId: number, playerId: number) => {
    try {
      const response = await fetch(`/api/jong-team/${parentClubId}/promote-player/${playerId}`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to promote player');
      setFeedback('Player promoted to first team.');
      await loadJongTeamData();
      await loadJongSquad();
      await loadFirstSquad();
    } catch (e) {
      setFeedback('Error promoting player.');
    }
  };

  const moveToJong = async (jongTeamId: number, playerId: number) => {
    try {
      const response = await fetch(`/api/jong-team/${jongTeamId}/add-player/${playerId}`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to move player');
      setFeedback('Player moved to Jong team.');
      await loadJongTeamData();
      await loadJongSquad();
      await loadFirstSquad();
    } catch (e) {
      setFeedback('Error moving player.');
    }
  };

  const loadJongSquad = useCallback(async () => {
    if (!open || !parentClub) return;
    setLoadingJong(true);
    setErrorJong(null);
    try {
      const response = await fetch(`/api/jong-team/${parentClub.id}/squad?page=${jongPage}&limit=${jongPageSize}`);
      if (response.ok) {
        const data = await response.json();
        setJongSquad(data.players || []);
        setJongTotalPlayers(data.totalPlayers || 0);
        setJongTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      setErrorJong('Error loading jong squad');
    } finally {
      setLoadingJong(false);
    }
  }, [open, parentClub, jongPage, jongPageSize]);

  const loadFirstSquad = useCallback(async () => {
    if (!open || !parentClub) return;
    setLoadingFirst(true);
    setErrorFirst(null);
    try {
      const response = await fetch(`/api/jong-team/${parentClub.id}/first-squad?page=${firstPage}&limit=${firstPageSize}`);
      if (response.ok) {
        const data = await response.json();
        setFirstSquad(data.players || []);
        setFirstTotalPlayers(data.totalPlayers || 0);
        setFirstTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      setErrorFirst('Error loading first squad');
    } finally {
      setLoadingFirst(false);
    }
  }, [open, parentClub, firstPage, firstPageSize]);

  const loadJongTeamData = useCallback(async () => {
    if (!open || !parentClub) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/jong-team/${parentClub.id}`);
      if (response.ok) {
        const data = await response.json();
        setJongTeam(data.jongTeam || null);
        setLeagueTable(data.leagueTable || []);
        setFixtures(data.fixtures || []);
      }
    } finally {
      setLoading(false);
    }
  }, [open, parentClub]);

  useEffect(() => {
    loadJongSquad();
  }, [loadJongSquad]);

  useEffect(() => {
    loadFirstSquad();
  }, [loadFirstSquad]);

  useEffect(() => {
    loadJongTeamData();
  }, [loadJongTeamData]);

  const handleGraduationDecision = async (decision: 'accept' | 'reject') => {
    if (!currentGrad) return;
    await fetch(`/api/jong-team/graduations/${currentGrad.id}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision })
    });
    const next = graduations.slice(1);
    setGraduations(next);
    if (next.length > 0) {
      setCurrentGrad(next[0]);
      setShowGraduation(true);
    } else {
      setShowGraduation(false);
    }
  };

  return {
    jongSquad,
    firstSquad,
    loading,
    loadingJong,
    loadingFirst,
    jongTeam,
    leagueTable,
    fixtures,
    errorJong,
    errorFirst,
    graduations,
    showGraduation,
    currentGrad,
    jongPage,
    setJongPage,
    jongPageSize,
    setJongPageSize,
    jongTotalPlayers,
    jongTotalPages,
    firstPage,
    setFirstPage,
    firstPageSize,
    setFirstPageSize,
    firstTotalPlayers,
    firstTotalPages,
    handleGraduationDecision,
    setShowGraduation,
    setCurrentGrad,
    isAdmin,
    feedback,
    createJongTeam,
    editJongTeam,
    deleteJongTeam,
    moveToFirst,
    moveToJong
  };
} 