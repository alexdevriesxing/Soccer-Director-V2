import React from 'react';

const MoodMeter: React.FC<{ mood: number }> = ({ mood }) => {
    let color = 'bg-green-500', emoji = '😃';
    if (mood < 70 && mood >= 40) { color = 'bg-yellow-400'; emoji = '😐'; }
    if (mood < 40) { color = 'bg-red-500'; emoji = '😡'; }
    return (
        <div className="flex items-center gap-2">
            <div className="w-24 h-4 rounded overflow-hidden bg-gray-200">
                <div className={`${color} h-4 rounded`} style={{ width: `${mood}%` }}></div>
            </div>
            <span className="text-xl">{emoji}</span>
            <span className="ml-2 text-xs">{mood}/100</span>
        </div>
    );
};

export default MoodMeter; 