import React from 'react';

interface PlayerDetailsPopoverProps {
    player: any;
}

const PlayerDetailsPopover: React.FC<PlayerDetailsPopoverProps> = ({ player }) => (
    <div className="p-2 bg-white dark:bg-gray-800 rounded shadow text-sm">
        <div><b>Age:</b> {player.age}</div>
        <div><b>Nationality:</b> {player.nationality}</div>
        <div><b>Potential:</b> {player.potential}</div>
        <div><b>Appearances:</b> {player.appearances}</div>
        <div><b>Goals:</b> {player.goals}</div>
        <div><b>Assists:</b> {player.assists}</div>
        <div><b>Morale:</b> {player.morale}</div>
    </div>
);

export default PlayerDetailsPopover; 