import React, { useState } from 'react';

interface LeagueData {
  id: number;
  name: string;
  tier: string;
  region: string | null;
  division: string | null;
  season: string;
  clubsCount: number;
  type: string;
}

interface RegionGroup {
  name: string;
  type: string;
  children: LeagueData[];
}

interface CategoryGroup {
  name: string;
  type: string;
  children: (LeagueData | RegionGroup)[];
}

interface HierarchicalLeagueSelectorProps {
  hierarchicalLeagues: CategoryGroup[];
  selectedLeague: string | null;
  onLeagueSelect: (leagueId: string) => void;
  disabled?: boolean;
}

const HierarchicalLeagueSelector: React.FC<HierarchicalLeagueSelectorProps> = ({
  hierarchicalLeagues,
  selectedLeague,
  onLeagueSelect,
  disabled = false
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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

  const handleLeagueSelect = (leagueId: string) => {
    onLeagueSelect(leagueId);
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  const renderLeagueOption = (league: LeagueData, depth: number = 0) => {
    const isSelected = selectedLeague === league.id.toString();
    return (
      <div
        key={league.id}
        onClick={() => handleLeagueSelect(league.id.toString())}
        style={{
          padding: '8px 12px',
          paddingLeft: `${depth * 20 + 12}px`,
          cursor: 'pointer',
          borderRadius: '4px',
          margin: '2px 0',
          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
          color: isSelected ? '#1d4ed8' : '#374151',
          fontWeight: isSelected ? 500 : 400,
          transition: 'all 0.2s',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onMouseOver={(e) => {
          const target = e.currentTarget as HTMLElement;
          target.style.backgroundColor = isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.08)';
        }}
        onMouseOut={(e) => {
          const target = e.currentTarget as HTMLElement;
          if (!isSelected) {
            target.style.backgroundColor = 'transparent';
          } else {
            target.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
          }
        }}
      >
        <span>{league.name}</span>
        <span style={{ fontSize: '0.8em', color: '#6b7280' }}>{league.clubsCount} clubs</span>
      </div>
    );
  };

  const renderRegionGroup = (regionGroup: RegionGroup, depth: number = 0) => {
    const isRegionExpanded = isExpanded(regionGroup.name);
    const hasLeagues = regionGroup.children.length > 0;

    return (
      <div key={regionGroup.name} className="ml-2">
        <div
          className={`flex items-center py-1 px-2 cursor-pointer text-sm font-medium ${hasLeagues ? 'hover:bg-gray-50' : 'opacity-70'}`}
          onClick={() => hasLeagues && toggleCategory(regionGroup.name)}
        >
          {hasLeagues ? (
            <span className={`mr-2 transition-transform ${isRegionExpanded ? 'rotate-90' : ''}`}>
              ▶
            </span>
          ) : (
            <span className="w-4 mr-2"></span> // Empty space for alignment
          )}
          <span className={!hasLeagues ? 'opacity-50' : ''}>
            {regionGroup.name} {!hasLeagues && '(No leagues)'}
          </span>
        </div>
        {hasLeagues && isRegionExpanded && (
          <div className="ml-4 border-l-2 border-gray-100 pl-2">
            {regionGroup.children.map((league, index) => (
              <div key={index}>
                {renderLeagueOption(league, depth + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCategory = (category: CategoryGroup) => {
    const isCategoryExpanded = isExpanded(category.name);
    const hasLeagues = category.children.length > 0;

    return (
      <div key={category.name} className="mb-1">
        <div
          className={`flex items-center py-2 px-3 cursor-pointer font-semibold ${hasLeagues ? 'hover:bg-gray-50' : 'opacity-70'}`}
          onClick={() => hasLeagues && toggleCategory(category.name)}
        >
          {hasLeagues ? (
            <span className={`mr-2 transition-transform ${isCategoryExpanded ? 'rotate-90' : ''}`}>
              ▶
            </span>
          ) : (
            <span className="w-4 mr-2"></span> // Empty space for alignment
          )}
          <span className={!hasLeagues ? 'opacity-50' : ''}>
            {category.name} {!hasLeagues && '(No leagues available)'}
          </span>
        </div>
        {hasLeagues && isCategoryExpanded && (
          <div className="ml-4 mt-1">
            {category.children.map((child, index) => (
              <div key={index}>
                {child.type === "region"
                  ? renderRegionGroup(child as RegionGroup)
                  : renderLeagueOption(child as LeagueData, 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get the selected league name for display
  const getSelectedLeagueName = () => {
    if (!selectedLeague) return 'Select a league...';

    // Find the selected league in the hierarchy
    for (const category of hierarchicalLeagues) {
      for (const item of category.children) {
        // Check if it's a league or a region group
        if ('type' in item && item.type === 'region') {
          const regionGroup = item as RegionGroup;
          const foundLeague = regionGroup.children.find(league => league.id.toString() === selectedLeague);
          if (foundLeague) return foundLeague.name;
        } else if ('id' in item && item.id.toString() === selectedLeague) {
          return item.name;
        }
      }
    }

    return 'Select a league...';
  };

  // Filter leagues based on search term
  const filteredLeagues = hierarchicalLeagues.map(category => ({
    ...category,
    children: category.children.filter(item => {
      if ('type' in item && item.type === 'region') {
        const regionGroup = item as RegionGroup;
        return regionGroup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          regionGroup.children.some(league =>
            league.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
      }
      return (item as LeagueData).name.toLowerCase().includes(searchTerm.toLowerCase());
    })
  })).filter(category => category.children.length > 0);

  return (
    <div className="relative w-full">
      {/* Custom select button */}
      <div
        className="w-full px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 flex justify-between items-center cursor-pointer"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <span className={selectedLeague ? 'text-gray-900' : 'text-gray-400'}>
          {getSelectedLeagueName()}
        </span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search leagues..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* League list */}
          <div className="py-1">
            {filteredLeagues.length > 0 ? (
              filteredLeagues.map(category => renderCategory(category))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No leagues found</div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-10"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default HierarchicalLeagueSelector; 