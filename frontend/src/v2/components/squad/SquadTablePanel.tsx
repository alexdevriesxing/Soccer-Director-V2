import React from 'react';
import { SquadPlayer } from '../../types';
import {
  formatAge,
  formatContractEnd,
  formatMoney,
  formatRetrainingPosition,
  riskColor
} from '../../utils/squadFormatting';

interface SquadTablePanelProps {
  rows: SquadPlayer[];
  selectedPlayerId: number | null;
  focusPlayerId: number | null;
  rowRefs: React.MutableRefObject<Record<number, HTMLTableRowElement | null>>;
  busyPlayerId: number | null;
  busyAction: 'RENEW' | 'RELEASE' | 'ROLE' | 'STATUS' | 'DEV_PLAN' | 'MEDICAL' | 'REGISTRATION' | 'RETRAINING' | null;
  onSelectPlayer: (playerId: number) => void;
  onRenew: (player: SquadPlayer, event?: React.MouseEvent<HTMLButtonElement>) => void;
  onRelease: (player: SquadPlayer, event?: React.MouseEvent<HTMLButtonElement>) => void;
}

const SquadTablePanel: React.FC<SquadTablePanelProps> = ({
  rows,
  selectedPlayerId,
  focusPlayerId,
  rowRefs,
  busyPlayerId,
  busyAction,
  onSelectPlayer,
  onRenew,
  onRelease
}) => (
  <section className="v2-panel v2-squad-table-panel">
    <div className="v2-squad-table-panel__header">
      <div>
        <p className="v2-kicker" style={{ margin: 0 }}>Matchday Squad Management</p>
        <h3 className="v2-panel__title" style={{ marginBottom: 2 }}>Player List</h3>
        <p className="v2-panel__subtitle">
          Select a player to inspect role, contract pressure, and availability context.
        </p>
      </div>
      <span className="v2-badge v2-badge--low">{rows.length} players</span>
    </div>

    <div className="v2-squad-table-wrap">
      <table className="v2-squad-table">
        <thead>
          <tr>
            <th style={head}>Name</th>
            <th style={head}>Pos</th>
            <th style={head}>Age</th>
            <th style={head}>CA</th>
            <th style={head}>Wage</th>
            <th style={head}>Contract</th>
            <th style={head}>Risk</th>
            <th style={head}>Reg</th>
            <th style={head}>Fit</th>
            <th style={head}>Mor</th>
            <th style={head}>Status</th>
            <th style={head}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td style={cell} colSpan={12}>No squad players available for this career.</td>
            </tr>
          )}
          {rows.map((row, index) => {
            const isFocused = row.id === focusPlayerId;
            const isSelected = row.id === selectedPlayerId;
            return (
              <tr
                key={row.id || `${index}-${row.fullName || ''}`}
                ref={(el) => { rowRefs.current[row.id] = el; }}
                data-testid={isFocused ? 'squad-focused-player-row' : undefined}
                className={isSelected ? 'v2-squad-row v2-squad-row--selected' : 'v2-squad-row'}
                style={isFocused ? focusedRowStyle : undefined}
                onClick={() => onSelectPlayer(row.id)}
                aria-selected={isSelected}
              >
                <td style={isFocused ? focusedCell : cell}>
                  <div className="v2-squad-namecell">
                    <span>{row.fullName}</span>
                    {isSelected && <span className="v2-squad-row-tag">Selected</span>}
                  </div>
                </td>
                <td style={isFocused ? focusedCell : cell}>
                  {row.effectivePosition && row.effectivePosition !== row.position
                    ? `${formatRetrainingPosition(row.position)} -> ${formatRetrainingPosition(row.effectivePosition)}`
                    : formatRetrainingPosition(row.position)}
                </td>
                <td style={isFocused ? focusedCell : cell}>{formatAge(row.age)}</td>
                <td style={isFocused ? focusedCell : cell}>{row.currentAbility || '-'}</td>
                <td style={isFocused ? focusedCell : cell}>{formatMoney(row.weeklyWage)}</td>
                <td style={isFocused ? focusedCell : cell}>{formatContractEnd(row.contractEnd)}</td>
                <td style={{ ...(isFocused ? focusedCell : cell), color: riskColor(row.contractRisk) }}>{row.contractRisk || '-'}</td>
                <td style={isFocused ? focusedCell : cell}>{row.registrationStatus === 'REGISTERED' ? 'Yes' : 'No'}</td>
                <td style={isFocused ? focusedCell : cell}>{row.fitness}</td>
                <td style={isFocused ? focusedCell : cell}>{row.morale}</td>
                <td style={isFocused ? focusedCell : cell}>
                  {row.isInjured
                    ? `Injured (${row.injuryWeeks}w)`
                    : row.isSuspended
                      ? 'Suspended'
                      : row.eligibilityCode === 'UNREGISTERED' || row.eligibilityCode === 'OVERAGE_LIMIT'
                        ? 'Ineligible'
                        : 'Available'}
                </td>
                <td style={{ ...(isFocused ? focusedCell : cell), whiteSpace: 'nowrap' }}>
                  <button
                    type="button"
                    className="v2-button v2-button--ghost"
                    disabled={busyPlayerId === row.id}
                    onClick={(event) => onRenew(row, event)}
                  >
                    {busyPlayerId === row.id && busyAction === 'RENEW' ? 'Renewing...' : 'Renew'}
                  </button>
                  <button
                    type="button"
                    className="v2-button v2-button--danger"
                    disabled={busyPlayerId === row.id}
                    onClick={(event) => onRelease(row, event)}
                    style={{ marginLeft: 6 }}
                  >
                    {busyPlayerId === row.id && busyAction === 'RELEASE' ? 'Releasing...' : 'Release'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </section>
);

const head: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 8px',
  borderBottom: '1px solid rgba(132, 222, 181, 0.35)',
  fontSize: 12,
  whiteSpace: 'nowrap'
};

const cell: React.CSSProperties = {
  padding: '7px 8px',
  borderBottom: '1px solid rgba(132, 222, 181, 0.12)',
  fontSize: 13,
  verticalAlign: 'middle'
};

const focusedRowStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, rgba(123, 214, 174, 0.14), rgba(123, 214, 174, 0.06))',
  boxShadow: 'inset 0 0 0 1px rgba(123, 214, 174, 0.45)'
};

const focusedCell: React.CSSProperties = {
  ...cell,
  borderBottom: '1px solid rgba(123, 214, 174, 0.35)'
};

export default SquadTablePanel;
