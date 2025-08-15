import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProfile, getClubs, Club, GetClubsParams } from '../api/profileApi';
import IntroAnimation from './IntroAnimation';

const ProfileCreation: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [clubId, setClubId] = useState<number | ''>('');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<number | ''>('');
  const [clubsLoading, setClubsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get unique leagues for the filter dropdown
  const leagues = useMemo(() => {
    const leagueMap = new Map<number, { id: number; name: string; tier: number }>();
    clubs.forEach(club => {
      if (club.league && !leagueMap.has(club.league.id)) {
        leagueMap.set(club.league.id, club.league);
      }
    });
    return Array.from(leagueMap.values()).sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return a.name.localeCompare(b.name);
    });
  }, [clubs]);

  // Filter clubs based on search term and selected league
  useEffect(() => {
    let result = [...clubs];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(club => 
        club.name.toLowerCase().includes(term) || 
        club.league.name.toLowerCase().includes(term)
      );
    }
    
    if (selectedLeague) {
      result = result.filter(club => club.league.id === selectedLeague);
    }
    
    setFilteredClubs(result);
  }, [clubs, searchTerm, selectedLeague]);

  // Fetch clubs with optional filters
  const fetchClubs = async (params?: GetClubsParams) => {
    try {
      setClubsLoading(true);
      const data = await getClubs(params);
      setClubs(data);
      setError(null);
    } catch (err) {
      setError('Failed to load clubs. Please try again.');
      console.error('Error fetching clubs:', err);
    } finally {
      setClubsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchClubs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clubId) {
      setError('Please select a club');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const selectedClub = clubs.find(c => c.id === clubId);
      if (!selectedClub) {
        throw new Error('Selected club not found');
      }
      
      await createProfile({ 
        name, 
        club: selectedClub.name,
        clubId: selectedClub.id 
      });
      navigate('/club-menu');
    } catch (err) {
      setError('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono p-4">
      <div className="w-full max-w-2xl bg-gray-900 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Create New Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium mb-1">
                  Search Clubs
                </label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by club or league..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="w-full sm:w-64">
                <label htmlFor="league" className="block text-sm font-medium mb-1">
                  Filter by League
                </label>
                <select
                  id="league"
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Leagues</option>
                  {leagues.map((league) => (
                    <option key={league.id} value={league.id}>
                      {league.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium mb-1">
                Select Club
              </label>
              {clubsLoading ? (
                <div className="px-4 py-8 rounded bg-gray-800 text-gray-400 border border-gray-700 text-center">
                  Loading clubs...
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto border border-gray-700 rounded">
                  {filteredClubs.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      No clubs found. Try adjusting your search.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-700">
                      {filteredClubs.map((club) => (
                        <div 
                          key={club.id}
                          className={`p-3 hover:bg-gray-800 cursor-pointer ${clubId === club.id ? 'bg-blue-900/30' : ''}`}
                          onClick={() => setClubId(club.id)}
                        >
                          <div className="font-medium">{club.name}</div>
                          <div className="text-sm text-gray-400">
                            {club.league.name} (Tier {club.league.tier})
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || clubsLoading || !clubId || !name.trim()}
              className={`w-full py-2 px-4 rounded font-medium transition ${
                loading || clubsLoading || !clubId || !name.trim()
                  ? 'bg-blue-800 text-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Creating...' : 'Create Profile'}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded text-red-200 text-sm">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfileCreation;
