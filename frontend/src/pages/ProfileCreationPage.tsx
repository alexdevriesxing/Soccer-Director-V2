import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HierarchicalLeagueSelector from '../components/HierarchicalLeagueSelector';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol } from '@fortawesome/free-solid-svg-icons';

interface CategoryGroup {
  name: string;
  type: string;
  children: any[];
}

interface Club {
  id: number;
  name: string;
  homeCity: string | null;
  morale: number;
  form: string;
  regionTag: string | null;
  leagueId: number;
  reputation?: number;
  finances?: string;
  stadium?: string;
}

const ProfileCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const [managerName, setManagerName] = useState('');
  const [hierarchicalLeagues, setHierarchicalLeagues] = useState<CategoryGroup[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [clubDetails, setClubDetails] = useState<Club | null>(null);
  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Transform backend league data to the format expected by HierarchicalLeagueSelector
  const transformLeagueData = (data: any): CategoryGroup[] => {
    const categories: CategoryGroup[] = [];
    
    // Add Professional Leagues category
    const professionalLeagues: CategoryGroup = {
      name: 'Professional Leagues',
      type: 'category',
      children: []
    };
    
    // Add Amateur Leagues category
    const amateurLeagues: CategoryGroup = {
      name: 'Amateur Leagues',
      type: 'category',
      children: []
    };
    
    // Process each country
    Object.entries(data).forEach(([country, leaguesByLevel]) => {
      const countryData = leaguesByLevel as Record<string, Array<{id: number, name: string, season: string}>>;
      
      Object.entries(countryData).forEach(([level, leagues]) => {
        leagues.forEach(league => {
          const leagueData = {
            id: league.id.toString(),
            name: league.name,
            tier: level,
            region: country,
            division: null,
            season: league.season,
            clubsCount: 18, // Default value, can be updated if needed
            type: 'league'
          };
          
          // Add to appropriate category based on level
          if (level === 'EREDIVISIE' || level === 'KKD') {
            professionalLeagues.children.push(leagueData);
          } else {
            amateurLeagues.children.push(leagueData);
          }
        });
      });
    });
    
    // Only add categories that have leagues
    if (professionalLeagues.children.length > 0) categories.push(professionalLeagues);
    if (amateurLeagues.children.length > 0) categories.push(amateurLeagues);
    
    return categories;
  };

  // Fetch league structure
  useEffect(() => {
    setLoadingLeagues(true);
    fetch('/api/leagues/structure')
      .then(res => res.json())
      .then(data => {
        const transformedData = transformLeagueData(data);
        setHierarchicalLeagues(transformedData);
      })
      .catch(() => setError('Failed to load league structure.'))
      .finally(() => setLoadingLeagues(false));
  }, []);

  // Fetch clubs for selected league
  useEffect(() => {
    if (!selectedLeague) {
      setClubs([]);
      setSelectedClubId(null);
      setClubDetails(null);
      return;
    }
    setLoadingClubs(true);
    fetch(`/api/clubs?leagueId=${selectedLeague}`)
      .then(res => res.json())
      .then(data => {
        setClubs(data.clubs || []);
        setSelectedClubId(null);
        setClubDetails(null);
      })
      .catch(() => setError('Failed to load clubs.'))
      .finally(() => setLoadingClubs(false));
  }, [selectedLeague]);

  // Set club details when a club is selected
  useEffect(() => {
    if (!selectedClubId) {
      setClubDetails(null);
      return;
    }
    const club = clubs.find(c => c.id === selectedClubId) || null;
    setClubDetails(club);
  }, [selectedClubId, clubs]);

  const handleCreateProfile = async () => {
    if (!managerName || !selectedClubId) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/manager-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managerName,
          clubId: selectedClubId
        })
      });
      if (!res.ok) throw new Error('Failed to create profile');
      // On success, navigate to the club page
      navigate('/club');
    } catch (e) {
      setError('Failed to create profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const glassCard = {
    background: 'rgba(34, 40, 49, 0.85)',
    borderRadius: 24,
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1.5px solid rgba(255,255,255,0.12)',
    padding: 40,
    minWidth: 320,
    maxWidth: 540,
    margin: '0 auto',
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  };

  const pageTitle = {
    fontFamily: 'Bebas Neue, Orbitron, Arial Black, sans-serif',
    fontSize: '2.3rem',
    fontWeight: 900,
    background: 'linear-gradient(90deg, #4ade80 20%, #22d3ee 80%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: 2,
    marginBottom: 28,
    textAlign: 'center' as const,
    textShadow: '0 4px 24px #22d3ee',
    animation: 'titleGradientMove 4s ease-in-out infinite alternate',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  };

  const inputStyle = {
    width: '100%',
    padding: '0.9rem 1.2rem',
    background: 'rgba(30,41,59,0.92)',
    border: '2px solid #b5b5b5',
    borderRadius: 14,
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: 500,
    marginBottom: 8,
    outline: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
    transition: 'border 0.25s, box-shadow 0.25s',
  };

  const selectStyle = {
    ...inputStyle,
    background: 'rgba(30,41,59,0.92)',
    color: '#fff',
  };

  const glowBtn = {
    padding: '1.1rem 2.5rem',
    fontSize: '1.2rem',
    borderRadius: 16,
    fontWeight: 700,
    background: 'linear-gradient(90deg, #4ade80 60%, #22d3ee 100%)',
    color: '#fff',
    boxShadow: '0 0 18px 2px #4ade80, 0 2px 8px rgba(0,0,0,0.15)',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    marginTop: 8,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    justifyContent: 'center',
    transition: 'transform 0.15s, box-shadow 0.15s',
    animation: 'glowPulse 2.5s infinite alternate',
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', position: 'relative', overflow: 'hidden', fontFamily: 'monospace', background: 'radial-gradient(ellipse at 60% 40%, #4ade80 0%, #1e293b 60%, #111827 100%)' }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue:wght@400;700&family=Orbitron:wght@700&display=swap" rel="stylesheet" />
      {/* Keyframes for animation */}
      <style>{`
        @keyframes glowPulse {
          0% { box-shadow: 0 0 18px 2px #4ade80, 0 2px 8px rgba(0,0,0,0.15); }
          100% { box-shadow: 0 0 36px 8px #22d3ee, 0 2px 16px rgba(0,0,0,0.18); }
        }
        @keyframes titleGradientMove {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        <div style={glassCard}>
          <h1 style={pageTitle}><FontAwesomeIcon icon="user" style={{ fontSize: 32, color: '#4ade80', filter: 'drop-shadow(0 0 6px #22d3ee)' }} />Create Manager Profile</h1>
          {error && <div style={{ color: '#f87171', marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>{error}</div>}
          <div style={{ marginBottom: 22, width: '100%' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '1rem', color: '#a7f3d0' }}>Manager Name</label>
            <input
              type="text"
              value={managerName}
              onChange={e => setManagerName(e.target.value)}
              style={inputStyle}
              placeholder="Enter your name"
              disabled={submitting}
              onFocus={e => (e.target.style.border = '2px solid #4ade80')}
              onBlur={e => (e.target.style.border = '2px solid #b5b5b5')}
            />
          </div>
          <div style={{ marginBottom: 22, width: '100%' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '1rem', color: '#a7f3d0' }}>Select League</label>
            {loadingLeagues ? (
              <div style={{ color: '#cbd5e1' }}>Loading leagues...</div>
            ) : (
              <HierarchicalLeagueSelector
                hierarchicalLeagues={Array.isArray(hierarchicalLeagues) ? hierarchicalLeagues : []}
                selectedLeague={selectedLeague}
                onLeagueSelect={setSelectedLeague}
                disabled={submitting}
              />
            )}
          </div>
          {selectedLeague && (
            <div style={{ marginBottom: 22, width: '100%' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '1rem', color: '#a7f3d0' }}>Select Club</label>
              {loadingClubs ? (
                <div style={{ color: '#cbd5e1' }}>Loading clubs...</div>
              ) : (
                <select
                  value={selectedClubId || ''}
                  onChange={e => setSelectedClubId(Number(e.target.value))}
                  style={selectStyle}
                  disabled={submitting}
                  onFocus={e => (e.target.style.border = '2px solid #4ade80')}
                  onBlur={e => (e.target.style.border = '2px solid #b5b5b5')}
                >
                  <option value="">Select a club...</option>
                  {clubs.map(club => (
                    <option key={club.id} value={club.id}>{club.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}
          {clubDetails && (
            <div style={{ marginBottom: 22, background: 'rgba(30,41,59,0.92)', borderRadius: 14, padding: 16, width: '100%' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4ade80', marginBottom: 6 }}>{clubDetails.name}</h2>
              <div style={{ color: '#cbd5e1', marginBottom: 2 }}>{clubDetails.homeCity && <span>City: {clubDetails.homeCity} | </span>}Morale: {clubDetails.morale} | Form: {clubDetails.form}</div>
              {clubDetails.reputation && <div style={{ color: '#cbd5e1' }}>Reputation: {clubDetails.reputation}</div>}
              {clubDetails.finances && <div style={{ color: '#cbd5e1' }}>Finances: {clubDetails.finances}</div>}
              {clubDetails.stadium && <div style={{ color: '#cbd5e1' }}>Stadium: {clubDetails.stadium}</div>}
            </div>
          )}
          <button
            style={glowBtn}
            onClick={handleCreateProfile}
            disabled={submitting || !managerName || !selectedClubId}
            aria-label="Create Profile"
          >
            <FontAwesomeIcon icon={faFutbol} style={{ fontSize: 22 }} aria-hidden="true" />
            {submitting ? 'Creating Profile...' : 'Create Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCreationPage; 