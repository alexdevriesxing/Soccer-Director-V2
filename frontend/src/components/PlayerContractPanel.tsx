import React from 'react';

interface ContractHistoryEntry {
  type: string;
  offer?: any;
  date: string;
  status?: string;
}

interface PlayerContractPanelProps {
  player: {
    id: number;
    name: string;
    wage?: number;
    contractStart?: string;
    contractExpiry?: string;
    goalBonus?: number;
    appearanceBonus?: number;
    promotionBonus?: number;
    releaseClause?: number;
    buyoutClause?: number;
    optionalExtension?: boolean;
    agentName?: string;
    agentFee?: number;
    contractHistory?: ContractHistoryEntry[];
  };
  onOpenNegotiation: () => void;
}

const PlayerContractPanel: React.FC<PlayerContractPanelProps> = ({ player, onOpenNegotiation }) => {
  return (
    <div className="contract-panel">
      <h2>Contract Details</h2>
      <table>
        <tbody>
          <tr><td>Name</td><td>{player.name}</td></tr>
          <tr><td>Wage</td><td>€{player.wage?.toLocaleString() ?? '-'}</td></tr>
          <tr><td>Start</td><td>{player.contractStart ? new Date(player.contractStart).toLocaleDateString() : '-'}</td></tr>
          <tr><td>Expiry</td><td>{player.contractExpiry ? new Date(player.contractExpiry).toLocaleDateString() : '-'}</td></tr>
          <tr><td>Goal Bonus</td><td>€{player.goalBonus?.toLocaleString() ?? '-'}</td></tr>
          <tr><td>Appearance Bonus</td><td>€{player.appearanceBonus?.toLocaleString() ?? '-'}</td></tr>
          <tr><td>Promotion Bonus</td><td>€{player.promotionBonus?.toLocaleString() ?? '-'}</td></tr>
          <tr><td>Release Clause</td><td>€{player.releaseClause?.toLocaleString() ?? '-'}</td></tr>
          <tr><td>Buyout Clause</td><td>€{player.buyoutClause?.toLocaleString() ?? '-'}</td></tr>
          <tr><td>Optional Extension</td><td>{player.optionalExtension ? 'Yes' : 'No'}</td></tr>
          <tr><td>Agent Name</td><td>{player.agentName ?? '-'}</td></tr>
          <tr><td>Agent Fee</td><td>€{player.agentFee?.toLocaleString() ?? '-'}</td></tr>
        </tbody>
      </table>
      <button onClick={onOpenNegotiation} style={{marginTop: 16}}>Negotiate Contract</button>
      <h3 style={{marginTop: 24}}>Contract History</h3>
      <ul>
        {player.contractHistory && player.contractHistory.length > 0 ? (
          player.contractHistory.map((entry, idx) => (
            <li key={idx}>
              <strong>{entry.type}</strong> - {entry.status} ({new Date(entry.date).toLocaleString()})
              {entry.offer && <pre style={{fontSize: '0.9em', background: '#f6f6f6', padding: 8, borderRadius: 4}}>{JSON.stringify(entry.offer, null, 2)}</pre>}
            </li>
          ))
        ) : (
          <li>No contract history.</li>
        )}
      </ul>
    </div>
  );
};

export default PlayerContractPanel; 