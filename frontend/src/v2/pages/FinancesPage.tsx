import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ActiveCareerRequired from '../components/ActiveCareerRequired';
import V2Shell from '../components/V2Shell';
import {
  getFinances,
  getTransferMarket,
  requestTransferScoutReport,
  respondTransferOffer,
  sellTransfer,
  submitTransferOffer,
  triggerLoanBuyOption,
  upgradeClubOperation,
  updateTransferShortlist
} from '../api';
import { ClubOperationKey } from '../contracts';
import {
  FinanceSnapshot,
  TransferIncomingLoanSummary,
  TransferMarketPayload,
  TransferMarketTarget,
  TransferNegotiationResult,
  TransferNegotiationSummary,
  TransferSaleResult
} from '../types';
import { useActiveCareer } from '../useActiveCareer';

type OfferKind = 'PERMANENT' | 'LOAN';

const FinancesPage: React.FC = () => {
  const { careerId, careers, resolving, resolveError, setCareerId } = useActiveCareer();
  const [finance, setFinance] = useState<FinanceSnapshot | null>(null);
  const [market, setMarket] = useState<TransferMarketPayload | null>(null);
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [affordableOnly, setAffordableOnly] = useState<boolean>(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [sellingPlayerId, setSellingPlayerId] = useState<number | null>(null);
  const [loanActionId, setLoanActionId] = useState<number | null>(null);
  const [shortlistBusyPlayerId, setShortlistBusyPlayerId] = useState<number | null>(null);
  const [scoutBusyPlayerId, setScoutBusyPlayerId] = useState<number | null>(null);
  const [negotiationBusyId, setNegotiationBusyId] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  const [draftSeedKey, setDraftSeedKey] = useState<string>('');
  const [offerKind, setOfferKind] = useState<OfferKind>('PERMANENT');
  const [offerTransferFee, setOfferTransferFee] = useState<number>(0);
  const [offerWeeklyWage, setOfferWeeklyWage] = useState<number>(0);
  const [offerLoanFee, setOfferLoanFee] = useState<number>(0);
  const [offerWageContributionPct, setOfferWageContributionPct] = useState<number>(70);
  const [offerBuyOptionFee, setOfferBuyOptionFee] = useState<number>(0);
  const [offerLoanDurationWeeks, setOfferLoanDurationWeeks] = useState<number>(24);
  const [activityMessage, setActivityMessage] = useState<string | null>(null);
  const [saleMessage, setSaleMessage] = useState<string | null>(null);
  const [operationBusyKey, setOperationBusyKey] = useState<ClubOperationKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFinance = useCallback(async () => {
    if (!careerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      setError(null);
      setFinance(await getFinances(careerId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load finance data.');
    } finally {
      setLoading(false);
    }
  }, [careerId]);

  const loadMarket = useCallback(async () => {
    if (!careerId) {
      setMarket(null);
      setMarketLoading(false);
      return;
    }

    try {
      setMarketError(null);
      setMarketLoading(true);
      const payload = await getTransferMarket(careerId, {
        limit: 28,
        position: positionFilter,
        affordableOnly
      });
      setMarket(payload);
    } catch (err: unknown) {
      setMarketError(err instanceof Error ? err.message : 'Failed to load transfer market.');
    } finally {
      setMarketLoading(false);
    }
  }, [affordableOnly, careerId, positionFilter]);

  useEffect(() => {
    loadFinance();
  }, [loadFinance]);

  useEffect(() => {
    loadMarket();
  }, [loadMarket]);

  useEffect(() => {
    if (!market) {
      if (selectedTargetId !== null) {
        setSelectedTargetId(null);
      }
      return;
    }

    const allTargets = [...market.shortlistedTargets, ...market.targets];
    const hasSelected = selectedTargetId !== null && allTargets.some((target) => target.playerId === selectedTargetId);
    if (hasSelected) {
      return;
    }

    const nextTarget = market.shortlistedTargets[0] ?? market.targets[0] ?? null;
    setSelectedTargetId(nextTarget?.playerId ?? null);
  }, [market, selectedTargetId]);

  const knownPositions = useMemo(() => {
    const defaults = ['GK', 'CB', 'RB', 'LB', 'DM', 'CM', 'AM', 'RW', 'LW', 'ST', 'CF'];
    const dynamic = new Set<string>(defaults);
    for (const row of market?.targets ?? []) {
      if (row.position) {
        dynamic.add(row.position.toUpperCase());
      }
    }
    return ['ALL', ...Array.from(dynamic).sort((a, b) => a.localeCompare(b))];
  }, [market?.targets]);

  const selectedTarget = useMemo(() => {
    if (!market || selectedTargetId === null) {
      return null;
    }
    return [...market.shortlistedTargets, ...market.targets].find((target) => target.playerId === selectedTargetId) ?? null;
  }, [market, selectedTargetId]);

  const selectedNegotiation = useMemo(() => {
    if (!market || selectedTargetId === null) {
      return null;
    }
    return market.activeNegotiations.find((negotiation) => negotiation.playerId === selectedTargetId) ?? null;
  }, [market, selectedTargetId]);
  const clubOperations = finance?.clubOperations ?? null;
  const transferWindow = market?.transferWindow ?? null;
  const transferActionsBlocked = Boolean(transferWindow && !transferWindow.isOpen);

  useEffect(() => {
    if (!selectedTarget) {
      return;
    }

    const nextSeedKey = [
      selectedTarget.playerId,
      selectedNegotiation?.negotiationId ?? 'base',
      selectedTarget.scoutingReport?.scoutedAtWeekNumber ?? 'na'
    ].join(':');

    if (nextSeedKey === draftSeedKey) {
      return;
    }

    const negotiationTerms = selectedNegotiation?.counterOffer;
    const report = selectedTarget.scoutingReport;
    const reportLoanImmediateCost = report
      ? Number(report.recommendedLoanFee ?? 0)
        + Math.round(selectedTarget.weeklyWage * ((Number(report.recommendedWageContributionPct ?? 0)) / 100) * 4)
      : Number.POSITIVE_INFINITY;
    const preferredKind: OfferKind = selectedNegotiation?.kind
      ?? (
        report?.recommendation === 'VALUE_LOAN'
        || (!selectedTarget.isAffordable && reportLoanImmediateCost <= Number(market?.availableBudget ?? 0))
          ? 'LOAN'
          : 'PERMANENT'
      );

    setOfferKind(preferredKind);
    if (negotiationTerms) {
      setOfferTransferFee(Number(negotiationTerms.transferFee ?? selectedTarget.askingFee));
      setOfferWeeklyWage(Number(negotiationTerms.weeklyWage ?? selectedTarget.weeklyWage));
      setOfferLoanFee(Number(negotiationTerms.loanFee ?? report?.recommendedLoanFee ?? 0));
      setOfferWageContributionPct(Number(negotiationTerms.wageContributionPct ?? report?.recommendedWageContributionPct ?? 70));
      setOfferBuyOptionFee(Number(negotiationTerms.buyOptionFee ?? report?.recommendedBuyOptionFee ?? 0));
      setOfferLoanDurationWeeks(Number(negotiationTerms.loanDurationWeeks ?? 24));
    } else if (preferredKind === 'LOAN') {
      setOfferTransferFee(selectedTarget.askingFee);
      setOfferWeeklyWage(report?.recommendedWeeklyWage ?? selectedTarget.weeklyWage);
      setOfferLoanFee(report?.recommendedLoanFee ?? Math.round(selectedTarget.askingFee * 0.1));
      setOfferWageContributionPct(report?.recommendedWageContributionPct ?? 70);
      setOfferBuyOptionFee(report?.recommendedBuyOptionFee ?? 0);
      setOfferLoanDurationWeeks(24);
    } else {
      setOfferTransferFee(report?.recommendedBidFee ?? selectedTarget.askingFee);
      setOfferWeeklyWage(report?.recommendedWeeklyWage ?? selectedTarget.weeklyWage);
      setOfferLoanFee(report?.recommendedLoanFee ?? Math.round(selectedTarget.askingFee * 0.1));
      setOfferWageContributionPct(report?.recommendedWageContributionPct ?? 70);
      setOfferBuyOptionFee(report?.recommendedBuyOptionFee ?? 0);
      setOfferLoanDurationWeeks(24);
    }

    setDraftSeedKey(nextSeedKey);
  }, [draftSeedKey, market?.availableBudget, selectedNegotiation, selectedTarget]);

  const refreshDesk = useCallback(async () => {
    await Promise.all([loadFinance(), loadMarket()]);
  }, [loadFinance, loadMarket]);

  const handleToggleShortlist = async (target: TransferMarketTarget) => {
    if (!careerId) return;
    setActivityMessage(null);
    setSaleMessage(null);
    setShortlistBusyPlayerId(target.playerId);
    try {
      const result = await updateTransferShortlist(careerId, {
        playerId: target.playerId,
        shortlisted: !target.isShortlisted
      });
      setActivityMessage(result.note);
      await loadMarket();
    } catch (err: unknown) {
      setMarketError(err instanceof Error ? err.message : 'Failed to update shortlist.');
    } finally {
      setShortlistBusyPlayerId(null);
    }
  };

  const handleScout = async (target: TransferMarketTarget) => {
    if (!careerId) return;
    setActivityMessage(null);
    setSaleMessage(null);
    setScoutBusyPlayerId(target.playerId);
    try {
      const result = await requestTransferScoutReport(careerId, target.playerId);
      setActivityMessage(result.note);
      setSelectedTargetId(target.playerId);
      setDraftSeedKey('');
      await loadMarket();
    } catch (err: unknown) {
      setMarketError(err instanceof Error ? err.message : 'Failed to request scouting report.');
    } finally {
      setScoutBusyPlayerId(null);
    }
  };

  const handleSubmitOffer = async () => {
    if (!careerId || !selectedTarget) {
      return;
    }

    setActivityMessage(null);
    setSaleMessage(null);
    setNegotiationBusyId(selectedNegotiation?.negotiationId ?? `offer:${selectedTarget.playerId}`);
    try {
      const result = selectedNegotiation
        ? await respondTransferOffer(careerId, {
          negotiationId: selectedNegotiation.negotiationId,
          action: 'REVISE',
          transferFee: offerKind === 'PERMANENT' ? offerTransferFee : undefined,
          weeklyWage: offerKind === 'PERMANENT' ? offerWeeklyWage : undefined,
          loanFee: offerKind === 'LOAN' ? offerLoanFee : undefined,
          wageContributionPct: offerKind === 'LOAN' ? offerWageContributionPct : undefined,
          buyOptionFee: offerKind === 'LOAN' && offerBuyOptionFee > 0 ? offerBuyOptionFee : undefined,
          loanDurationWeeks: offerKind === 'LOAN' ? offerLoanDurationWeeks : undefined
        })
        : await submitTransferOffer(careerId, {
          playerId: selectedTarget.playerId,
          kind: offerKind,
          transferFee: offerKind === 'PERMANENT' ? offerTransferFee : undefined,
          weeklyWage: offerKind === 'PERMANENT' ? offerWeeklyWage : undefined,
          loanFee: offerKind === 'LOAN' ? offerLoanFee : undefined,
          wageContributionPct: offerKind === 'LOAN' ? offerWageContributionPct : undefined,
          buyOptionFee: offerKind === 'LOAN' && offerBuyOptionFee > 0 ? offerBuyOptionFee : undefined,
          loanDurationWeeks: offerKind === 'LOAN' ? offerLoanDurationWeeks : undefined
        });
      setActivityMessage(describeNegotiationResult(result));
      setDraftSeedKey('');
      await refreshDesk();
    } catch (err: unknown) {
      setMarketError(err instanceof Error ? err.message : 'Offer submission failed.');
    } finally {
      setNegotiationBusyId(null);
    }
  };

  const handleAcceptCounter = async (negotiation: TransferNegotiationSummary) => {
    if (!careerId) {
      return;
    }
    setActivityMessage(null);
    setSaleMessage(null);
    setNegotiationBusyId(negotiation.negotiationId);
    try {
      const result = await respondTransferOffer(careerId, {
        negotiationId: negotiation.negotiationId,
        action: 'ACCEPT_COUNTER'
      });
      setActivityMessage(describeNegotiationResult(result));
      setDraftSeedKey('');
      await refreshDesk();
    } catch (err: unknown) {
      setMarketError(err instanceof Error ? err.message : 'Failed to accept counter.');
    } finally {
      setNegotiationBusyId(null);
    }
  };

  const handleWithdrawNegotiation = async (negotiation: TransferNegotiationSummary) => {
    if (!careerId) {
      return;
    }
    setActivityMessage(null);
    setSaleMessage(null);
    setNegotiationBusyId(negotiation.negotiationId);
    try {
      const result = await respondTransferOffer(careerId, {
        negotiationId: negotiation.negotiationId,
        action: 'WITHDRAW'
      });
      setActivityMessage(describeNegotiationResult(result));
      setDraftSeedKey('');
      await loadMarket();
    } catch (err: unknown) {
      setMarketError(err instanceof Error ? err.message : 'Failed to withdraw negotiation.');
    } finally {
      setNegotiationBusyId(null);
    }
  };

  const handleSellTransfer = async (playerId: number) => {
    if (!careerId) {
      return;
    }

    setActivityMessage(null);
    setSaleMessage(null);
    setSellingPlayerId(playerId);
    try {
      const sale: TransferSaleResult = await sellTransfer(careerId, playerId);
      setSaleMessage(
        `Sold ${sale.playerName} to ${sale.toClubName} for ${formatMoney(sale.transferFee)} (+${formatMoney(sale.wageRelief)} wage relief).`
      );
      await refreshDesk();
    } catch (err: unknown) {
      setMarketError(err instanceof Error ? err.message : 'Outgoing transfer failed.');
    } finally {
      setSellingPlayerId(null);
    }
  };

  const handleTriggerBuyOption = async (loan: TransferIncomingLoanSummary) => {
    if (!careerId) {
      return;
    }
    setActivityMessage(null);
    setSaleMessage(null);
    setLoanActionId(loan.loanId);
    try {
      const result = await triggerLoanBuyOption(careerId, loan.loanId);
      setActivityMessage(`Triggered buy option for ${result.playerName} at ${formatMoney(result.buyOptionFee)}.`);
      await refreshDesk();
    } catch (err: unknown) {
      setMarketError(err instanceof Error ? err.message : 'Failed to trigger buy option.');
    } finally {
      setLoanActionId(null);
    }
  };

  const handleUpgradeClubOperation = async (operationKey: ClubOperationKey) => {
    if (!careerId) {
      return;
    }

    setActivityMessage(null);
    setSaleMessage(null);
    setError(null);
    setOperationBusyKey(operationKey);
    try {
      const result = await upgradeClubOperation(careerId, operationKey);
      setActivityMessage(`${result.note} Weekly net impact now ${formatSignedMoney(result.clubOperations.projectedWeeklyNetImpact)}.`);
      await refreshDesk();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade club operations.');
    } finally {
      setOperationBusyKey(null);
    }
  };

  const negotiationDraftLabel = selectedNegotiation
    ? offerKind === 'LOAN'
      ? 'Revise Counter Loan'
      : 'Revise Counter Bid'
    : offerKind === 'LOAN'
      ? 'Submit Loan Offer'
      : 'Submit Permanent Bid';

  return (
    <V2Shell title="Finances">
      {!careerId && (
        <ActiveCareerRequired
          resolving={resolving}
          resolveError={resolveError}
          careers={careers}
          onSelectCareer={setCareerId}
        />
      )}
      {loading && <p>Loading finances and transfer desk...</p>}
      {error && <p style={{ color: '#ffb9b9' }} data-testid="finances-error-message">{error}</p>}
      {marketError && <p style={{ color: '#ffb9b9' }} data-testid="finances-market-error-message">{marketError}</p>}
      {activityMessage && <p style={{ color: '#9be7c3' }} data-testid="finances-activity-message">{activityMessage}</p>}
      {saleMessage && <p style={{ color: '#9be7c3' }} data-testid="finances-sale-message">{saleMessage}</p>}

      {careerId && (
        <>
          <div style={topMetricsGrid}>
            <div style={card}><b>Operating Balance</b><div>{formatMoney(finance?.operatingBalance)}</div></div>
            <div style={card}><b>Transfer Budget</b><div>{formatMoney(finance?.transferBudget)}</div></div>
            <div style={card}><b>Weekly Wage Bill</b><div>{formatMoney(finance?.weeklyWageBill)}</div></div>
            <div style={card}><b>Board Confidence</b><div>{finance?.boardConfidence ?? '-'}</div></div>
            <div style={card}><b>Board Risk</b><div>{finance?.boardRiskLevel || '-'}</div></div>
            <div style={card}>
              <b>Scout Focus</b>
              <div>{finance?.activeWeekPlan?.scoutingPriority ?? '-'}</div>
            </div>
          </div>

          <div style={{ ...card, marginTop: 12 }} data-testid="club-operations-panel">
            <div style={sectionHeaderRow}>
              <div>
                <h3 style={sectionTitle}>Club Operations</h3>
                <p style={sectionHint}>
                  Invest in the club backbone: training, medical support, recruitment coverage, and commercial growth.
                </p>
              </div>
              {clubOperations ? (
                <div style={sectionControlRow}>
                  <span style={miniBadge('#9bd0ff')}>Ops Cost {formatMoney(clubOperations.totalWeeklyOperatingCost)}</span>
                  <span style={miniBadge('#9be7c3')}>Commercial {formatMoney(clubOperations.projectedWeeklyCommercialIncome)}</span>
                  <span style={miniBadge(clubOperations.projectedWeeklyNetImpact >= 0 ? '#9be7c3' : '#ffb9b9')}>
                    Net {formatSignedMoney(clubOperations.projectedWeeklyNetImpact)}
                  </span>
                </div>
              ) : null}
            </div>

            {!clubOperations ? (
              <p style={mutedParagraph}>Club operations data is unavailable.</p>
            ) : (
              <>
                <div style={operationsSummaryGrid}>
                  <div style={summaryTile}>
                    <b>Weekly Operating Cost</b>
                    <div>{formatMoney(clubOperations.totalWeeklyOperatingCost)}</div>
                  </div>
                  <div style={summaryTile}>
                    <b>Commercial Income</b>
                    <div>{formatMoney(clubOperations.projectedWeeklyCommercialIncome)}</div>
                  </div>
                  <div style={summaryTile}>
                    <b>Net Weekly Impact</b>
                    <div style={{ color: clubOperations.projectedWeeklyNetImpact >= 0 ? '#9be7c3' : '#ffb9b9' }}>
                      {formatSignedMoney(clubOperations.projectedWeeklyNetImpact)}
                    </div>
                  </div>
                </div>

                <div style={operationsGrid}>
                  {clubOperations.operations.map((operation) => {
                    const isBusy = operationBusyKey === operation.key;
                    return (
                      <div
                        key={operation.key}
                        style={operationCard}
                        data-testid={`club-operation-card-${operation.key}`}
                      >
                        <div style={negotiationHeader}>
                          <div>
                            <h4 style={{ marginTop: 0, marginBottom: 6 }}>{operation.label}</h4>
                            <div style={subtleMeta}>Level {operation.level} / {operation.maxLevel}</div>
                          </div>
                          <span style={miniBadge('#9bd0ff')}>LVL {operation.level}</span>
                        </div>

                        <div style={counterGrid}>
                          <div style={counterCell}>
                            <b>Weekly Cost</b>
                            <div>{formatMoney(operation.weeklyOperatingCost)}</div>
                          </div>
                          <div style={counterCell}>
                            <b>Upgrade Cost</b>
                            <div>{operation.upgradeCost !== null ? formatMoney(operation.upgradeCost) : 'Maxed'}</div>
                          </div>
                        </div>

                        <p style={cardParagraph}>{operation.currentEffectSummary}</p>
                        {operation.nextLevelEffectSummary ? (
                          <div style={operationsNextEffect}>
                            <b>Next Level</b>
                            <div>{operation.nextLevelEffectSummary}</div>
                          </div>
                        ) : (
                          <div style={operationsNextEffect}>
                            <b>Next Level</b>
                            <div>Maximum operating standard already reached.</div>
                          </div>
                        )}

                        <div style={buttonRow}>
                          <button
                            type="button"
                            style={operation.canUpgrade ? primaryButton : secondaryButton}
                            data-testid={`club-operation-upgrade-${operation.key}`}
                            disabled={operationBusyKey !== null || !operation.canUpgrade || operation.upgradeCost === null}
                            onClick={() => handleUpgradeClubOperation(operation.key)}
                          >
                            {isBusy
                              ? 'Upgrading...'
                              : operation.canUpgrade && operation.upgradeCost !== null
                                ? `Upgrade for ${formatMoney(operation.upgradeCost)}`
                                : 'Max Level Reached'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div style={{ ...card, marginTop: 12 }}>
            <div style={sectionHeaderRow}>
              <div>
                <h3 style={sectionTitle}>Transfer & Scouting Desk</h3>
                <p style={sectionHint}>
                  Build a shortlist, scout properly, then negotiate permanent or loan structures instead of instant-click signings.
                </p>
              </div>
              <div style={sectionControlRow}>
                <label style={controlLabel}>
                  Position
                  <select
                    value={positionFilter}
                    onChange={(event) => setPositionFilter(event.target.value)}
                    style={controlInput}
                  >
                    {knownPositions.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={affordableOnly}
                    onChange={(event) => setAffordableOnly(event.target.checked)}
                  />
                  Affordable only
                </label>
                <button onClick={loadMarket} style={secondaryButton} disabled={marketLoading}>
                  {marketLoading ? 'Refreshing...' : 'Refresh Desk'}
                </button>
              </div>
            </div>

            <div style={deskMetaRow}>
              <span>Window: <b>{transferWindow?.label ?? '-'}</b></span>
              <span>Season phase: <b>{market?.seasonPhase.label ?? '-'}</b></span>
              <span>Scout scope: <b>{market?.scoutingTag ?? '-'}</b></span>
              <span>Available budget: <b>{formatMoney(market?.availableBudget)}</b></span>
              <span>Shortlisted: <b>{market?.shortlistCount ?? 0}</b></span>
              <span>Active negotiations: <b>{market?.activeNegotiations.length ?? 0}</b></span>
            </div>

            {transferWindow && (
              <div
                style={{
                  ...panelCard,
                  marginTop: 12,
                  borderColor: transferWindow.isOpen ? 'rgba(132, 222, 181, 0.35)' : 'rgba(255, 210, 138, 0.45)',
                  background: transferWindow.isOpen ? 'rgba(10, 30, 20, 0.55)' : 'rgba(38, 26, 8, 0.38)'
                }}
              >
                <h4 style={subTitle}>Transfer Window Status</h4>
                <p style={mutedParagraph}>{transferWindow.note}</p>
              </div>
            )}

            <div style={deskLayout}>
              <div style={leftColumn}>
                <div style={panelCard} data-testid="transfer-market-panel">
                  <h4 style={subTitle}>Shortlist</h4>
                  {!market || market.shortlistedTargets.length === 0 ? (
                    <p style={mutedParagraph}>No shortlisted targets yet. Pin players from the live market list.</p>
                  ) : (
                    <div style={stackColumn} data-testid="transfer-shortlist-panel">
                      {market.shortlistedTargets.map((target) => (
                        <button
                          key={`shortlist:${target.playerId}`}
                          type="button"
                          style={shortlistButton(target.playerId === selectedTargetId)}
                          onClick={() => {
                            setSelectedTargetId(target.playerId);
                            setDraftSeedKey('');
                          }}
                        >
                          <span>
                            <strong>{target.fullName}</strong> <span style={mutedInline}>({target.position})</span>
                          </span>
                          <span style={chipRow}>
                            <span style={miniBadge(target.agentPressure === 'HIGH' ? '#ffb9b9' : target.agentPressure === 'MEDIUM' ? '#ffd37a' : '#9be7c3')}>
                              {target.agentPressure}
                            </span>
                            {target.activeNegotiationId ? <span style={miniBadge('#9be7c3')}>NEGOTIATING</span> : null}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ ...panelCard, marginTop: 12 }} data-testid="transfer-target-desk">
                  <h4 style={subTitle}>Active Negotiations</h4>
                  {!market || market.activeNegotiations.length === 0 ? (
                    <p style={mutedParagraph}>No negotiations in flight.</p>
                  ) : (
                    <div style={stackColumn}>
                      {market.activeNegotiations.map((negotiation) => (
                        <div key={negotiation.negotiationId} style={negotiationCard} data-testid="transfer-negotiation-card">
                          <div style={negotiationHeader}>
                            <div>
                              <strong>{negotiation.playerName}</strong>
                              <div style={subtleMeta}>{negotiation.kind} | {negotiation.position} | deadline week {negotiation.deadlineWeekNumber}</div>
                            </div>
                            <span style={miniBadge(negotiation.kind === 'LOAN' ? '#9bd0ff' : '#ffd37a')}>{negotiation.kind}</span>
                          </div>
                          <p style={cardParagraph}>{negotiation.note}</p>
                          {negotiation.counterOffer ? (
                            <div style={counterGrid}>
                              {negotiation.kind === 'PERMANENT' ? (
                                <>
                                  <div style={counterCell}><b>Counter Fee</b><div>{formatMoney(negotiation.counterOffer.transferFee)}</div></div>
                                  <div style={counterCell}><b>Counter Wage</b><div>{formatMoney(negotiation.counterOffer.weeklyWage)}/wk</div></div>
                                </>
                              ) : (
                                <>
                                  <div style={counterCell}><b>Loan Fee</b><div>{formatMoney(negotiation.counterOffer.loanFee)}</div></div>
                                  <div style={counterCell}><b>Wage Share</b><div>{negotiation.counterOffer.wageContributionPct ?? '-'}%</div></div>
                                  <div style={counterCell}><b>Buy Option</b><div>{formatMoney(negotiation.counterOffer.buyOptionFee)}</div></div>
                                </>
                              )}
                            </div>
                          ) : null}
                          <div style={buttonRow}>
                            <button
                              style={primaryButton}
                              disabled={negotiationBusyId === negotiation.negotiationId || transferActionsBlocked}
                              onClick={() => handleAcceptCounter(negotiation)}
                            >
                              {negotiationBusyId === negotiation.negotiationId ? 'Working...' : 'Accept Counter'}
                            </button>
                            <button
                              style={secondaryButton}
                              onClick={() => {
                                setSelectedTargetId(negotiation.playerId);
                                setDraftSeedKey('');
                              }}
                            >
                              Open in Desk
                            </button>
                            <button
                              style={dangerButton}
                              disabled={negotiationBusyId === negotiation.negotiationId}
                              onClick={() => handleWithdrawNegotiation(negotiation)}
                            >
                              Withdraw
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ ...panelCard, marginTop: 12 }}>
                  <h4 style={subTitle}>Incoming Loans</h4>
                  {!market || market.incomingLoans.length === 0 ? (
                    <p style={mutedParagraph}>No active incoming loans.</p>
                  ) : (
                    <div style={stackColumn}>
                      {market.incomingLoans.map((loan) => (
                        <div key={`loan:${loan.loanId}`} style={loanCard}>
                          <div style={negotiationHeader}>
                            <div>
                              <strong>{loan.playerName}</strong>
                              <div style={subtleMeta}>{loan.position} | from {loan.fromClubName}</div>
                            </div>
                            <span style={miniBadge('#9bd0ff')}>LOAN</span>
                          </div>
                          <div style={counterGrid}>
                            <div style={counterCell}><b>Ends</b><div>{loan.endDate ? formatDate(loan.endDate) : '-'}</div></div>
                            <div style={counterCell}><b>Weeks Left</b><div>{loan.weeksRemaining}</div></div>
                            <div style={counterCell}><b>Wage Share</b><div>{loan.wageContributionPct}%</div></div>
                            <div style={counterCell}><b>Buy Option</b><div>{formatMoney(loan.buyOptionFee)}</div></div>
                          </div>
                          <div style={buttonRow}>
                            <button
                              style={primaryButton}
                              disabled={!loan.canTriggerBuyOption || loanActionId === loan.loanId || transferActionsBlocked}
                              onClick={() => handleTriggerBuyOption(loan)}
                            >
                              {loanActionId === loan.loanId ? 'Processing...' : 'Trigger Buy Option'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={rightColumn}>
                <div style={panelCard}>
                  <h4 style={subTitle}>Live Market</h4>
                  {marketLoading && <p style={mutedParagraph}>Loading transfer shortlist...</p>}
                  {!marketLoading && (!market || market.targets.length === 0) && (
                    <p style={mutedParagraph}>No transfer targets found for the current filter and scouting scope.</p>
                  )}
                  {!marketLoading && market && market.targets.length > 0 && (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={table}>
                        <thead>
                          <tr>
                            <th style={tableHead}>Player</th>
                            <th style={tableHead}>Pos</th>
                            <th style={tableHead}>Age</th>
                            <th style={tableHead}>CA</th>
                            <th style={tableHead}>PA</th>
                            <th style={tableHead}>Club</th>
                            <th style={tableHead}>Fee</th>
                            <th style={tableHead}>Fit</th>
                            <th style={tableHead}>Pressure</th>
                            <th style={tableHead}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {market.targets.map((target) => (
                            <tr
                              key={target.playerId}
                              data-testid="transfer-target-row"
                              style={marketRow(target.playerId === selectedTargetId)}
                            >
                              <td style={tableCell}>{target.fullName}</td>
                              <td style={tableCell}>{target.position}</td>
                              <td style={tableCell}>{formatAge(target.age)}</td>
                              <td style={tableCell}>{target.currentAbility ?? '-'}</td>
                              <td style={tableCell}>{target.potentialAbility ?? '-'}</td>
                              <td style={tableCell}>{target.sellerClubName}</td>
                              <td style={tableCell}>{formatMoney(target.askingFee)}</td>
                              <td style={tableCell}>{target.fitScore}</td>
                              <td style={tableCell}>{target.agentPressure}</td>
                              <td style={tableCell}>
                                <div style={rowButtonStack}>
                                  <button
                                    type="button"
                                    style={secondaryButton}
                                    onClick={() => {
                                      setSelectedTargetId(target.playerId);
                                      setDraftSeedKey('');
                                    }}
                                  >
                                    Open Desk
                                  </button>
                                  <button
                                    type="button"
                                    style={secondaryButton}
                                    data-testid="transfer-shortlist-button"
                                    disabled={shortlistBusyPlayerId === target.playerId}
                                    onClick={() => handleToggleShortlist(target)}
                                  >
                                    {shortlistBusyPlayerId === target.playerId
                                      ? 'Saving...'
                                      : target.isShortlisted
                                        ? 'Remove Shortlist'
                                        : 'Shortlist'}
                                  </button>
                                  <button
                                    type="button"
                                    style={secondaryButton}
                                    data-testid="transfer-scout-button"
                                    disabled={scoutBusyPlayerId === target.playerId}
                                    onClick={() => handleScout(target)}
                                  >
                                    {scoutBusyPlayerId === target.playerId
                                      ? 'Scouting...'
                                      : target.scoutingReport
                                        ? 'Refresh Report'
                                        : 'Scout'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div style={{ ...panelCard, marginTop: 12 }}>
                  <h4 style={subTitle}>Target Desk</h4>
                  {!selectedTarget ? (
                    <p style={mutedParagraph}>Select a target from the market or shortlist to open a live deal desk.</p>
                  ) : (
                    <div>
                      <div style={targetHeader}>
                        <div>
                          <h3 style={{ margin: 0 }}>{selectedTarget.fullName}</h3>
                          <p style={sectionHint}>{selectedTarget.position} | {formatAge(selectedTarget.age)} | {selectedTarget.sellerClubName}</p>
                        </div>
                        <div style={chipRow}>
                          <span style={miniBadge(selectedTarget.agentPressure === 'HIGH' ? '#ffb9b9' : selectedTarget.agentPressure === 'MEDIUM' ? '#ffd37a' : '#9be7c3')}>
                            Agent {selectedTarget.agentPressure}
                          </span>
                          <span style={miniBadge(selectedTarget.sellerStance === 'AGGRESSIVE' ? '#ffb9b9' : selectedTarget.sellerStance === 'RELUCTANT' ? '#ffd37a' : '#9be7c3')}>
                            Seller {selectedTarget.sellerStance}
                          </span>
                        </div>
                      </div>

                      <div style={counterGrid}>
                        <div style={counterCell}><b>Asking Fee</b><div>{formatMoney(selectedTarget.askingFee)}</div></div>
                        <div style={counterCell}><b>Expected Wage</b><div>{formatMoney(selectedTarget.weeklyWage)}/wk</div></div>
                        <div style={counterCell}><b>Fit Score</b><div>{selectedTarget.fitScore}</div></div>
                        <div style={counterCell}><b>Budget Gap</b><div>{selectedTarget.isAffordable ? 'Affordable' : formatMoney(selectedTarget.budgetGap)}</div></div>
                      </div>

                      {selectedTarget.scoutingReport ? (
                        <div style={reportCard}>
                          <div style={negotiationHeader}>
                            <div>
                              <strong>Scouting Report</strong>
                              <div style={subtleMeta}>Week {selectedTarget.scoutingReport.scoutedAtWeekNumber} | Confidence {selectedTarget.scoutingReport.confidence}%</div>
                            </div>
                            <span style={miniBadge('#9be7c3')}>{selectedTarget.scoutingReport.recommendation}</span>
                          </div>
                          <p style={cardParagraph}>{selectedTarget.scoutingReport.summary}</p>
                          <div style={reportTwoCol}>
                            <div>
                              <b style={listTitle}>Strengths</b>
                              <ul style={bulletList}>
                                {selectedTarget.scoutingReport.strengths.map((item) => <li key={item}>{item}</li>)}
                              </ul>
                            </div>
                            <div>
                              <b style={listTitle}>Risks</b>
                              <ul style={bulletList}>
                                {selectedTarget.scoutingReport.risks.map((item) => <li key={item}>{item}</li>)}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={emptyStateCard}>
                          <p style={mutedParagraph}>No scouting report yet. Request one before committing a serious bid.</p>
                        </div>
                      )}

                      {selectedNegotiation ? (
                        <div style={activeCounterBanner}>
                          <strong>Live Counter:</strong> {selectedNegotiation.note}
                        </div>
                      ) : null}

                      <div style={offerFormHeader}>
                        <label style={controlLabel}>
                          Offer Type
                          <select
                            value={offerKind}
                            onChange={(event) => {
                              setOfferKind(event.target.value as OfferKind);
                              setDraftSeedKey('');
                            }}
                            style={controlInput}
                            disabled={Boolean(selectedNegotiation)}
                          >
                            <option value="PERMANENT">Permanent Transfer</option>
                            <option value="LOAN">Loan Deal</option>
                          </select>
                        </label>
                      </div>

                      {offerKind === 'PERMANENT' ? (
                        <div style={offerGrid}>
                          <label style={controlLabel}>
                            Bid Fee
                            <input
                              type="number"
                              value={offerTransferFee}
                              onChange={(event) => setOfferTransferFee(Number(event.target.value || 0))}
                              style={controlInput}
                            />
                          </label>
                          <label style={controlLabel}>
                            Weekly Wage
                            <input
                              type="number"
                              value={offerWeeklyWage}
                              onChange={(event) => setOfferWeeklyWage(Number(event.target.value || 0))}
                              style={controlInput}
                            />
                          </label>
                        </div>
                      ) : (
                        <div style={offerGrid}>
                          <label style={controlLabel}>
                            Loan Fee
                            <input
                              type="number"
                              value={offerLoanFee}
                              onChange={(event) => setOfferLoanFee(Number(event.target.value || 0))}
                              style={controlInput}
                            />
                          </label>
                          <label style={controlLabel}>
                            Wage Contribution %
                            <input
                              type="number"
                              value={offerWageContributionPct}
                              onChange={(event) => setOfferWageContributionPct(Number(event.target.value || 0))}
                              style={controlInput}
                            />
                          </label>
                          <label style={controlLabel}>
                            Buy Option Fee
                            <input
                              type="number"
                              value={offerBuyOptionFee}
                              onChange={(event) => setOfferBuyOptionFee(Number(event.target.value || 0))}
                              style={controlInput}
                            />
                          </label>
                          <label style={controlLabel}>
                            Loan Length (weeks)
                            <input
                              type="number"
                              value={offerLoanDurationWeeks}
                              onChange={(event) => setOfferLoanDurationWeeks(Number(event.target.value || 0))}
                              style={controlInput}
                            />
                          </label>
                        </div>
                      )}

                      <div style={buttonRow}>
                        <button
                          type="button"
                          style={primaryButton}
                          data-testid="transfer-offer-submit-button"
                          disabled={Boolean(negotiationBusyId) || transferActionsBlocked}
                          onClick={handleSubmitOffer}
                        >
                          {negotiationBusyId ? 'Working...' : negotiationDraftLabel}
                        </button>
                        <button
                          type="button"
                          style={secondaryButton}
                          onClick={() => selectedTarget && handleScout(selectedTarget)}
                          disabled={selectedTarget ? scoutBusyPlayerId === selectedTarget.playerId : true}
                        >
                          {selectedTarget && scoutBusyPlayerId === selectedTarget.playerId ? 'Scouting...' : 'Refresh Report'}
                        </button>
                        <button
                          type="button"
                          style={secondaryButton}
                          onClick={() => selectedTarget && handleToggleShortlist(selectedTarget)}
                          disabled={selectedTarget ? shortlistBusyPlayerId === selectedTarget.playerId : true}
                        >
                          {selectedTarget?.isShortlisted ? 'Remove Shortlist' : 'Add Shortlist'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ ...panelCard, marginTop: 12 }}>
                  <h4 style={subTitle}>Outgoing Transfer List</h4>
                  <p style={sectionHint}>Move fringe players to fund incoming deals without breaking squad depth.</p>
                  {!marketLoading && (!market || market.outgoingTargets.length === 0) && (
                    <p style={mutedParagraph}>No outgoing transfer candidates available.</p>
                  )}
                  {!marketLoading && market && market.outgoingTargets.length > 0 && (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={table}>
                        <thead>
                          <tr>
                            <th style={tableHead}>Player</th>
                            <th style={tableHead}>Pos</th>
                            <th style={tableHead}>Age</th>
                            <th style={tableHead}>CA</th>
                            <th style={tableHead}>PA</th>
                            <th style={tableHead}>Value</th>
                            <th style={tableHead}>Wage/Wk</th>
                            <th style={tableHead}>Est. Fee</th>
                            <th style={tableHead}>Net Swing</th>
                            <th style={tableHead}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {market.outgoingTargets.map((target) => (
                            <tr key={`sell:${target.playerId}`}>
                              <td style={tableCell}>
                                {target.fullName}
                                {target.recommended ? <span style={{ marginLeft: 6, color: '#9be7c3' }}>[Recommended]</span> : null}
                              </td>
                              <td style={tableCell}>{target.position}</td>
                              <td style={tableCell}>{formatAge(target.age)}</td>
                              <td style={tableCell}>{target.currentAbility ?? '-'}</td>
                              <td style={tableCell}>{target.potentialAbility ?? '-'}</td>
                              <td style={tableCell}>{formatMoney(target.marketValue)}</td>
                              <td style={tableCell}>{formatMoney(target.weeklyWage)}</td>
                              <td style={tableCell}>{formatMoney(target.estimatedFee)}</td>
                              <td style={tableCell}>{formatMoney(target.netBudgetSwing)}</td>
                              <td style={tableCell}>
                                <button
                                  onClick={() => handleSellTransfer(target.playerId)}
                                  style={secondaryButton}
                                  disabled={sellingPlayerId === target.playerId || transferActionsBlocked}
                                >
                                  {sellingPlayerId === target.playerId ? 'Selling...' : 'Sell'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </V2Shell>
  );
};

function describeNegotiationResult(result: TransferNegotiationResult): string {
  if (result.outcome === 'COUNTERED' && result.negotiation?.counterOffer) {
    if (result.kind === 'LOAN') {
      return `${result.note} Counter loan fee ${formatMoney(result.negotiation.counterOffer.loanFee)} with ${result.negotiation.counterOffer.wageContributionPct ?? 0}% wage coverage.`;
    }
    return `${result.note} Counter fee ${formatMoney(result.negotiation.counterOffer.transferFee)} and wage ${formatMoney(result.negotiation.counterOffer.weeklyWage)}/wk.`;
  }
  if (result.outcome === 'ACCEPTED' && result.permanentDeal) {
    return `Signed ${result.permanentDeal.playerName} from ${result.permanentDeal.fromClubName} for ${formatMoney(result.permanentDeal.transferFee)}.`;
  }
  if (result.outcome === 'ACCEPTED' && result.loanDeal) {
    return `Loaned ${result.loanDeal.playerName} from ${result.loanDeal.fromClubName} with ${result.loanDeal.wageContributionPct}% wage contribution.`;
  }
  return result.note;
}

function formatMoney(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
  const prefix = value >= 0 ? '' : '-';
  return `${prefix}EUR ${Math.abs(Math.round(value)).toLocaleString()}`;
}

function formatSignedMoney(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '-';
  const prefix = value >= 0 ? '+' : '-';
  return `${prefix}EUR ${Math.abs(Math.round(value)).toLocaleString()}`;
}

function formatAge(value?: number | null): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : '-';
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
}

const topMetricsGrid: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
};

const deskLayout: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'minmax(280px, 360px) minmax(0, 1fr)',
  alignItems: 'start',
  marginTop: 14
};

const leftColumn: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column'
};

const rightColumn: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column'
};

const card: React.CSSProperties = {
  background: 'rgba(8, 20, 14, 0.55)',
  border: '1px solid rgba(132, 222, 181, 0.35)',
  borderRadius: 12,
  padding: 14
};

const panelCard: React.CSSProperties = {
  ...card,
  background: 'rgba(10, 26, 18, 0.72)'
};

const sectionHeaderRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'flex-start',
  flexWrap: 'wrap'
};

const sectionControlRow: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  alignItems: 'center',
  flexWrap: 'wrap'
};

const sectionTitle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 6
};

const subTitle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 8
};

const sectionHint: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 0,
  color: '#bde8d2',
  fontSize: 13,
  lineHeight: 1.4
};

const deskMetaRow: React.CSSProperties = {
  display: 'flex',
  gap: 14,
  flexWrap: 'wrap',
  color: '#bde8d2',
  fontSize: 13,
  marginTop: 10
};

const operationsSummaryGrid: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  marginTop: 14
};

const operationsGrid: React.CSSProperties = {
  display: 'grid',
  gap: 14,
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  marginTop: 14
};

const summaryTile: React.CSSProperties = {
  ...panelCard,
  padding: 12
};

const operationCard: React.CSSProperties = {
  ...panelCard,
  padding: 14
};

const operationsNextEffect: React.CSSProperties = {
  background: 'rgba(16, 40, 30, 0.72)',
  border: '1px solid rgba(132, 222, 181, 0.16)',
  borderRadius: 10,
  padding: 10,
  color: '#d6f5e8',
  fontSize: 13,
  lineHeight: 1.4
};

const controlLabel: React.CSSProperties = {
  display: 'inline-flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 13,
  color: '#d6f5e8'
};

const checkboxLabel: React.CSSProperties = {
  display: 'inline-flex',
  gap: 6,
  alignItems: 'center',
  fontSize: 13,
  color: '#d6f5e8'
};

const controlInput: React.CSSProperties = {
  minWidth: 120,
  padding: '8px 10px',
  borderRadius: 10,
  border: '1px solid rgba(132, 222, 181, 0.24)',
  background: 'rgba(6, 16, 12, 0.76)',
  color: '#f5fff9'
};

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  minWidth: 920
};

const tableHead: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 8px',
  borderBottom: '1px solid rgba(132, 222, 181, 0.18)',
  color: '#bde8d2',
  fontSize: 12,
  letterSpacing: '0.06em',
  textTransform: 'uppercase'
};

const tableCell: React.CSSProperties = {
  padding: '10px 8px',
  borderBottom: '1px solid rgba(132, 222, 181, 0.12)',
  color: '#f3fff8',
  verticalAlign: 'top'
};

const buttonBase: React.CSSProperties = {
  borderRadius: 10,
  border: '1px solid rgba(132, 222, 181, 0.3)',
  padding: '10px 12px',
  cursor: 'pointer',
  color: '#f5fff9',
  background: 'rgba(19, 57, 43, 0.86)',
  fontWeight: 700
};

const primaryButton: React.CSSProperties = {
  ...buttonBase,
  background: 'linear-gradient(135deg, rgba(101, 233, 181, 0.92), rgba(48, 177, 188, 0.88))',
  color: '#032016',
  borderColor: 'rgba(101, 233, 181, 0.42)'
};

const secondaryButton: React.CSSProperties = {
  ...buttonBase,
  background: 'rgba(18, 48, 38, 0.86)'
};

const dangerButton: React.CSSProperties = {
  ...buttonBase,
  background: 'rgba(76, 28, 28, 0.88)',
  borderColor: 'rgba(255, 140, 140, 0.35)'
};

const stackColumn: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10
};

const chipRow: React.CSSProperties = {
  display: 'inline-flex',
  gap: 6,
  alignItems: 'center',
  flexWrap: 'wrap'
};

const subtleMeta: React.CSSProperties = {
  fontSize: 12,
  color: '#bde8d2',
  marginTop: 4
};

const mutedParagraph: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 0,
  color: '#bde8d2',
  fontSize: 13,
  lineHeight: 1.5
};

const cardParagraph: React.CSSProperties = {
  color: '#e8fff4',
  marginTop: 8,
  marginBottom: 10,
  lineHeight: 1.45
};

const targetHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'flex-start',
  flexWrap: 'wrap'
};

const offerFormHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
  alignItems: 'center',
  flexWrap: 'wrap',
  marginTop: 14
};

const offerGrid: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  marginTop: 12
};

const reportCard: React.CSSProperties = {
  marginTop: 14,
  padding: 12,
  borderRadius: 10,
  border: '1px solid rgba(132, 222, 181, 0.18)',
  background: 'rgba(5, 17, 12, 0.72)'
};

const reportTwoCol: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
};

const listTitle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  color: '#9be7c3'
};

const bulletList: React.CSSProperties = {
  margin: 0,
  paddingLeft: 18,
  color: '#e8fff4'
};

const counterGrid: React.CSSProperties = {
  display: 'grid',
  gap: 10,
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  marginTop: 10
};

const counterCell: React.CSSProperties = {
  borderRadius: 10,
  border: '1px solid rgba(132, 222, 181, 0.12)',
  padding: '10px 12px',
  background: 'rgba(5, 17, 12, 0.65)',
  color: '#f3fff8'
};

const negotiationCard: React.CSSProperties = {
  borderRadius: 12,
  border: '1px solid rgba(132, 222, 181, 0.18)',
  padding: 12,
  background: 'rgba(5, 17, 12, 0.72)'
};

const loanCard: React.CSSProperties = {
  ...negotiationCard,
  background: 'rgba(7, 17, 28, 0.64)'
};

const negotiationHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
  alignItems: 'flex-start'
};

const activeCounterBanner: React.CSSProperties = {
  marginTop: 14,
  padding: '10px 12px',
  borderRadius: 10,
  background: 'rgba(82, 63, 18, 0.38)',
  border: '1px solid rgba(255, 211, 122, 0.32)',
  color: '#fff0c1'
};

const emptyStateCard: React.CSSProperties = {
  marginTop: 14,
  padding: 12,
  borderRadius: 10,
  border: '1px dashed rgba(132, 222, 181, 0.18)',
  background: 'rgba(5, 17, 12, 0.42)'
};

const buttonRow: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  marginTop: 12
};

const rowButtonStack: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  minWidth: 124
};

const shortlistButton = (selected: boolean): React.CSSProperties => ({
  ...secondaryButton,
  textAlign: 'left',
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
  alignItems: 'center',
  background: selected ? 'rgba(32, 80, 61, 0.9)' : 'rgba(18, 48, 38, 0.86)'
});

const marketRow = (selected: boolean): React.CSSProperties => ({
  background: selected ? 'rgba(28, 74, 58, 0.3)' : 'transparent'
});

function miniBadge(color: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    padding: '4px 8px',
    fontSize: 11,
    fontWeight: 700,
    color,
    border: `1px solid ${color}55`,
    background: `${color}14`
  };
}

const mutedInline: React.CSSProperties = {
  color: '#bde8d2'
};

export default FinancesPage;
