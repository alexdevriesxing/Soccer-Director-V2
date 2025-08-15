import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Fixture, Club } from '../types';
import { format } from 'date-fns';

interface MatchCardProps {
  fixture: Fixture;
  showDate?: boolean;
  showCompetition?: boolean;
  isLive?: boolean;
  className?: string;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  fixture, 
  showDate = true,
  showCompetition = true,
  isLive = false,
  className = ''
}) => {
  const navigate = useNavigate();
  const homeTeam = fixture.homeClub || { id: 0, name: 'Home Team' } as Club;
  const awayTeam = fixture.awayClub || { id: 0, name: 'Away Team' } as Club;
  // Handle both string and Date objects for fixture.date
  const matchDate = fixture.date 
    ? new Date(fixture.date) 
    : new Date();
    
  // Format date safely
  const formatDate = (date: Date) => {
    try {
      return format(date, 'EEE, MMM d, yyyy');
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Date not available';
    }
  };
  
  const handleMatchClick = () => {
    if (isLive) {
      navigate(`/match/live/${fixture.id}`);
    } else if (fixture.played) {
      // Navigate to match details
      navigate(`/match/${fixture.id}`);
    }
  };

  return (
    <div 
      className={`match-card ${isLive ? 'live' : ''} ${className}`}
      onClick={handleMatchClick}
    >
      {showDate && (
        <div className="match-date">
          {formatDate(matchDate)}
        </div>
      )}
      
      {showCompetition && (
        <div className="match-competition">
          {fixture.leagueId ? `League ${fixture.leagueId}` : 'Friendly'}
        </div>
      )}
      
      <div className="teams-container">
        <div className="team home-team">
          <div className="team-logo">
            <div className="team-logo-placeholder">
              {homeTeam.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="team-name">{homeTeam.name}</div>
          <div className="team-score">
            {fixture.played || isLive ? fixture.homeGoals : '-'}
          </div>
        </div>
        
        <div className="match-time">
          {isLive ? (
            <div className="live-badge">
              <span className="live-dot"></span>
              LIVE
            </div>
          ) : fixture.played ? (
            'FT'
          ) : (
            fixture.date ? format(new Date(fixture.date), 'HH:mm') : 'TBD'
          )}
        </div>
        
        <div className="team away-team">
          <div className="team-score">
            {fixture.played || isLive ? fixture.awayGoals : '-'}
          </div>
          <div className="team-name">{awayTeam.name}</div>
          <div className="team-logo">
            <div className="team-logo-placeholder">
              {awayTeam.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .match-card {
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 16px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          border-left: 3px solid transparent;
        }
        
        .match-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .match-card.live {
          border-left-color: #e74c3c;
          background-color: #fff9f9;
        }
        
        .match-date {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .match-competition {
          font-size: 0.8rem;
          color: #3498db;
          margin-bottom: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .teams-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .team {
          display: flex;
          align-items: center;
          flex: 1;
        }
        
        .home-team {
          justify-content: flex-start;
          text-align: left;
        }
        
        .away-team {
          justify-content: flex-end;
          text-align: right;
        }
        
        .team-logo {
          width: 28px;
          height: 28px;
          margin: 0 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .team-logo-placeholder {
          width: 28px;
          height: 28px;
          margin: 0 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ddd;
          border-radius: 50%;
          font-size: 1.2rem;
          font-weight: 600;
          color: #666;
        }
        
        .team-logo img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .team-name {
          flex: 1;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .home-team .team-name {
          margin-left: 10px;
        }
        
        .away-team .team-name {
          margin-right: 10px;
          text-align: right;
        }
        
        .team-score {
          font-weight: 700;
          font-size: 1.2rem;
          min-width: 24px;
          text-align: center;
        }
        
        .match-time {
          min-width: 70px;
          text-align: center;
          font-weight: 600;
          color: #666;
        }
        
        .live-badge {
          display: inline-flex;
          align-items: center;
          background-color: #e74c3c;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        
        .live-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
          margin-right: 4px;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        @media (max-width: 480px) {
          .team-name {
            font-size: 0.9rem;
          }
          
          .team-score {
            font-size: 1rem;
          }
          
          .match-time {
            min-width: 50px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MatchCard;
