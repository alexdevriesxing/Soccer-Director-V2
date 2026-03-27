import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ActiveCareerRequired from '../components/ActiveCareerRequired';
import ContractWeekWrapDigestCard from '../components/ContractWeekWrapDigestCard';
import V2Shell from '../components/V2Shell';
import { getCareerState, listInbox, respondInbox } from '../api';
import { ContractWeekWrapDigest, InboxEvent, InboxRespondResult } from '../types';
import { useActiveCareer } from '../useActiveCareer';

type ContractWarningMeta = {
  position: string;
  age: number;
  wageWeekly: number;
  roleTier: string;
  contractEndIso: string;
  daysRemaining: number;
  agentStance: string;
  boardStance: string;
};

type InboxToast = {
  id: number;
  title: string;
  message: string;
  tone: 'success' | 'info';
  ctaHref?: string;
  ctaLabel?: string;
};

type ParsedContractWarningChoice =
  | { action: 'RENEW'; playerId: number; years: number; wageAdjustmentPct: number }
  | { action: 'PROMISE'; playerId: number }
  | { action: 'RELEASE'; playerId: number; compensationWeeks: number };

const CONTRACT_WARNING_DESCRIPTION_PATTERN =
  /^\s*([^|]+?)\s*\|\s*Age\s+(\d+)\s*\|\s*Wage EUR\s+([\d,]+)\s*\/\s*week\s*\|\s*([A-Z_]+)\.\s*Contract expires on\s+(\d{4}-\d{2}-\d{2})\s*\((\d+)\s+days?\s+remaining\)\.\s*Agent stance:\s*([\s\S]+?)\s*Board stance:\s*([\s\S]+)\s*$/;

function urgencyBadgeClass(urgency: InboxEvent['urgency']): string {
  if (urgency === 'HIGH') return 'v2-badge v2-badge--high';
  if (urgency === 'MEDIUM') return 'v2-badge v2-badge--medium';
  return 'v2-badge v2-badge--low';
}

function effectPillClass(value: unknown): string {
  const num = typeof value === 'number' ? value : Number.NaN;
  if (Number.isFinite(num)) {
    if (num > 0) return 'v2-effect-pill v2-effect-pill--positive';
    if (num < 0) return 'v2-effect-pill v2-effect-pill--negative';
  }
  return 'v2-effect-pill';
}

function formatEffectValue(value: unknown): string {
  if (typeof value === 'number') {
    if (value > 0) return `+${value}`;
    return String(value);
  }
  if (typeof value === 'boolean') {
    return value ? 'yes' : 'no';
  }
  return String(value);
}

function formatEffectKey(key: string): string {
  const lookup: Record<string, string> = {
    moraleDelta: 'Morale',
    boardDelta: 'Board',
    fanDelta: 'Fans',
    mediaDelta: 'Media',
    fitnessTrendDelta: 'Fitness',
    budgetDelta: 'Budget',
    playerMoraleDelta: 'Player Morale',
    playerFitnessDelta: 'Player Fitness',
    playerFormDelta: 'Player Form',
    playerDevelopmentDelta: 'Development',
    transferAction: 'Transfer',
    scoutingOutcome: 'Scouting'
  };
  return lookup[key] || key;
}

function contractAcceptanceRiskLabel(risk: InboxEvent['options'][number]['acceptanceRisk']): string {
  if (risk === 'LOW') return 'Acceptance Likely';
  if (risk === 'MEDIUM') return 'Acceptance Balanced';
  if (risk === 'HIGH') return 'High Counter Risk';
  if (risk === 'VERY_HIGH') return 'High Rejection Risk';
  return 'Acceptance Risk';
}

function contractAcceptanceRiskClass(risk: InboxEvent['options'][number]['acceptanceRisk']): string {
  if (risk === 'LOW') return 'v2-option-risk-pill v2-option-risk-pill--low';
  if (risk === 'MEDIUM') return 'v2-option-risk-pill v2-option-risk-pill--medium';
  if (risk === 'HIGH') return 'v2-option-risk-pill v2-option-risk-pill--high';
  if (risk === 'VERY_HIGH') return 'v2-option-risk-pill v2-option-risk-pill--very-high';
  return 'v2-option-risk-pill';
}

function contractBoardPolicyLabel(level: InboxEvent['options'][number]['boardPolicyLevel']): string {
  if (level === 'HARD') return 'Board Hard Cap';
  if (level === 'SOFT') return 'Board Soft Cap';
  return 'Board Policy';
}

function contractBoardPolicyClass(level: InboxEvent['options'][number]['boardPolicyLevel']): string {
  if (level === 'HARD') return 'v2-option-policy-pill v2-option-policy-pill--hard';
  if (level === 'SOFT') return 'v2-option-policy-pill v2-option-policy-pill--soft';
  return 'v2-option-policy-pill';
}

function optionActionHint(optionId: string): string | null {
  if (optionId.startsWith('contract_warn:')) {
    return 'Contract action applies. Budget and board effects depend on player terms.';
  }
  return null;
}

function parseContractWarningPlayerId(optionId: string): number | null {
  if (!optionId.startsWith('contract_warn:')) {
    return null;
  }
  const parts = optionId.split(':');
  const playerId = Number(parts[2]);
  if (!Number.isFinite(playerId) || playerId <= 0) {
    return null;
  }
  return playerId;
}

function parseContractWarningChoice(optionId: string): ParsedContractWarningChoice | null {
  if (!optionId.startsWith('contract_warn:')) {
    return null;
  }
  const parts = optionId.split(':');
  const action = String(parts[1] || '').toLowerCase();
  const playerId = Number(parts[2]);
  if (!Number.isFinite(playerId) || playerId <= 0) {
    return null;
  }

  if (action === 'renew') {
    const years = Number(parts[3]);
    const wageAdjustmentPct = Number(parts[4]);
    if (!Number.isFinite(years) || !Number.isFinite(wageAdjustmentPct)) {
      return null;
    }
    return {
      action: 'RENEW',
      playerId,
      years,
      wageAdjustmentPct
    };
  }

  if (action === 'promise') {
    return {
      action: 'PROMISE',
      playerId
    };
  }

  if (action === 'release') {
    const compensationWeeks = Number(parts[3]);
    if (!Number.isFinite(compensationWeeks)) {
      return null;
    }
    return {
      action: 'RELEASE',
      playerId,
      compensationWeeks
    };
  }

  return null;
}

function parseContractWarningMeta(description: string): ContractWarningMeta | null {
  const match = CONTRACT_WARNING_DESCRIPTION_PATTERN.exec(description);
  if (!match) {
    return null;
  }

  const age = Number(match[2]);
  const wageWeekly = Number(String(match[3]).replace(/,/g, ''));
  const daysRemaining = Number(match[6]);

  if (!Number.isFinite(age) || !Number.isFinite(wageWeekly) || !Number.isFinite(daysRemaining)) {
    return null;
  }

  return {
    position: match[1].trim(),
    age,
    wageWeekly,
    roleTier: match[4].trim(),
    contractEndIso: match[5].trim(),
    daysRemaining,
    agentStance: match[7].trim(),
    boardStance: match[8].trim()
  };
}

function formatRoleTier(roleTier: string): string {
  return roleTier
    .split('_')
    .map((part) => part ? `${part.slice(0, 1)}${part.slice(1).toLowerCase()}` : part)
    .join(' ');
}

function contractWarningDaysChipClass(daysRemaining: number): string {
  if (daysRemaining <= 30) return 'v2-chip v2-chip--danger';
  if (daysRemaining <= 60) return 'v2-chip v2-chip--warm';
  return 'v2-chip';
}

function extractContractWarningPlayerName(title: string): string | null {
  const prefix = 'Contract Decision Needed:';
  if (!title.startsWith(prefix)) {
    return null;
  }
  const value = title.slice(prefix.length).trim();
  return value || null;
}

function formatCurrencySigned(value: number): string {
  const rounded = Math.round(value);
  const absolute = Math.abs(rounded).toLocaleString();
  return `${rounded >= 0 ? '+' : '-'}EUR ${absolute}`;
}

function summarizeEffects(effects: InboxEvent['options'][number]['effects']): string | null {
  const entries = Object.entries(effects || {});
  if (entries.length === 0) {
    return null;
  }

  const parts = entries.slice(0, 3).map(([key, value]) => {
    if (typeof value === 'number') {
      const formatted = value > 0 ? `+${value}` : String(value);
      return `${formatEffectKey(key)} ${formatted}`;
    }
    if (typeof value === 'string') {
      return `${formatEffectKey(key)} ${value}`;
    }
    if (typeof value === 'boolean') {
      return `${formatEffectKey(key)} ${value ? 'yes' : 'no'}`;
    }
    return `${formatEffectKey(key)}`;
  });

  return parts.join(' • ');
}

function buildInboxActionToast(
  event: InboxEvent,
  fallbackOption: InboxEvent['options'][number],
  result: InboxRespondResult
): InboxToast {
  const resolvedOption = result.option || fallbackOption;
  const pendingEvents = Number.isFinite(result.pendingEvents) ? Number(result.pendingEvents) : 0;
  const pendingSuffix = pendingEvents > 0
    ? `${pendingEvents} inbox event${pendingEvents === 1 ? '' : 's'} still pending this week.`
    : 'Inbox is clear for this phase.';
  const contractOutcome = result.contractAction ?? null;
  const parsedChoice = parseContractWarningChoice(resolvedOption.id);
  const playerName = contractOutcome?.playerName || extractContractWarningPlayerName(event.title) || 'Player';
  const playerId = contractOutcome?.playerId || parsedChoice?.playerId;

  if (contractOutcome?.action === 'COUNTER') {
    const boardText = typeof contractOutcome.boardDelta === 'number'
      ? `Board ${contractOutcome.boardDelta > 0 ? '+' : ''}${contractOutcome.boardDelta}.`
      : null;
    const moraleText = typeof contractOutcome.playerMoraleDelta === 'number'
      ? `Player morale ${contractOutcome.playerMoraleDelta > 0 ? '+' : ''}${contractOutcome.playerMoraleDelta}.`
      : null;
    const counterTerms = (typeof contractOutcome.counterYears === 'number' && typeof contractOutcome.counterWageAdjustmentPct === 'number')
      ? `Counter demand: ${contractOutcome.counterYears}-year deal at +${contractOutcome.counterWageAdjustmentPct}% wage.`
      : null;
    return {
      id: Date.now(),
      tone: 'info',
      title: 'Agent counter-demand',
      message: `${playerName}: ${[
        contractOutcome.note || 'Agent did not accept the initial package.',
        counterTerms,
        boardText,
        moraleText,
        pendingSuffix
      ].filter(Boolean).join(' ')}`,
      ...(playerId ? { ctaHref: `/career-squad?focusPlayerId=${playerId}&from=inbox`, ctaLabel: 'Review in Squad' } : {})
    };
  }

  if (contractOutcome?.action === 'REJECT') {
    const boardText = typeof contractOutcome.boardDelta === 'number'
      ? `Board ${contractOutcome.boardDelta > 0 ? '+' : ''}${contractOutcome.boardDelta}.`
      : null;
    const moraleText = typeof contractOutcome.playerMoraleDelta === 'number'
      ? `Player morale ${contractOutcome.playerMoraleDelta > 0 ? '+' : ''}${contractOutcome.playerMoraleDelta}.`
      : null;
    return {
      id: Date.now(),
      tone: 'info',
      title: 'Contract talks stalled',
      message: `${playerName}: ${[
        contractOutcome.note || 'Offer rejected.',
        boardText,
        moraleText,
        pendingSuffix
      ].filter(Boolean).join(' ')}`,
      ...(playerId ? { ctaHref: `/career-squad?focusPlayerId=${playerId}&from=inbox`, ctaLabel: 'Check Squad' } : {})
    };
  }

  if (parsedChoice?.action === 'RENEW' || contractOutcome?.action === 'RENEW') {
    const years = contractOutcome?.years ?? (parsedChoice?.action === 'RENEW' ? parsedChoice.years : undefined);
    const wagePct = parsedChoice?.action === 'RENEW' ? parsedChoice.wageAdjustmentPct : undefined;
    const wageText = Number.isFinite(contractOutcome?.weeklyWage)
      ? `New wage EUR ${Math.round(Number(contractOutcome?.weeklyWage)).toLocaleString()}/wk.`
      : null;
    const expiryText = contractOutcome?.contractEnd
      ? `Ends ${String(contractOutcome.contractEnd).slice(0, 10)}.`
      : null;
    const budgetText = Number.isFinite(contractOutcome?.budgetImpact)
      ? `Budget ${formatCurrencySigned(Number(contractOutcome.budgetImpact))}.`
      : null;
    return {
      id: Date.now(),
      tone: 'success',
      title: 'Contract renewed',
      message: `${playerName}: ${years ?? '?'}-year package selected${typeof wagePct === 'number' ? ` (+${wagePct}% wage)` : ''}. ${[
        wageText,
        expiryText,
        budgetText,
        pendingSuffix
      ].filter(Boolean).join(' ')}`,
      ...(playerId ? { ctaHref: `/career-squad?focusPlayerId=${playerId}&from=inbox`, ctaLabel: 'Open in Squad' } : {})
    };
  }

  if (parsedChoice?.action === 'RELEASE' || contractOutcome?.action === 'RELEASE') {
    const compensationWeeks = contractOutcome?.compensationWeeks
      ?? (parsedChoice?.action === 'RELEASE' ? parsedChoice.compensationWeeks : undefined);
    const budgetText = Number.isFinite(contractOutcome?.budgetImpact)
      ? `Budget ${formatCurrencySigned(Number(contractOutcome.budgetImpact))}.`
      : null;
    return {
      id: Date.now(),
      tone: 'info',
      title: 'Release action completed',
      message: `${playerName}: released with ${compensationWeeks ?? '?'} week${compensationWeeks === 1 ? '' : 's'} compensation. ${[
        budgetText,
        pendingSuffix
      ].filter(Boolean).join(' ')}`,
      ...(playerId ? { ctaHref: `/career-squad?focusPlayerId=${playerId}&from=inbox`, ctaLabel: 'Review Squad' } : {})
    };
  }

  if (parsedChoice?.action === 'PROMISE' || contractOutcome?.action === 'PROMISE') {
    return {
      id: Date.now(),
      tone: 'info',
      title: 'Contract decision deferred',
      message: `${playerName}: promised a contract decision after the next match. Warning cooldown applied for next week. ${pendingSuffix}`,
      ...(playerId ? { ctaHref: `/career-squad?focusPlayerId=${playerId}&from=inbox`, ctaLabel: 'Track in Squad' } : {})
    };
  }

  const effectSummary = summarizeEffects(resolvedOption.effects);
  return {
    id: Date.now(),
    tone: 'success',
    title: 'Inbox decision applied',
    message: `${resolvedOption.label}.${effectSummary ? ` ${effectSummary}.` : ''} ${pendingSuffix}`
  };
}

const InboxPage: React.FC = () => {
  const { careerId, careers, resolving, resolveError, setCareerId } = useActiveCareer();
  const [events, setEvents] = useState<InboxEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [contractWeekWrapDigest, setContractWeekWrapDigest] = useState<ContractWeekWrapDigest | null>(null);
  const [toast, setToast] = useState<InboxToast | null>(null);

  const load = useCallback(async () => {
    if (!careerId) return;
    setLoading(true);
    setError(null);
    try {
      const [inboxData, careerState] = await Promise.all([
        listInbox(careerId),
        getCareerState(careerId)
      ]);
      setEvents(inboxData);
      setContractWeekWrapDigest(careerState.lastContractWeekWrapDigest ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load inbox.');
      setContractWeekWrapDigest(null);
    } finally {
      setLoading(false);
    }
  }, [careerId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => {
      setToast((current) => (current?.id === toast.id ? null : current));
    }, 5200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const resolveEvent = async (event: InboxEvent, option: InboxEvent['options'][number]) => {
    if (!careerId) return;
    setBusyId(event.id);
    try {
      const result = await respondInbox(careerId, event.id, option.id);
      setToast(buildInboxActionToast(event, option, result));
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resolve event.');
      setToast({
        id: Date.now(),
        tone: 'info',
        title: 'Action failed',
        message: err instanceof Error ? err.message : 'Failed to resolve inbox event.'
      });
    } finally {
      setBusyId(null);
    }
  };

  if (!careerId) {
    return (
      <V2Shell title="Inbox">
        <ActiveCareerRequired
          resolving={resolving}
          resolveError={resolveError}
          careers={careers}
          onSelectCareer={setCareerId}
        />
      </V2Shell>
    );
  }

  return (
    <V2Shell title="Manager Inbox">
      <div className="v2-stack">
        {loading && (
          <div className="v2-grid">
            <div className="v2-skeleton" />
            <div className="v2-skeleton" />
          </div>
        )}
        {error && <div className="v2-message v2-message--error">{error}</div>}
        {toast && (
          <div
            className={`v2-toast ${toast.tone === 'success' ? 'v2-toast--success' : 'v2-toast--info'}`}
            role="status"
            aria-live="polite"
            data-testid="inbox-action-toast"
          >
            <div className="v2-toast__body">
              <div className="v2-toast__title">{toast.title}</div>
              <div className="v2-toast__message">{toast.message}</div>
            </div>
            <div className="v2-toast__actions">
              {toast.ctaHref && (
                <Link className="v2-link-button v2-link-button--secondary" to={toast.ctaHref}>
                  {toast.ctaLabel || 'Open'}
                </Link>
              )}
              <button
                type="button"
                className="v2-toast__dismiss"
                onClick={() => setToast(null)}
                aria-label="Dismiss inbox action confirmation"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {contractWeekWrapDigest && (
          <ContractWeekWrapDigestCard
            digest={contractWeekWrapDigest}
            title="Recent Week Wrap Contract Digest"
            testId="inbox-contract-week-wrap-digest"
          />
        )}

      <div className="v2-grid">
        {events.length === 0 && !loading && (
          <div data-testid="inbox-empty" className="v2-message v2-message--subtle">No events in inbox.</div>
        )}

        {events.map((event) => {
          const pending = event.status === 'PENDING';
          const effectEntries = Object.entries(event.options[0]?.effects ?? {});
          const contractWarningPlayerId = event.options
            .map((option) => parseContractWarningPlayerId(option.id))
            .find((value): value is number => Number.isFinite(value));
          const contractWarningMeta = parseContractWarningMeta(event.description);
          const squadFocusHref = contractWarningPlayerId
            ? `/career-squad?focusPlayerId=${contractWarningPlayerId}&from=inbox`
            : null;

          return (
            <article data-testid="inbox-event-card" key={event.id} className="v2-event-card">
              <div className="v2-event-card__header">
                <h3 className="v2-event-card__title">{event.title}</h3>
                <span className={urgencyBadgeClass(event.urgency)}>{event.urgency}</span>
              </div>
              {contractWarningMeta ? (
                <div className="v2-contract-warning-context" data-testid="contract-warning-context">
                  <div className="v2-chip-row v2-contract-warning-context__chips">
                    <span className="v2-chip">{contractWarningMeta.position}</span>
                    <span className="v2-chip">Role: {formatRoleTier(contractWarningMeta.roleTier)}</span>
                    <span className="v2-chip">Age {contractWarningMeta.age}</span>
                    <span className="v2-chip">EUR {contractWarningMeta.wageWeekly.toLocaleString()}/wk</span>
                    <span className={contractWarningDaysChipClass(contractWarningMeta.daysRemaining)}>
                      {contractWarningMeta.daysRemaining}d remaining
                    </span>
                    <span className="v2-chip">Expires {contractWarningMeta.contractEndIso}</span>
                  </div>
                  <p className="v2-event-card__desc v2-event-card__desc--compact">
                    Decide now to avoid an unmanaged departure at week wrap.
                  </p>
                  <div className="v2-contract-warning-context__stances">
                    <div className="v2-contract-warning-context__stance">
                      <span className="v2-contract-warning-context__stance-label">Agent</span>
                      <p className="v2-contract-warning-context__stance-copy">{contractWarningMeta.agentStance}</p>
                    </div>
                    <div className="v2-contract-warning-context__stance">
                      <span className="v2-contract-warning-context__stance-label">Board</span>
                      <p className="v2-contract-warning-context__stance-copy">{contractWarningMeta.boardStance}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="v2-event-card__desc">{event.description}</p>
              )}
              <div className="v2-event-card__meta">
                <span className="v2-chip">Week {event.weekNumber}</span>
                <span className="v2-chip">Deadline: {new Date(event.deadline).toLocaleString()}</span>
                <span className={`v2-chip ${event.status === 'PENDING' ? 'v2-chip--warm' : ''}`}>Status: {event.status}</span>
              </div>
              {squadFocusHref ? (
                <div style={{ marginTop: 8 }}>
                  <Link className="v2-link-button v2-link-button--secondary" to={squadFocusHref}>
                    Open Player in Squad
                  </Link>
                </div>
              ) : null}
              {!pending && effectEntries.length > 0 ? (
                <div style={{ marginTop: 8 }} className="v2-chip-row">
                  {effectEntries.slice(0, 6).map(([key, value]) => (
                    <span key={`${event.id}-${key}`} className={effectPillClass(value)}>
                      {formatEffectKey(key)}: {formatEffectValue(value)}
                    </span>
                  ))}
                </div>
              ) : null}

              {pending ? (
                <div className="v2-grid" style={{ marginTop: 10 }}>
                  {event.options.map((option) => {
                    const actionHint = optionActionHint(option.id);
                    const isBoardHardCap = option.boardPolicyLevel === 'HARD';
                    const isDisabled = busyId === event.id || isBoardHardCap;
                    return (
                    <button
                      data-testid="inbox-option-button"
                      key={option.id}
                      onClick={() => resolveEvent(event, option)}
                      disabled={isDisabled}
                      className="v2-option-button"
                    >
                      <span className="v2-option-button__top">
                        <span className="v2-option-button__label">{option.label}</span>
                        <span className="v2-option-button__top-pills">
                          {option.acceptanceRisk ? (
                            <span className={contractAcceptanceRiskClass(option.acceptanceRisk)}>
                              {contractAcceptanceRiskLabel(option.acceptanceRisk)}
                            </span>
                          ) : null}
                          {option.boardPolicyLevel ? (
                            <span className={contractBoardPolicyClass(option.boardPolicyLevel)}>
                              {contractBoardPolicyLabel(option.boardPolicyLevel)}
                            </span>
                          ) : null}
                        </span>
                      </span>
                      {option.acceptanceHint ? (
                        <span className="v2-option-button__risk-hint">{option.acceptanceHint}</span>
                      ) : null}
                      {option.boardPolicyWarning ? (
                        <span className={`v2-option-button__policy-warning ${isBoardHardCap ? 'v2-option-button__policy-warning--hard' : ''}`}>
                          {option.boardPolicyWarning}
                        </span>
                      ) : null}
                      {Object.keys(option.effects).length > 0 ? (
                        <span className="v2-option-button__effects">
                          {Object.entries(option.effects).map(([key, value]) => (
                            <span key={`${option.id}-${key}`} className={effectPillClass(value)}>
                              {formatEffectKey(key)}: {formatEffectValue(value)}
                            </span>
                          ))}
                        </span>
                      ) : isBoardHardCap ? (
                        <span className="v2-option-button__effects-empty">Blocked by current board wage policy</span>
                      ) : actionHint ? (
                        <span className="v2-option-button__effects-empty">{actionHint}</span>
                      ) : (
                        <span className="v2-option-button__effects-empty">No direct stat change</span>
                      )}
                    </button>
                    );
                  })}
                </div>
              ) : (
                <div className="v2-message v2-message--success" style={{ marginTop: 10, fontSize: 13 }}>
                  Resolution: {event.resolutionNote || 'Resolved'}
                </div>
              )}
            </article>
          );
        })}
      </div>
      </div>
    </V2Shell>
  );
};

export default InboxPage;
