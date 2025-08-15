import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeagueTable, getHierarchicalLeagues } from '../api/footballApi';
import LeagueStatusIndicator from '../components/LeagueStatusIndicator';

interface LeagueTableProps {
  leagueId?: string;
}

interface TableEntry {
  position: number;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  status?: string;
}

// Update League type locally to allow id: string | number
type League = {
  id: string | number;
  name: string;
  tier: string;
  region: string | null;
  division: string | null;
  season: string;
  clubsCount: number;
  type: 'league';
};

interface RegionGroup {
  name: string;
  type: string;
  children: League[];
}

interface CategoryGroup {
  name: string;
  type: string;
  children: (League | RegionGroup)[];
}

function isLeague(obj: any): obj is League {
  return obj && typeof obj === 'object' && 'id' in obj && 'name' in obj && typeof obj.id !== 'undefined' && typeof obj.name === 'string';
}

function DropdownMenu({
  leagues,
  selectedLeague,
  setSelectedLeague,
  expandedCategories,
  setExpandedCategories,
}: {
  leagues: CategoryGroup[];
  selectedLeague: string | null;
  setSelectedLeague: (id: string) => void;
  expandedCategories: Set<string>;
  setExpandedCategories: (s: Set<string>) => void;
}) {
  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };
  const isExpanded = (categoryName: string) => expandedCategories.has(categoryName);
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 w-96 max-h-96 overflow-y-auto">
      {leagues.map(category => {
        // Main item (Eredivisie, Eerste Divisie, Tweede Divisie, Derde Divisie, Vierde Divisie, Region)
        const hasSub = category.children.length > 1 || (category.children.length === 1 && category.children[0].type !== 'league');
        const isCatExpanded = isExpanded(category.name);
        // If only one child and it's a league, treat as direct league
        if (!hasSub && category.children.length === 1 && isLeague(category.children[0])) {
          const league = category.children[0];
          return (
            <div
              key={league.id}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${selectedLeague === league.id.toString() ? 'bg-blue-200 font-bold' : ''}`}
              onClick={() => setSelectedLeague(league.id.toString())}
            >
              {category.name}
            </div>
          );
        }
        // If children are subregions (Zaterdag/Zondag)
        if (category.type === 'region') {
          return (
            <div key={category.name}>
              <div
                className={`px-4 py-2 cursor-pointer flex items-center hover:bg-blue-100 ${isCatExpanded ? 'font-bold' : ''}`}
                onClick={() => toggleCategory(category.name)}
              >
                <span className={`mr-2 transition-transform ${isCatExpanded ? 'rotate-90' : ''}`}>▶</span>
                {category.name}
              </div>
              {isCatExpanded && (
                <div className="ml-6 border-l border-gray-200">
                  {category.children.filter((subregion): subregion is RegionGroup => !!subregion && 'children' in subregion && Array.isArray((subregion as RegionGroup).children)).map(subregion => {
                    const isSubExpanded = isExpanded(`${category.name}-${subregion.name}`);
                    return (
                      <div key={subregion.name}>
                        <div
                          className={`px-4 py-2 cursor-pointer flex items-center hover:bg-blue-50 ${isSubExpanded ? 'font-bold' : ''}`}
                          onClick={() => toggleCategory(`${category.name}-${subregion.name}`)}
                        >
                          <span className={`mr-2 transition-transform ${isSubExpanded ? 'rotate-90' : ''}`}>▶</span>
                          {subregion.name}
                        </div>
                        {isSubExpanded && (
                          <div className="ml-6 border-l border-gray-100">
                            {subregion.children.filter(isLeague).map((league: League) => (
                              <div
                                key={league.id}
                                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${selectedLeague === league.id.toString() ? 'bg-blue-200 font-bold' : ''}`}
                                onClick={() => setSelectedLeague(league.id.toString())}
                              >
                                {league.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }
        // Has sub-leagues (expandable)
        return (
          <div key={category.name}>
            <div
              className={`px-4 py-2 cursor-pointer flex items-center hover:bg-blue-100 ${isCatExpanded ? 'font-bold' : ''}`}
              onClick={() => toggleCategory(category.name)}
            >
              <span className={`mr-2 transition-transform ${isCatExpanded ? 'rotate-90' : ''}`}>▶</span>
              {category.name}
            </div>
            {isCatExpanded && (
              <div className="ml-6 border-l border-gray-200">
                {category.children.filter(child => !!child).filter(isLeague).map(league => (
                  <div
                    key={league.id}
                    className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${selectedLeague === league.id.toString() ? 'bg-blue-200 font-bold' : ''}`}
                    onClick={() => setSelectedLeague(league.id.toString())}
                  >
                    {league.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const LeagueTablePage: React.FC<LeagueTableProps> = ({ leagueId }) => {
  const [tableData, setTableData] = useState<TableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(leagueId || null);
  const [leagueName, setLeagueName] = useState<string>('');
  const [hierarchicalLeagues, setHierarchicalLeagues] = useState<CategoryGroup[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  // 1. On mount, fetch all leagues and build a name->ID map
  const [leagueNameToId, setLeagueNameToId] = useState<Record<string, number>>({});
  useEffect(() => {
    async function fetchLeagues() {
      try {
        const res = await fetch('/api/leagues/all');
        if (!res.ok) {
          console.error('Failed to fetch /api/leagues/all:', res.status, res.statusText);
          setError('Failed to load leagues');
          setLeagueNameToId({});
          return;
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          console.error('Expected JSON but got:', text);
          setError('Failed to load leagues (invalid response format)');
          setLeagueNameToId({});
          return;
        }
        const data = await res.json();
        console.log('Fetched leagues:', data);
        // Build a map: 'region|name' => id (region may be null)
        const map: Record<string, number> = {};
        data.forEach((l: any) => {
          const key = l.region ? `${l.region}|${l.name}` : l.name;
          map[key] = l.id;
        });
        setLeagueNameToId(map);
        console.log('Constructed leagueNameToId map:', map);
      } catch (e) {
        console.error('Error fetching /api/leagues/all:', e);
        setError('Failed to load leagues');
        setLeagueNameToId({});
      }
    }
    fetchLeagues();
  }, []);

  // 2. When a league is selected, look up the real ID
  const getLeagueId = (league: League) => {
    // Try region|name first, then just name
    let key = league.region ? `${league.region}|${league.name}` : league.name;
    console.log('Looking up league key:', key, 'Available keys:', Object.keys(leagueNameToId));
    if (leagueNameToId[key]) return leagueNameToId[key];
    if (leagueNameToId[league.name]) return leagueNameToId[league.name];
    return null;
  };

  // 3. When rendering the table, only call API if real ID exists
  const [tableError, setTableError] = useState<string | null>(null);
  const [leagueTable, setLeagueTable] = useState<any>(null);
  useEffect(() => {
    if (!selectedLeague) return;
    const selectedLeagueObj = hierarchicalLeagues.find(cat => 
      cat.children.some(child => isLeague(child) && child.id.toString() === selectedLeague)
    )?.children.find(child => isLeague(child) && child.id.toString() === selectedLeague);

    if (!selectedLeagueObj || !isLeague(selectedLeagueObj)) {
      setTableError('No data yet for this league');
      setLeagueTable(null);
      return;
    }
    const realId = getLeagueId(selectedLeagueObj);
    if (!realId) {
      setTableError('No data yet for this league');
      setLeagueTable(null);
      return;
    }
    setTableError(null);
    // fetch league table as before
    (async () => {
      // Defensive check and logging for leagueId
      console.log('Fetching league table for leagueId:', realId);
      if (realId && !isNaN(Number(realId))) {
        try {
          // Log the full request URL for debugging
          console.log('About to fetch league table:', `/api/league/${realId}/table`);
          const res = await fetch(`/api/league/${realId}/table`);
          if (!res.ok) throw new Error('Failed to load league table');
          const data = await res.json();
          setLeagueTable(data);
        } catch (err) {
          setTableError('Failed to load league table');
          setLeagueTable(null);
        }
      } else {
        setTableError('Invalid league ID');
        setLeagueTable(null);
      }
    })();
  }, [selectedLeague, leagueNameToId, hierarchicalLeagues]);

  const makeLeague = (name: string): League => ({
    id: name, // use name as id for uniqueness in the hardcoded structure
    name,
    tier: '',
    region: null,
    division: null,
    season: '',
    clubsCount: 0,
    type: 'league',
  });

  // 1. Add a hardcoded Dutch league structure for the dropdown
  const DUTCH_LEAGUE_STRUCTURE: CategoryGroup[] = [
    { name: 'Eredivisie', type: 'category', children: [makeLeague('Eredivisie')] },
    { name: 'Eerste Divisie', type: 'category', children: [makeLeague('Eerste Divisie')] },
    { name: 'Tweede Divisie', type: 'category', children: [makeLeague('Tweede Divisie')] },
    { name: 'O21 Leagues', type: 'category', children: [
      makeLeague('Divisie 1'),
      makeLeague('Divisie 2'),
      makeLeague('Divisie 3'),
      makeLeague('Divisie 4A'),
      makeLeague('Divisie 4B'),
    ] },
    { name: 'Derde Divisie', type: 'category', children: [
      makeLeague('Derde Divisie A'),
      makeLeague('Derde Divisie B'),
    ] },
    { name: 'Vierde Divisie', type: 'category', children: [
      makeLeague('Vierde Divisie A'),
      makeLeague('Vierde Divisie B'),
      makeLeague('Vierde Divisie C'),
      makeLeague('Vierde Divisie D'),
    ] },
    // Noord
    { name: 'Noord', type: 'region', children: [
      makeLeague('Eerste Klasse H'),
      {
        name: 'Zaterdag',
        type: 'subregion',
        children: [
          makeLeague('Tweede Klasse I'), makeLeague('Tweede Klasse J'), makeLeague('Tweede Klasse K'), makeLeague('Tweede Klasse L'), makeLeague('Tweede Klasse M'), makeLeague('Tweede Klasse N'), makeLeague('Tweede Klasse O'), makeLeague('Tweede Klasse P'),
          makeLeague('Derde Klasse Q'), makeLeague('Derde Klasse R'),
          makeLeague('Vierde Klasse A'), makeLeague('Vierde Klasse B'), makeLeague('Vierde Klasse C'), makeLeague('Vierde Klasse D'), makeLeague('Vierde Klasse E'), makeLeague('Vierde Klasse F'),
          makeLeague('Vijfde Klasse A'), makeLeague('Vijfde Klasse B'), makeLeague('Vijfde Klasse C'), makeLeague('Vijfde Klasse D'), makeLeague('Vijfde Klasse E'), makeLeague('Vijfde Klasse F'), makeLeague('Vijfde Klasse G'),
        ],
      },
      {
        name: 'Zondag',
        type: 'subregion',
        children: [
          makeLeague('Tweede Klasse G'), makeLeague('Tweede Klasse H'),
          makeLeague('Derde Klasse N'), makeLeague('Derde Klasse O'), makeLeague('Derde Klasse P'),
          makeLeague('Vierde Klasse A'), makeLeague('Vierde Klasse B'), makeLeague('Vierde Klasse C'),
          makeLeague('Vijfde Klasse A'), makeLeague('Vijfde Klasse B'), makeLeague('Vijfde Klasse C'), makeLeague('Vijfde Klasse D'),
        ],
      },
    ] },
    // Oost
    { name: 'Oost', type: 'region', children: [
      makeLeague('Eerste Klasse F'), makeLeague('Eerste Klasse G'),
      { name: 'Zaterdag Oost', type: 'subregion', children: [
        makeLeague('Tweede Klasse G'), makeLeague('Tweede Klasse H'),
        makeLeague('Derde Klasse L'), makeLeague('Derde Klasse M'), makeLeague('Derde Klasse N'), makeLeague('Derde Klasse O'),
        makeLeague('Vierde Klasse A'), makeLeague('Vierde Klasse B'), makeLeague('Vierde Klasse C'), makeLeague('Vierde Klasse D'), makeLeague('Vierde Klasse E'),
        makeLeague('Vijfde Klasse A'), makeLeague('Vijfde Klasse B'), makeLeague('Vijfde Klasse C'), makeLeague('Vijfde Klasse D'), makeLeague('Vijfde Klasse E'),
      ] },
      { name: 'Zondag Oost', type: 'subregion', children: [
        makeLeague('Tweede Klasse F'),
        makeLeague('Derde Klasse K'), makeLeague('Derde Klasse L'), makeLeague('Derde Klasse M'),
        makeLeague('Vierde Klasse A'), makeLeague('Vierde Klasse B'), makeLeague('Vierde Klasse C'), makeLeague('Vierde Klasse D'), makeLeague('Vierde Klasse E'),
        makeLeague('Vijfde Klasse A'), makeLeague('Vijfde Klasse B'), makeLeague('Vijfde Klasse C'), makeLeague('Vijfde Klasse D'), makeLeague('Vijfde Klasse E'), makeLeague('Vijfde Klasse F'), makeLeague('Vijfde Klasse G'),
      ] },
    ] },
    // West 1
    { name: 'West 1', type: 'region', children: [
      makeLeague('Eerste Klasse A'),
      {
        name: 'Zaterdag',
        type: 'subregion',
        children: [
          makeLeague('Tweede Klasse A'),
          makeLeague('Tweede Klasse B'),
          makeLeague('Derde Klasse A'),
          makeLeague('Derde Klasse B'),
          makeLeague('Derde Klasse C'),
          makeLeague('Derde Klasse D'),
          makeLeague('Vierde Klasse A'),
          makeLeague('Vierde Klasse B'),
          makeLeague('Vierde Klasse C'),
          makeLeague('Vierde Klasse D'),
          makeLeague('Vierde Klasse E'),
          makeLeague('Vijfde Klasse A'),
          makeLeague('Vijfde Klasse B'),
          makeLeague('Vijfde Klasse C'),
          makeLeague('Vijfde Klasse D'),
          makeLeague('Vijfde Klasse E'),
        ],
      },
      {
        name: 'Zondag',
        type: 'subregion',
        children: [
          makeLeague('Tweede Klasse A'),
          makeLeague('Tweede Klasse B'),
          makeLeague('Derde Klasse A'),
          makeLeague('Derde Klasse B'),
          makeLeague('Vierde Klasse A'),
          makeLeague('Vierde Klasse B'),
          makeLeague('Vierde Klasse C'),
          makeLeague('Vijfde Klasse A'),
          makeLeague('Vijfde Klasse B'),
          makeLeague('Vijfde Klasse C'),
        ],
      },
    ]},
    // West 2
    { name: 'West 2', type: 'region', children: [
      makeLeague('Eerste Klasse B'), makeLeague('Eerste Klasse C'),
      { name: 'West 2 Zaterdag', type: 'subregion', children: [
        makeLeague('Tweede Klasse C'), makeLeague('Tweede Klasse D'),
        makeLeague('Derde Klasse F'), makeLeague('Derde Klasse G'),
        makeLeague('Vierde Klasse A'), makeLeague('Vierde Klasse B'), makeLeague('Vierde Klasse C'), makeLeague('Vierde Klasse D'), makeLeague('Vierde Klasse E'),
        makeLeague('Vijfde Klasse A'), makeLeague('Vijfde Klasse B'), makeLeague('Vijfde Klasse C'), makeLeague('Vijfde Klasse D'), makeLeague('Vijfde Klasse E'),
      ] },
      // No Zondag for West 2
    ] },
    // Zuid 1
    { name: 'Zuid 1', type: 'region', children: [
      makeLeague('Eerste Klasse D'),
      { name: 'Zuid 1 Zaterdag', type: 'subregion', children: [
        makeLeague('Tweede Klasse E'), makeLeague('Tweede Klasse F'),
        makeLeague('Derde Klasse H'), makeLeague('Derde Klasse I'), makeLeague('Derde Klasse J'), makeLeague('Derde Klasse K'),
        makeLeague('Vierde Klasse A'), makeLeague('Vierde Klasse B'), makeLeague('Vierde Klasse C'), makeLeague('Vierde Klasse D'), makeLeague('Vierde Klasse E'),
        makeLeague('Vijfde Klasse A'), makeLeague('Vijfde Klasse B'), makeLeague('Vijfde Klasse C'), makeLeague('Vijfde Klasse D'),
      ] },
      { name: 'Zuid 1 Zondag', type: 'subregion', children: [
        makeLeague('Tweede Klasse C'),
        makeLeague('Derde Klasse C'), makeLeague('Derde Klasse D'), makeLeague('Derde Klasse E'), makeLeague('Derde Klasse F'),
        makeLeague('Vierde Klasse A'), makeLeague('Vierde Klasse B'), makeLeague('Vierde Klasse C'), makeLeague('Vierde Klasse D'),
        makeLeague('Vijfde Klasse A'), makeLeague('Vijfde Klasse B'), makeLeague('Vijfde Klasse C'), makeLeague('Vijfde Klasse D'), makeLeague('Vijfde Klasse E'), makeLeague('Vijfde Klasse F'),
      ] },
    ] },
    // Zuid 2
    { name: 'Zuid 2', type: 'region', children: [
      makeLeague('Eerste Klasse E'),
      { name: 'Zuid 2 Zondag', type: 'subregion', children: [
        makeLeague('Tweede Klasse D'), makeLeague('Tweede Klasse E'),
        makeLeague('Derde Klasse G'), makeLeague('Derde Klasse H'), makeLeague('Derde Klasse I'), makeLeague('Derde Klasse J'),
        makeLeague('Vierde Klasse A'), makeLeague('Vierde Klasse B'), makeLeague('Vierde Klasse C'), makeLeague('Vierde Klasse D'), makeLeague('Vierde Klasse E'), makeLeague('Vierde Klasse F'), makeLeague('Vierde Klasse G'), makeLeague('Vierde Klasse H'), makeLeague('Vierde Klasse I'),
        makeLeague('Vijfde Klasse A'), makeLeague('Vijfde Klasse B'), makeLeague('Vijfde Klasse C'), makeLeague('Vijfde Klasse D'), makeLeague('Vijfde Klasse E'), makeLeague('Vijfde Klasse F'), makeLeague('Vijfde Klasse G'),
      ] },
      // No Zaterdag for Zuid 2
    ] },
  ];

  // 2. In useEffect, use DUTCH_LEAGUE_STRUCTURE for dropdown, but fetch backend data for club lists only
  useEffect(() => {
    // Fetch hierarchical leagues on mount
    const fetchHierarchicalLeagues = async () => {
      try {
        // Use the hardcoded structure for the dropdown
        setHierarchicalLeagues(DUTCH_LEAGUE_STRUCTURE);
        // Set first available league as default
        if (!selectedLeague && DUTCH_LEAGUE_STRUCTURE.length > 0) {
          let found = false;
          for (const category of DUTCH_LEAGUE_STRUCTURE) {
            if (category.children && category.children.length > 0) {
              // If direct league
              if (isLeague(category.children[0])) {
                setSelectedLeague(category.children[0].id.toString());
                found = true;
                break;
              } else if (category.type === 'region') {
                // For region, look for first league in Zaterdag or Zondag
                const subregions = category.children;
                for (const sub of subregions) {
                  if (sub && 'children' in sub && Array.isArray((sub as RegionGroup).children) && (sub as RegionGroup).children.length > 0 && isLeague((sub as RegionGroup).children[0])) {
                    setSelectedLeague((sub as RegionGroup).children[0].id.toString());
                    found = true;
                    break;
                  }
                }
                if (found) break;
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching hierarchical leagues:', err);
        setError('Failed to load leagues');
      }
    };
    fetchHierarchicalLeagues();
  }, [selectedLeague]);

  const loadLeagueTable = React.useCallback(async (leagueId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const dataPromise = getLeagueTable(leagueId);
      const data = await Promise.race([dataPromise, timeoutPromise]);
      
      setTableData(data.table || []);
      setLeagueName(data.league || '');
    } catch (err) {
      console.error('Error loading league table:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage === 'Request timeout' ? 'Request timed out' : 'Failed to load league table');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      const selectedLeagueObj = hierarchicalLeagues.find(cat => 
        cat.children.some(child => isLeague(child) && child.id.toString() === selectedLeague)
      )?.children.find(child => isLeague(child) && child.id.toString() === selectedLeague);
      if (selectedLeagueObj) {
        loadLeagueTable(selectedLeague);
      }
    }
  }, [selectedLeague, loadLeagueTable, hierarchicalLeagues]);

  const getPositionColor = React.useCallback((position: number) => {
    if (position <= 4) return 'bg-blue-100 border-blue-300';
    if (position >= tableData.length - 3) return 'bg-red-100 border-red-300';
    return 'bg-white border-gray-200';
  }, [tableData.length]);

  const getPositionBadge = React.useCallback((position: number) => {
    if (position <= 4) return 'bg-blue-500 text-white';
    if (position >= tableData.length - 3) return 'bg-red-500 text-white';
    return 'bg-gray-500 text-white';
  }, [tableData.length]);

  const getLeagueType = (leagueName: string): 'eredivisie' | 'eerste_divisie' | 'lower_league' | 'regional' => {
    if (leagueName === 'Eredivisie') return 'eredivisie';
    if (leagueName === 'Eerste Divisie') return 'eerste_divisie';
    if (leagueName.includes('Zaterdag') || leagueName.includes('Zondag')) return 'regional';
    return 'lower_league';
  };

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const isExpanded = (categoryName: string) => expandedCategories.has(categoryName);

  const renderLeagueOption = (league: League) => (
    <option key={league.id} value={league.id}>
      {league.name} ({league.clubsCount} clubs)
    </option>
  );

  // Dropdown rendering: always render both direct league children and subregions
  function renderDropdownItems(items: (CategoryGroup | RegionGroup | League)[], depth = 0) {
    return items.map((item) => {
      if (isLeague(item)) {
        return (
          <div
            key={String(item.id)}
            className={`pl-${depth * 4} px-4 py-2 cursor-pointer hover:bg-blue-50 ${selectedLeague === String(item.id) ? 'font-bold bg-blue-100' : ''}`}
            onClick={() => setSelectedLeague(String(item.id))}
          >
            {item.name}
          </div>
        );
      } else if (item && typeof item === 'object' && 'children' in item && Array.isArray(item.children)) {
        // CategoryGroup or RegionGroup or subregion
        return (
          <div key={item.name}>
            <div
              className={`pl-${depth * 4} px-4 py-2 cursor-pointer flex items-center hover:bg-blue-50`}
              onClick={() => toggleCategory(item.name)}
            >
              <span className={`mr-2 transition-transform ${expandedCategories.has(item.name) ? 'rotate-90' : ''}`}>▶</span>
              {item.name}
            </div>
            {expandedCategories.has(item.name) && (
              <div className="ml-4 border-l border-gray-200">
                {renderDropdownItems(item.children as (CategoryGroup | RegionGroup | League)[], depth + 1)}
              </div>
            )}
          </div>
        );
      } else {
        return null;
      }
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header with Back Button */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 text-gray-700 hover:text-blue-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">League Table</h1>
              <p className="text-gray-600 mt-1">Current standings and statistics</p>
            </div>
          </div>
          
          {/* League Dropdown */}
          <div className="flex items-center space-x-4">
            <div className="dropdown-menu bg-white border rounded shadow-md max-h-96 overflow-y-auto">
              {error ? (
                <div className="px-4 py-2 text-gray-500">
                  <p>Failed to load leagues. Please try again later.</p>
                  <p className="text-sm text-gray-400 mt-1">Error: {error}</p>
                </div>
              ) : DUTCH_LEAGUE_STRUCTURE.length > 0
                ? renderDropdownItems(DUTCH_LEAGUE_STRUCTURE)
                : <div className="px-4 py-2 text-gray-500">No leagues found</div>
              }
            </div>
          </div>
        </div>

        {/* Legend */}
        {!loading && !error && tableData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg">⭐</span>
                <span className="text-sm text-gray-600">Champion</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">🏆</span>
                <span className="text-sm text-gray-600">Cup Winner</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">🥇</span>
                <span className="text-sm text-gray-600">Champions League</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">🥈</span>
                <span className="text-sm text-gray-600">Europa League</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">🥉</span>
                <span className="text-sm text-gray-600">Conference League</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">⚫</span>
                <span className="text-sm text-gray-600">Playoff</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg">🔴</span>
                <span className="text-sm text-gray-600">Relegated</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading league table...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 font-medium">{error}</div>
            <button
              onClick={() => selectedLeague && loadLeagueTable(selectedLeague)}
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* League Table */}
        {!loading && !error && tableData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
              <h2 className="text-xl font-semibold">{leagueName} - League Standings</h2>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pos</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">P</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">D</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GF</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GA</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GD</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pts</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((entry) => (
                    <tr
                      key={entry.name}
                      className={`hover:bg-gray-50 transition-colors duration-150 ${getPositionColor(entry.position)} border-l-4`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${getPositionBadge(entry.position)}`}>
                          {entry.position}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                              {entry.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4 flex items-center space-x-2">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{entry.name}</div>
                            </div>
                            {entry.status && (
                              <LeagueStatusIndicator 
                                status={entry.status} 
                                leagueType={getLeagueType(leagueName)}
                                className="ml-2"
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 font-medium">
                        {entry.played}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {entry.won}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {entry.drawn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {entry.lost}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 font-medium">
                        {entry.goalsFor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {entry.goalsAgainst}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 font-medium">
                        {entry.goalDifference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 font-bold">
                        {entry.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tableData.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500">This league table is currently empty. Please select a different league or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeagueTablePage; 