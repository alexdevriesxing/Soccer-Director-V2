import { useState, useEffect } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { getClubs } from '../api/footballApi';

/**
 * Custom hook for managing O21 team and parent club player data, pagination, and error handling.
 * @param profile The manager profile object (should contain club name)
 * @param navigate React Router navigate function for redirection
 * @returns O21 team data, parent club players, loading/error state, pagination controls, and handlers
 */
export function useO21TeamManagement(profile: any, navigate: NavigateFunction) {
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
    wage: number;
    contractExpiry: string;
  }
  interface O21Team {
    id: number;
    name: string;
    players: Player[];
  }
  interface ContractDetails {
    wage: number;
    contractExpiry: string;
  }

  const [o21Team, setO21Team] = useState<O21Team | null>(null);
  const [parentClubPlayers, setParentClubPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'squad' | 'promote' | 'demote' | 'contracts'>('squad');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractDetails, setContractDetails] = useState<ContractDetails>({ wage: 0, contractExpiry: '' });
  const [clubId, setClubId] = useState<number | null>(null);
  const [o21Page, setO21Page] = useState(1);
  const [o21PageSize, setO21PageSize] = useState(25);
  const [o21TotalPlayers, setO21TotalPlayers] = useState(0);
  const [o21TotalPages, setO21TotalPages] = useState(1);
  const [parentPage, setParentPage] = useState(1);
  const [parentPageSize, setParentPageSize] = useState(25);
  const [parentTotalPlayers, setParentTotalPlayers] = useState(0);
  const [parentTotalPages, setParentTotalPages] = useState(1);
  const [loadingO21, setLoadingO21] = useState(false);
  const [loadingParent, setLoadingParent] = useState(false);
  const [errorO21, setErrorO21] = useState<string | null>(null);
  const [errorParent, setErrorParent] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      navigate('/title-screen');
      return;
    }
    async function fetchClubId() {
      const clubs = await getClubs();
      const club = clubs.find((c: any) => c.name === profile.club);
      setClubId(club ? club.id : null);
    }
    fetchClubId();
  }, [profile, navigate]);

  useEffect(() => {
    if (!clubId) return;
    loadO21Team();
    loadParentClubPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId, o21Page, o21PageSize, parentPage, parentPageSize]);

  const loadO21Team = async () => {
    if (!clubId) return;
    setLoadingO21(true);
    setErrorO21(null);
    try {
      const base = process.env.REACT_APP_API_BASE || '';
      const response = await fetch(`${base}/api/o21/team/${clubId}?page=${o21Page}&limit=${o21PageSize}`);
      if (response.ok) {
        const data = await response.json();
        setO21Team(data.team);
        setO21TotalPlayers(data.totalPlayers || 0);
        setO21TotalPages(data.totalPages || 1);
      } else {
        setErrorO21('Failed to load O21 team');
      }
    } catch (error) {
      setErrorO21('Error loading O21 team');
    } finally {
      setLoadingO21(false);
    }
  };

  const loadParentClubPlayers = async () => {
    if (!clubId) return;
    setLoadingParent(true);
    setErrorParent(null);
    try {
      const base = process.env.REACT_APP_API_BASE || '';
      const response = await fetch(`${base}/api/players/club/${clubId}?page=${parentPage}&limit=${parentPageSize}`);
      if (response.ok) {
        const data = await response.json();
        setParentClubPlayers(data.players || []);
        setParentTotalPlayers(data.totalPlayers || 0);
        setParentTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      setErrorParent('Error loading parent club players');
    } finally {
      setLoadingParent(false);
    }
  };

  return {
    o21Team,
    parentClubPlayers,
    loading,
    activeTab,
    setActiveTab,
    selectedPlayer,
    setSelectedPlayer,
    showContractModal,
    setShowContractModal,
    contractDetails,
    setContractDetails,
    clubId,
    o21Page,
    setO21Page,
    o21PageSize,
    setO21PageSize,
    o21TotalPlayers,
    o21TotalPages,
    parentPage,
    setParentPage,
    parentPageSize,
    setParentPageSize,
    parentTotalPlayers,
    parentTotalPages,
    loadingO21,
    loadingParent,
    errorO21,
    errorParent,
    loadO21Team,
    loadParentClubPlayers
  };
} 