import React from 'react';
import { ContractWeekWrapDigest } from '../types';

function formatDelta(value: number): string {
  if (!Number.isFinite(value) || value === 0) {
    return '0';
  }
  return `${value > 0 ? '+' : ''}${Math.round(value)}`;
}

function formatMoneyDelta(value: number): string {
  if (!Number.isFinite(value) || value === 0) {
    return 'EUR 0';
  }
  const rounded = Math.round(value);
  return `${rounded > 0 ? '+' : '-'}EUR ${Math.abs(rounded).toLocaleString()}`;
}

function formatStamp(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

function metricTone(value: number): string {
  if (value > 0) return 'v2-metric__value v2-metric__value--positive';
  if (value < 0) return 'v2-metric__value v2-metric__value--negative';
  return 'v2-metric__value';
}

interface ContractWeekWrapDigestCardProps {
  digest: ContractWeekWrapDigest;
  title?: string;
  testId?: string;
}

const ContractWeekWrapDigestCard: React.FC<ContractWeekWrapDigestCardProps> = ({
  digest,
  title = 'Contract Lifecycle Digest',
  testId
}) => {
  const releasedPreview = digest.releasedPlayers.slice(0, 6);
  const hiddenReleasedCount = Math.max(0, digest.releasedPlayers.length - releasedPreview.length);
  const hasMovement = digest.expiredCount > 0 || digest.emergencySignings > 0;

  if (!hasMovement) {
    return null;
  }

  return (
    <section data-testid={testId} className="v2-panel v2-panel--warm">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <h3 className="v2-panel__title">{title}</h3>
          <p className="v2-panel__subtitle" style={{ color: '#f0d6b0' }}>
            Week wrap {digest.wrappedWeekNumber ?? '?'}
            {digest.nextWeekNumber ? ` -> Week ${digest.nextWeekNumber}` : ''}
            {' '}({formatStamp(digest.wrappedAt)})
          </p>
        </div>
        <div className="v2-chip-row">
          <span className="v2-badge v2-badge--warning">Expired: {digest.expiredCount}</span>
          <span className="v2-badge v2-badge--low">Emergency Signings: {digest.emergencySignings}</span>
        </div>
      </div>

      <div className="v2-metric-grid">
        <div className="v2-metric">
          <p className="v2-metric__label">Net Budget Impact</p>
          <p className={metricTone(digest.netBudgetDelta)}>{formatMoneyDelta(digest.netBudgetDelta)}</p>
        </div>
        <div className="v2-metric">
          <p className="v2-metric__label">Wage Relief</p>
          <p className="v2-metric__value v2-metric__value--positive">+EUR {Math.round(digest.releasedWageRelief).toLocaleString()}</p>
        </div>
        <div className="v2-metric">
          <p className="v2-metric__label">Emergency Signing Cost</p>
          <p className="v2-metric__value v2-metric__value--negative">-EUR {Math.round(digest.emergencySigningCost).toLocaleString()}</p>
        </div>
        <div className="v2-metric">
          <p className="v2-metric__label">Morale Delta</p>
          <p className={metricTone(digest.moraleDelta)}>{formatDelta(digest.moraleDelta)}</p>
        </div>
        <div className="v2-metric">
          <p className="v2-metric__label">Board Delta</p>
          <p className={metricTone(digest.boardDelta)}>{formatDelta(digest.boardDelta)}</p>
        </div>
        <div className="v2-metric">
          <p className="v2-metric__label">Squad Depth</p>
          <p className="v2-metric__value">
            {digest.squadBefore}{' -> '}{digest.squadAfterRelease}{' -> '}{digest.squadAfterTopUp}
          </p>
        </div>
      </div>

      {releasedPreview.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div className="v2-kicker" style={{ color: '#f4d9b5', marginBottom: 6 }}>Released (expired contracts)</div>
          <div className="v2-chip-row">
            {releasedPreview.map((player) => (
              <span
                key={player.id}
                className="v2-chip v2-chip--warm"
              >
                {player.name} ({player.position})
              </span>
            ))}
            {hiddenReleasedCount > 0 && (
              <span className="v2-chip v2-chip--warm">
                +{hiddenReleasedCount} more
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ContractWeekWrapDigestCard;
