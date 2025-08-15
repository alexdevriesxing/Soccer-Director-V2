import React, { useState, useEffect } from 'react';
import { getPlayerTransfers, getMoralePsychology, getPlayer } from '../api/playerApi';
import BaseModal from './BaseModal';

interface Player {
  id: string;
  name: string;
  age: number;
  position: string;
  club: string;
  value: number;
  skill?: number;
  potential?: number;
  nationality?: string;
  contractExpiry?: string;
  wage?: number;
  appearances?: number;
  goals?: number;
  assists?: number;
  cleanSheets?: number;
  yellowCards?: number;
  redCards?: number;
}

interface PlayerDetailModalProps {
  open: boolean;
  onClose: () => void;
  player: Player | null;
  onMakeOffer?: (player: Player) => void;
}

const tabs = ['Stats', 'History', 'Scout Report'];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function StarRating({ value, max = 5 }: { value?: number; max?: number }) {
  if (value === undefined) return null;
  const stars = Math.round((value / 100) * max);
  return (
    <span style={{ color: '#facc15', fontSize: 18, marginLeft: 6 }}>
      {'★'.repeat(stars)}{'☆'.repeat(max - stars)}
    </span>
  );
}

const iconStyle = { width: 18, height: 18, verticalAlign: 'middle', marginRight: 6, opacity: 0.85 };

const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ open, onClose, player, onMakeOffer }) => {
  const [tab, setTab] = useState('Stats');
  const [history, setHistory] = useState<any[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [scout, setScout] = useState<any | null>(null);
  const [scoutLoading, setScoutLoading] = useState(false);
  const [scoutError, setScoutError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !player) return;
    if (tab !== 'History') return;
    setHistoryLoading(true);
    setHistoryError(null);
    getPlayerTransfers(Number(player.id))
      .then(data => setHistory(data))
      .catch(() => setHistoryError('Failed to load transfer history.'))
      .finally(() => setHistoryLoading(false));
  }, [open, player, tab]);

  useEffect(() => {
    if (!open || !player) return;
    if (tab !== 'Scout Report') return;
    setScoutLoading(true);
    setScoutError(null);
    Promise.all([
      getMoralePsychology(Number(player.id)),
      getPlayer(Number(player.id)).then(res => res.data)
    ])
      .then(([moraleData, playerData]) => {
        setScout({
          morale: moraleData?.morale,
          personality: playerData?.personality,
          traits: playerData?.traits,
        });
      })
      .catch(() => setScoutError('Failed to load scout report.'))
      .finally(() => setScoutLoading(false));
  }, [open, player, tab]);

  if (!open || !player) return null;

  return (
    <BaseModal open={open} onClose={onClose} ariaLabel="Player Details" maxWidth={540} minWidth={320}>
      {/* Avatar and Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 10 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#22d3ee,#4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: '#fff', boxShadow: '0 2px 12px #22d3ee33' }}>
          {getInitials(player.name)}
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 1 }}>{player.name}</div>
            <div style={{ color: '#94a3b8', fontSize: 16 }}>{player.position} &bull; {player.club}</div>
          </div>
        </div>
        <div style={{ borderBottom: '1.5px solid #334155', margin: '16px 0 10px 0' }} />
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? 'linear-gradient(90deg,#22d3ee,#4ade80)' : 'transparent',
                color: tab === t ? '#111827' : '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '6px 18px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: tab === t ? '0 2px 8px #22d3ee44' : undefined,
                fontSize: 16,
                transition: 'background 0.18s, color 0.18s',
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div style={{ borderBottom: '1.5px solid #334155', margin: '0 0 18px 0' }} />
        {tab === 'Stats' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <span style={iconStyle}>⚡</span>Skill: <b>{player.skill ?? '-'}</b>
              <StarRating value={player.skill} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <span style={iconStyle}>⭐</span>Potential: <b>{player.potential ?? '-'}</b>
              <StarRating value={player.potential} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <span style={iconStyle}>🎂</span>Age: <b>{player.age}</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <span style={iconStyle}>🏳️</span>Nationality: <b>{player.nationality ?? '-'}</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <span style={iconStyle}>💰</span>Value: <b>€{player.value.toLocaleString()}</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <span style={iconStyle}>💵</span>Wage: <b>{player.wage !== undefined ? `€${player.wage.toLocaleString()}/week` : '-'}</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <span style={iconStyle}>📅</span>Contract Expiry: <b>{player.contractExpiry ?? '-'}</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <span style={iconStyle}>🎽</span>Appearances: <b>{player.appearances ?? '-'}</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <span style={iconStyle}>🥅</span>Goals: <b>{player.goals ?? '-'}</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <span style={iconStyle}>🎯</span>Assists: <b>{player.assists ?? '-'}</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <span style={iconStyle}>🧤</span>Clean Sheets: <b>{player.cleanSheets ?? '-'}</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <span style={iconStyle}>🟨</span>Yellow Cards: <b>{player.yellowCards ?? '-'}</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <span style={iconStyle}>🟥</span>Red Cards: <b>{player.redCards ?? '-'}</b>
            </div>
          </div>
        )}
        {tab === 'History' && (
          <div>
            <div style={{ marginBottom: 10, fontWeight: 600 }}>Transfer History</div>
            {historyLoading ? (
              <div style={{ color: '#4ade80', padding: 12 }}>Loading...</div>
            ) : historyError ? (
              <div style={{ color: '#f87171', padding: 12 }}>{historyError}</div>
            ) : history && history.length > 0 ? (
              <table style={{ width: '100%', background: 'rgba(17,24,39,0.92)', borderRadius: 8, marginBottom: 10 }}>
                <thead>
                  <tr style={{ background: '#22d3ee22' }}>
                    <th style={{ padding: 6, textAlign: 'left' }}>Date</th>
                    <th style={{ padding: 6, textAlign: 'left' }}>From</th>
                    <th style={{ padding: 6, textAlign: 'left' }}>To</th>
                    <th style={{ padding: 6, textAlign: 'right' }}>Fee (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: 6 }}>{h.date ? new Date(h.date).toLocaleDateString() : '-'}</td>
                      <td style={{ padding: 6 }}>{h.fromClub?.name || '-'}</td>
                      <td style={{ padding: 6 }}>{h.toClub?.name || '-'}</td>
                      <td style={{ padding: 6, textAlign: 'right' }}>{h.fee ? h.fee.toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ color: '#94a3b8', padding: 12 }}>No transfer history found.</div>
            )}
          </div>
        )}
        {tab === 'Scout Report' && (
          <div>
            {scoutLoading ? (
              <div style={{ color: '#4ade80', padding: 12 }}>Loading...</div>
            ) : scoutError ? (
              <div style={{ color: '#f87171', padding: 12 }}>{scoutError}</div>
            ) : scout ? (
              <>
                <div style={{ marginBottom: 10, fontWeight: 600 }}>Morale</div>
                <div style={{ marginBottom: 10 }}>{scout.morale !== undefined ? scout.morale : 'N/A'}</div>
                {scout.personality && <>
                  <div style={{ marginBottom: 10, fontWeight: 600 }}>Personality</div>
                  <div style={{ marginBottom: 10 }}>{scout.personality}</div>
                </>}
                {scout.traits && scout.traits.length > 0 && <>
                  <div style={{ marginBottom: 10, fontWeight: 600 }}>Traits</div>
                  <ul style={{ marginBottom: 10 }}>{scout.traits.map((t: string, i: number) => <li key={i}>• {t}</li>)}</ul>
                </>}
              </>
            ) : (
              <div style={{ color: '#94a3b8', padding: 12 }}>No scout report found.</div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
          <button onClick={onClose} style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: 'pointer' }}>Close</button>
          {onMakeOffer && (
            <button onClick={() => onMakeOffer(player)} style={{ background: 'linear-gradient(90deg,#22d3ee,#4ade80)', color: '#111827', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px #22d3ee44' }}>
              Make Offer
            </button>
          )}
        </div>
      </BaseModal>
  );
};

export default PlayerDetailModal; 