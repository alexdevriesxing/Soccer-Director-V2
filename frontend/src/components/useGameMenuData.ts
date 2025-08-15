import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useManagerProfile } from '../context/ManagerProfileContext';
import { getClubs, getLeagueTable, getFixtures } from '../api/footballApi';

interface Club {
  id: number;
  name: string;
  [key: string]: any;
}

/**
 * Custom React hook for loading and managing club data, league position, next fixture, notifications, and error/loading state for the Game Menu UI.
 * Encapsulates all business/data logic for the GameMenu component.
 *
 * @returns {object} State and handlers for Game Menu UI:
 *   - clubData: Club object or null
 *   - leaguePosition: number or null
 *   - nextFixture: Fixture object or null
 *   - loading: boolean
 *   - notifications: array
 *   - showNoFixtureMsg: boolean
 *   - error: string or null
 *   - setNotifications, setShowNoFixtureMsg: setters
 *   - reload: function to reload club data
 */
export default function useGameMenuData() {
  const navigate = useNavigate();
  const { profile } = useManagerProfile();
  const [clubData, setClubData] = useState<Club | null>(null);
  const [leaguePosition, setLeaguePosition] = useState<number | null>(null);
  const [nextFixture, setNextFixture] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNoFixtureMsg, setShowNoFixtureMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClubData = useCallback(async () => {
    if (!profile) {
      navigate('/');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [clubs, tableData, fixturesData] = await Promise.all([
        getClubs(),
        getLeagueTable(profile.club),
        getFixtures({ clubId: profile.club })
      ]);
      // Find club data
      const club = clubs.find((c: any) => c.name === profile.club);
      setClubData(club);
      // Find league position
      const table = tableData.table || [];
      const clubIdx = table.findIndex((row: any) => row.name === profile.club);
      setLeaguePosition(clubIdx >= 0 ? clubIdx + 1 : null);
      // Find next fixture
      const next = fixturesData.find((f: any) => !f.played) || null;
      setNextFixture(next);
      setLoading(false);
    } catch (err: any) {
      setError('Failed to load club data');
      setLoading(false);
    }
  }, [profile, navigate]);

  useEffect(() => {
    loadClubData();
  }, [loadClubData]);

  return {
    clubData,
    leaguePosition,
    nextFixture,
    loading,
    notifications,
    showNoFixtureMsg,
    error,
    setNotifications,
    setShowNoFixtureMsg,
    reload: loadClubData
  };
} 