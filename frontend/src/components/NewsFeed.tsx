import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useManagerProfile } from '../context/ManagerProfileContext';

interface NewsFeedProps {}

const NewsFeed: React.FC<NewsFeedProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useManagerProfile();
  const [currentStep, setCurrentStep] = useState<'results' | 'news' | 'messages'>('results');
  const [matchResult, setMatchResult] = useState<any>(null);

  useEffect(() => {
    if (location.state?.matchResult) {
      setMatchResult(location.state.matchResult);
    }
  }, [location.state]);

  const newsItems = [
    {
      title: "Transfer Rumors Heat Up",
      content: "Several top clubs are reportedly interested in signing young talents from the Eredivisie.",
      type: "transfer"
    },
    {
      title: "International Break Approaches",
      content: "National team managers are finalizing their squads for upcoming qualifiers.",
      type: "international"
    },
    {
      title: "Youth Academy Success",
      content: "Young players continue to impress in development leagues across the country.",
      type: "youth"
    },
    {
      title: "Stadium Expansion Plans",
      content: "Multiple clubs announce plans to expand their facilities in the coming season.",
      type: "stadium"
    }
  ];

  const messages = [
    {
      from: "KNVB",
      subject: "Match Report Submitted",
      content: "Your match report has been received and processed. No disciplinary action required.",
      type: "info"
    },
    {
      from: "National Team Coach",
      subject: "Player Call-up",
      content: "One of your players has been called up for international duty next month.",
      type: "callup"
    },
    {
      from: "U21 Coach",
      subject: "Youth Development",
      content: "Your club's youth development program is showing excellent results.",
      type: "youth"
    },
    {
      from: "Assistant Manager",
      subject: "Training Report",
      content: "The team's training session went well. Morale is high after the recent result.",
      type: "training"
    }
  ];

  const handleContinue = () => {
    if (currentStep === 'results') {
      setCurrentStep('news');
    } else if (currentStep === 'news') {
      setCurrentStep('messages');
    } else {
      // Navigate back to game menu
      navigate('/game-menu');
    }
  };

  const renderResults = () => (
    <div className="bg-gray-800 rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-green-400 mb-6 text-center">Match Results</h1>
      
      {matchResult && (
        <div className="text-center mb-8">
          <div className="text-4xl font-bold mb-4">
            {matchResult.homeTeam} {matchResult.homeScore} - {matchResult.awayScore} {matchResult.awayTeam}
          </div>
          <div className="text-lg text-gray-300 mb-6">
            {profile?.club === matchResult.homeTeam ? 
              (matchResult.homeScore > matchResult.awayScore ? 'Victory!' : 
               matchResult.homeScore < matchResult.awayScore ? 'Defeat' : 'Draw') :
              (matchResult.awayScore > matchResult.homeScore ? 'Victory!' : 
               matchResult.awayScore < matchResult.homeScore ? 'Defeat' : 'Draw')
            }
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Key Events</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {matchResult.events?.map((event: any, index: number) => (
                <div key={index} className="flex items-center p-2 bg-gray-600 rounded">
                  <span className="text-sm text-gray-400 w-12">{event.minute}'</span>
                  <span className="ml-2">{event.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderNews = () => (
    <div className="bg-gray-800 rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-green-400 mb-6 text-center">News Highlights</h1>
      
      <div className="space-y-6">
        {newsItems.map((item, index) => (
          <div key={index} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-300">{item.content}</p>
              </div>
              <div className="text-2xl">
                {item.type === 'transfer' && '💰'}
                {item.type === 'international' && '🏴'}
                {item.type === 'youth' && '👶'}
                {item.type === 'stadium' && '🏟️'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="bg-gray-800 rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-green-400 mb-6 text-center">Messages & Updates</h1>
      
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div key={index} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="font-semibold text-blue-400">{message.from}</div>
              <div className="text-sm text-gray-400">
                {message.type === 'info' && '📋'}
                {message.type === 'callup' && '🏴'}
                {message.type === 'youth' && '👶'}
                {message.type === 'training' && '🏋️'}
              </div>
            </div>
            <div className="text-sm text-gray-300 mb-2">{message.subject}</div>
            <p className="text-gray-400 text-sm">{message.content}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-green-400">News & Updates</h1>
              <p className="text-gray-300">Stay informed about the latest developments</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">
                {currentStep === 'results' && 'Step 1 of 3'}
                {currentStep === 'news' && 'Step 2 of 3'}
                {currentStep === 'messages' && 'Step 3 of 3'}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: currentStep === 'results' ? '33%' : currentStep === 'news' ? '66%' : '100%' }}
            ></div>
          </div>
        </div>

        {/* Content */}
        {currentStep === 'results' && renderResults()}
        {currentStep === 'news' && renderNews()}
        {currentStep === 'messages' && renderMessages()}

        {/* Navigation */}
        <div className="mt-6 text-center">
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-lg transition-colors"
          >
            {currentStep === 'messages' ? 'Continue to Game' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsFeed;
