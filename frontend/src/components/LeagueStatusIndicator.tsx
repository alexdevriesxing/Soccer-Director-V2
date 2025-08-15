import React from 'react';

interface LeagueStatusIndicatorProps {
  status: string;
  leagueType?: 'eredivisie' | 'eerste_divisie' | 'lower_league' | 'regional';
  className?: string;
}

const LeagueStatusIndicator: React.FC<LeagueStatusIndicatorProps> = ({ 
  status, 
  leagueType = 'lower_league',
  className = '' 
}) => {
  const getIndicator = () => {
    switch (status) {
      // Eredivisie specific
      case 'champion':
        return {
          icon: '⭐',
          color: 'text-yellow-500',
          tooltip: 'League Champion'
        };
      case 'cl_qual':
        return {
          icon: '🥇',
          color: 'text-yellow-600',
          tooltip: 'Champions League Qualification'
        };
      case 'el_qual':
        return {
          icon: '🥈',
          color: 'text-gray-400',
          tooltip: 'Europa League Qualification'
        };
      case 'ecl_qual':
        return {
          icon: '🥉',
          color: 'text-amber-600',
          tooltip: 'Europa Conference League Qualification'
        };
      case 'ecl_playoff':
        return {
          icon: '🥉',
          color: 'text-amber-500',
          tooltip: 'Europa Conference League Playoff'
        };
      case 'cup_winner':
        return {
          icon: '🏆',
          color: 'text-yellow-500',
          tooltip: 'KNVB Beker Winner'
        };
      case 'cup_runner_up':
        return {
          icon: '🏆',
          color: 'text-gray-400',
          tooltip: 'KNVB Beker Runner-up'
        };
      case 'promotion_playoff':
        return {
          icon: '⚫',
          color: 'text-black',
          tooltip: 'Promotion/Relegation Playoff'
        };
      case 'relegated':
        return {
          icon: '🔴',
          color: 'text-red-500',
          tooltip: 'Directly Relegated'
        };

      // Lower leagues
      case 'promoted':
        return {
          icon: '⭐',
          color: 'text-yellow-500',
          tooltip: 'Promoted'
        };
      case 'promotion_playoff_lower':
        return {
          icon: '🥈',
          color: 'text-gray-400',
          tooltip: 'Promotion Playoff'
        };
      case 'relegation_playoff':
        return {
          icon: '⚫',
          color: 'text-black',
          tooltip: 'Relegation Playoff'
        };

      // Regional cups
      case 'regional_cup_winner':
        return {
          icon: '🏆',
          color: 'text-yellow-500',
          tooltip: 'Regional Cup Winner'
        };

      default:
        return null;
    }
  };

  const indicator = getIndicator();
  if (!indicator) return null;

  return (
    <div className={`relative group ${className}`}>
      <span 
        className={`text-lg ${indicator.color} cursor-help`}
        title={indicator.tooltip}
      >
        {indicator.icon}
      </span>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {indicator.tooltip}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

export default LeagueStatusIndicator; 