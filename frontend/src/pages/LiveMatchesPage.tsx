import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Fixture } from '../types';
import MatchCard from '../components/MatchCard';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';

const LiveMatchesPage: React.FC = () => {
  const [liveMatches, setLiveMatches] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchLiveMatches = async () => {
      try {
        setLoading(true);
        // Fetch live fixtures from the API
        const response = await api.get<Fixture[]>('/fixtures/live');
        setLiveMatches(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching live matches:', err);
        setError('Failed to load live matches. Please try again later.');
        setLiveMatches([]); // Reset matches on error
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchLiveMatches();

    // Set up polling every 30 seconds to check for new live matches
    const intervalId = setInterval(fetchLiveMatches, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleMatchClick = (fixtureId: number) => {
    navigate(`/match/live/${fixtureId}`);
  };

  return (
    <div className="live-matches-page">
      <div className="page-header">
        <h1>{t('liveMatches.title')}</h1>
        <p className="subtitle">{t('liveMatches.subtitle')}</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('common.loading')}...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            {t('common.retry')}
          </button>
        </div>
      ) : liveMatches.length === 0 ? (
        <div className="no-matches">
          <div className="empty-state">
            <i className="icon-soccer-ball"></i>
            <h3>{t('liveMatches.noMatches')}</h3>
            <p>{t('liveMatches.noMatchesDescription')}</p>
          </div>
        </div>
      ) : (
        <div className="matches-list">
          {liveMatches.map((match) => (
            <div 
              key={match.id} 
              className="match-item"
              onClick={() => handleMatchClick(match.id)}
            >
              <MatchCard 
                fixture={match} 
                isLive={true}
                showDate={true}
                showCompetition={true}
              />
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .live-matches-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .page-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .page-header h1 {
          font-size: 2rem;
          color: #2c3e50;
          margin-bottom: 8px;
        }
        
        .subtitle {
          color: #7f8c8d;
          font-size: 1rem;
          margin: 0;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 0;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-message {
          text-align: center;
          padding: 40px 20px;
          background-color: #fdecea;
          border-radius: 8px;
          color: #d32f2f;
        }
        
        .retry-button {
          margin-top: 16px;
          padding: 8px 24px;
          background-color: #e74c3c;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background-color 0.2s;
        }
        
        .retry-button:hover {
          background-color: #c0392b;
        }
        
        .no-matches {
          text-align: center;
          padding: 40px 20px;
        }
        
        .empty-state {
          max-width: 400px;
          margin: 0 auto;
        }
        
        .empty-state i {
          font-size: 48px;
          color: #bdc3c7;
          margin-bottom: 16px;
          display: inline-block;
        }
        
        .empty-state h3 {
          color: #7f8c8d;
          margin-bottom: 8px;
        }
        
        .empty-state p {
          color: #95a5a6;
          margin: 0;
        }
        
        .matches-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .match-item {
          transition: transform 0.2s;
        }
        
        .match-item:hover {
          transform: translateY(-2px);
        }
        
        @media (max-width: 600px) {
          .live-matches-page {
            padding: 10px;
          }
          
          .page-header h1 {
            font-size: 1.5rem;
          }
          
          .subtitle {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LiveMatchesPage;
