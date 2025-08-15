import React, { useEffect, useState } from 'react';
import { MatchEvent } from './Match2DViewer';

interface MatchEventPopupProps {
  event: MatchEvent;
  onClose: () => void;
  onAnimationComplete: () => void;
}

const MatchEventPopup: React.FC<MatchEventPopupProps> = ({ event, onClose, onAnimationComplete }) => {
  const [visible, setVisible] = useState(false);
  const [animation, setAnimation] = useState('enter');

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setAnimation('exit');
      setTimeout(() => {
        setVisible(false);
        onAnimationComplete();
        onClose();
      }, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [event, onClose, onAnimationComplete]);

  if (!visible) return null;

  const getEventIcon = () => {
    switch (event.type) {
      case 'goal':
        return '⚽';
      case 'yellow':
        return '🟨';
      case 'red':
        return '🟥';
      case 'save':
        return '✋';
      case 'miss':
        return '❌';
      case 'foul':
        return '🤕';
      case 'substitution':
        return '🔄';
      default:
        return 'ℹ️';
    }
  };

  const getEventColor = () => {
    switch (event.type) {
      case 'goal':
        return 'bg-green-100 border-green-400';
      case 'yellow':
        return 'bg-yellow-100 border-yellow-400';
      case 'red':
        return 'bg-red-100 border-red-400';
      default:
        return 'bg-blue-100 border-blue-400';
    }
  };

  return (
    <div 
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg border-2 ${getEventColor()} transition-all duration-500 ${animation === 'enter' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <div className="flex items-center">
        <span className="text-2xl mr-2">{getEventIcon()}</span>
        <div>
          <div className="font-bold">{event.playerName || 'Player'}</div>
          <div className="text-sm">{event.description}</div>
          <div className="text-xs text-gray-600 mt-1">{event.minute}'</div>
        </div>
      </div>
    </div>
  );
};

export default MatchEventPopup;
