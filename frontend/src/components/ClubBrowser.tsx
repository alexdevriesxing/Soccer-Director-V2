import React, { useState, useEffect } from 'react';
import { getLeagues, getClubsByDivision as apiGetClubsByDivision } from '../api/footballApi';

interface League {
  id: number;
  name: string;
  tier: string;
  division: string | null;
  season: string;
  clubsCount: number;
}

interface RegionData {
  region: string;
  leagues: League[];
}

interface Club {
  id: number;
  name: string;
  homeCity: string | null;
  morale: number;
  form: string;
  regionTag: string | null;
}

interface LeagueWithClubs {
  id: number;
  name: string;
  tier: string;
  region: string | null;
  division: string | null;
  season: string;
  clubs: Club[];
  _count: {
    clubs: number;
    fixtures: number;
  };
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const ClubBrowser: React.FC = () => {
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [clubsLoading, setClubsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clubsError, setClubsError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalClubs, setTotalClubs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch leagues on component mount
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getLeagues();
        setRegions(data);
      } catch (err) {
        setError('Failed to load leagues. Please try again.');
        console.error('Error fetching leagues:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  // Fetch clubs when league selection changes
  useEffect(() => {
    if (!selectedLeague || selectedLeague === '') {
      setClubs([]);
      return;
    }

    const fetchClubs = async () => {
      try {
        setClubsLoading(true);
        setClubsError(null);
        console.log('Fetching clubs for league:', selectedLeague);
        const leagueData: LeagueWithClubs = await apiGetClubsByDivision(selectedLeague);
        setClubs(leagueData.clubs);
      } catch (err) {
        setClubsError('Failed to load clubs. Please try again.');
        console.error('Error fetching clubs:', err);
      } finally {
        setClubsLoading(false);
      }
    };

    fetchClubs();
  }, [selectedLeague]);

  useEffect(() => {
    if (!selectedLeague) return;
    setLoading(true);
    setError(null);
    // When fetching clubs, always include required params. For all clubs, use /api/clubs/all
    // Example:
    // fetch(`/api/clubs?region=West&division=Eredivisie`)
    // or fetch(`/api/clubs/all`) for all clubs
    fetch(`/api/clubs/all?leagueId=${selectedLeague}&page=${page}&limit=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        setClubs(data.clubs || []);
        setTotalClubs(data.totalClubs || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedLeague, page, pageSize]);

  // Reset league selection when region changes
  useEffect(() => {
    setSelectedLeague('');
    setClubs([]);
  }, [selectedRegion]);

  const getAvailableRegions = () => {
    return regions.map(region => region.region);
  };

  const getAvailableLeagues = () => {
    if (!selectedRegion) return [];
    const regionData = regions.find(r => r.region === selectedRegion);
    return regionData?.leagues?.filter(league => league && league.id != null) || [];
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'EREDIVISIE': return 'text-red-500';
      case 'EERSTE_DIVISIE': return 'text-orange-500';
      case 'TWEEDE_DIVISIE': return 'text-yellow-500';
      case 'DERDE_DIVISIE': return 'text-green-500';
      case 'VIERDE_DIVISIE': return 'text-blue-500';
      case 'O21_TOP': return 'text-purple-500';
      case 'O21_2': return 'text-purple-400';
      case 'O21_3': return 'text-purple-300';
      case 'O21_4': return 'text-purple-200';
      case 'AMATEUR': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getMoraleColor = (morale: number) => {
    if (morale >= 80) return 'text-green-400';
    if (morale >= 70) return 'text-yellow-400';
    if (morale >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getFormColor = (form: string) => {
    const wins = (form.match(/W/g) || []).length;
    const draws = (form.match(/D/g) || []).length;
    const losses = (form.match(/L/g) || []).length;
    
    const points = wins * 3 + draws;
    if (points >= 12) return 'text-green-400';
    if (points >= 8) return 'text-yellow-400';
    if (points >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono">
        <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-4 text-center">Loading Club Browser...</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono">
        <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-4 text-center text-red-400">Error Loading Leagues</h2>
          <p className="text-center text-gray-300 mb-6">{error}</p>
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-400">Club Browser</h1>
              <p className="text-gray-300">Browse clubs by region and division</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Selection Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Select League</h2>
              
              {/* Region Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Region</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-green-400"
                >
                  <option value="">Select a region...</option>
                  {getAvailableRegions().map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              {/* League Selection */}
              {selectedRegion && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Division</label>
                  <select
                    value={selectedLeague}
                    onChange={(e) => setSelectedLeague(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-green-400"
                  >
                    <option value="">Select a division...</option>
                    {getAvailableLeagues().map((league) => (
                      <option key={league.id} value={league.id}>
                        {league.name} ({league.clubsCount} clubs)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Stats */}
              {selectedLeague && (
                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <h3 className="font-bold mb-2">League Info</h3>
                  <div className="space-y-1 text-sm">
                    <div>Selected: {getAvailableLeagues().find(l => l.id?.toString() === selectedLeague)?.name}</div>
                    <div>Clubs: {totalClubs}</div>
                    <div>Season: {getAvailableLeagues().find(l => l.id?.toString() === selectedLeague)?.season}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Clubs Display */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {selectedLeague 
                    ? `${getAvailableLeagues().find(l => l.id?.toString() === selectedLeague)?.name} Clubs`
                    : 'Select a league to view clubs'
                  }
                </h2>
                {selectedLeague && (
                  <span className="text-sm text-gray-400">
                    {totalClubs} clubs
                  </span>
                )}
              </div>

              {clubsLoading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
                  <span className="ml-3">Loading clubs...</span>
                </div>
              )}

              {clubsError && (
                <div className="text-center py-12">
                  <p className="text-red-400 mb-4">{clubsError}</p>
                  <button 
                    onClick={() => setSelectedLeague(selectedLeague)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!selectedLeague && !clubsLoading && !clubsError && (
                <div className="text-center py-12 text-gray-400">
                  <p>Please select a region and division to view clubs</p>
                </div>
              )}

              {clubs.length > 0 && !clubsLoading && !clubsError && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-3">Club</th>
                        <th className="text-left p-3">City</th>
                        <th className="text-left p-3">Morale</th>
                        <th className="text-left p-3">Form</th>
                        <th className="text-left p-3">Region Tag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clubs.map((club) => (
                        <tr key={club.id} className="border-b border-gray-700 hover:bg-gray-700">
                          <td className="p-3 font-medium">{club.name}</td>
                          <td className="p-3 text-gray-300">{club.homeCity || 'N/A'}</td>
                          <td className="p-3">
                            <span className={getMoraleColor(club.morale)}>
                              {club.morale}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={getFormColor(club.form)}>
                              {club.form || 'N/A'}
                            </span>
                          </td>
                          <td className="p-3 text-gray-300">
                            {club.regionTag || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      Page {page} of {totalPages} ({totalClubs} clubs)
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                      >Prev</button>
                      <button
                        className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                      >Next</button>
                      <select value={pageSize} onChange={handlePageSizeChange} className="ml-2 p-1 bg-gray-700 rounded">
                        {PAGE_SIZE_OPTIONS.map(size => (
                          <option key={size} value={size}>{size} / page</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {clubs.length === 0 && selectedLeague && !clubsLoading && !clubsError && (
                <div className="text-center py-12 text-gray-400">
                  <p>No clubs found in this division</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubBrowser; 