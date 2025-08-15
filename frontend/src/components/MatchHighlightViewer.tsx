import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MatchHighlightScene, MatchEvent } from './MatchHighlightScene';

interface MatchHighlightViewerProps {
    homeTeam: string;
    awayTeam: string;
    events: MatchEvent[];
    onComplete?: () => void;
    visible: boolean;
}

const MatchHighlightViewer: React.FC<MatchHighlightViewerProps> = ({
    homeTeam,
    awayTeam,
    events,
    onComplete,
    visible
}) => {
    const gameRef = useRef<Phaser.Game | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!visible || !containerRef.current) return;

        // Create Phaser game configuration
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: containerRef.current,
            backgroundColor: '#2d5a27',
            scene: MatchHighlightScene,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                    debug: false
                }
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        };

        // Create the game instance
        gameRef.current = new Phaser.Game(config);

        // Start the highlight scene with data
        gameRef.current.scene.start('MatchHighlightScene', {
            homeTeam,
            awayTeam,
            events,
            onComplete
        });

        // Cleanup function
        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, [visible, homeTeam, awayTeam, events, onComplete]);

    if (!visible) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-4 max-w-4xl w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">
                        Match Highlights: {homeTeam} vs {awayTeam}
                    </h2>
                    <button
                        onClick={onComplete}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                        Close
                    </button>
                </div>
                <div 
                    ref={containerRef} 
                    className="w-full h-96 bg-green-800 rounded"
                />
            </div>
        </div>
    );
};

export default MatchHighlightViewer; 