import React from 'react';

interface TimelineItem {
    round: number;
    offer: any;
    response: any;
}

const NegotiationTimeline: React.FC<{ timeline: TimelineItem[] }> = ({ timeline }) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'accepted':
                return <span className="inline mr-1 text-green-600">✓</span>;
            case 'leaked':
                return <span className="inline mr-1 text-yellow-600">📰</span>;
            case 'walkedAway':
                return <span className="inline mr-1 text-red-600">❌</span>;
            case 'ultimatum':
                return <span className="inline mr-1 text-orange-600">⚠️</span>;
            default:
                return <span className="inline mr-1 text-blue-500">↔️</span>;
        }
    };

    return (
        <ul className="text-xs max-h-40 overflow-y-auto border p-2 rounded bg-gray-50">
            {timeline.map((item, idx) => {
                let iconType = 'default';
                let color = '';
                if (item.response?.accepted) {
                    iconType = 'accepted';
                    color = 'text-green-700';
                } else if (item.response?.leaked) {
                    iconType = 'leaked';
                    color = 'text-yellow-700';
                } else if (item.response?.walkedAway) {
                    iconType = 'walkedAway';
                    color = 'text-red-700';
                } else if (item.response?.message?.includes('ultimatum')) {
                    iconType = 'ultimatum';
                    color = 'text-orange-700';
                }
                return (
                    <li key={idx} className={`mb-1 ${color}`}>
                        {getIcon(iconType)}
                        <b>Round {item.round}:</b> Offer: €{item.offer.salary}/w, Bonus: €{item.offer.signingBonus}, Years: {item.offer.years}, Agent Fee: €{item.offer.agentFee} — <span className="italic">{item.response?.message}</span>
                    </li>
                );
            })}
        </ul>
    );
};

export default NegotiationTimeline; 