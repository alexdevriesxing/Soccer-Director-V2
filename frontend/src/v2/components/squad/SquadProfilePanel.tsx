import React from 'react';
import { Link } from 'react-router-dom';
import {
  ActivePlayerMedicalPlanCode,
  DEVELOPMENT_PLAN_FOCUSES,
  DEVELOPMENT_PLAN_TARGETS,
  DevelopmentPlanFocus,
  DevelopmentPlanTarget,
  PLAYER_MEDICAL_PLAN_CODES,
  PlayerStatusDirectiveAction,
  RETRAINABLE_POSITIONS,
  RetrainablePosition,
  SQUAD_ROLE_ASSIGNMENTS,
  SquadRoleAssignment
} from '../../contracts';
import { SquadPlayer, SquadPlayerProfile } from '../../types';
import {
  formatAssignedRole,
  formatAvailability,
  formatContractEnd,
  formatContractTime,
  formatDevelopmentFocus,
  formatDevelopmentTarget,
  formatExpectation,
  formatHistoryTime,
  formatMedicalAvailabilityRecommendation,
  formatMedicalHistoryAction,
  formatMedicalPlanLabel,
  formatMedicalRehabStatus,
  formatMoney,
  formatPendingStage,
  formatPromiseKind,
  formatPromiseSourceAction,
  formatPromiseTimelineAction,
  formatRetrainingHistoryAction,
  formatRetrainingPosition,
  formatRoleTier,
  formatSigned,
  medicalRiskBadgeClass,
  registrationBadgeClass,
  pendingStageBadgeClass,
  playingTimePromiseBadgeClass,
  retrainingReadinessBadgeClass,
  riskBadgeClass,
  roleBadgeClass
} from '../../utils/squadFormatting';

interface SquadProfilePanelProps {
  selectedRow: SquadPlayer | null;
  selectedProfile: SquadPlayerProfile | null;
  profileLoading: boolean;
  profileError: string | null;
  busyPlayerId: number | null;
  busyAction: 'RENEW' | 'RELEASE' | 'ROLE' | 'STATUS' | 'DEV_PLAN' | 'MEDICAL' | 'REGISTRATION' | 'RETRAINING' | null;
  devPlanFocusDraft: DevelopmentPlanFocus;
  devPlanTargetDraft: DevelopmentPlanTarget;
  medicalPlanDraft: ActivePlayerMedicalPlanCode;
  retrainingTargetDraft: RetrainablePosition;
  onDevelopmentFocusChange: (focus: DevelopmentPlanFocus) => void;
  onDevelopmentTargetChange: (target: DevelopmentPlanTarget) => void;
  onMedicalPlanChange: (planCode: ActivePlayerMedicalPlanCode) => void;
  onRetrainingTargetChange: (target: RetrainablePosition) => void;
  onRoleAssignment: (roleAssignment: SquadRoleAssignment, event?: React.MouseEvent<HTMLButtonElement>) => void;
  onSaveDevelopmentPlan: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  onSaveMedicalPlan: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  onClearMedicalPlan: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  onPlayerStatusAction: (action: PlayerStatusDirectiveAction, event?: React.MouseEvent<HTMLButtonElement>) => void;
  onRegistrationAction: (action: 'REGISTER' | 'UNREGISTER', event?: React.MouseEvent<HTMLButtonElement>) => void;
  onSaveRetrainingPlan: (event?: React.MouseEvent<HTMLButtonElement>) => void;
}

const SquadProfilePanel: React.FC<SquadProfilePanelProps> = ({
  selectedRow,
  selectedProfile,
  profileLoading,
  profileError,
  busyPlayerId,
  busyAction,
  devPlanFocusDraft,
  devPlanTargetDraft,
  medicalPlanDraft,
  retrainingTargetDraft,
  onDevelopmentFocusChange,
  onDevelopmentTargetChange,
  onMedicalPlanChange,
  onRetrainingTargetChange,
  onRoleAssignment,
  onSaveDevelopmentPlan,
  onSaveMedicalPlan,
  onClearMedicalPlan,
  onPlayerStatusAction,
  onRegistrationAction,
  onSaveRetrainingPlan
}) => (
  <aside className="v2-panel v2-squad-detail-panel">
    <div className="v2-squad-detail-panel__sticky">
      <p className="v2-kicker" style={{ margin: 0 }}>Player Profile</p>

      {!selectedRow && (
        <div className="v2-panel v2-panel--soft">
          <p className="v2-panel__subtitle">Select a player from the squad table to inspect their details.</p>
        </div>
      )}

      {selectedRow && (
        <>
          <header className="v2-squad-profile-header">
            <div>
              <h3 className="v2-panel__title" style={{ marginBottom: 3 }}>{selectedRow.fullName}</h3>
              <p className="v2-panel__subtitle">
                {selectedProfile?.effectivePosition && selectedProfile.effectivePosition !== selectedRow.position
                  ? `${selectedRow.position} -> ${selectedProfile.effectivePosition}`
                  : selectedRow.position}
                {' • '}
                {formatAvailability(selectedRow)}
                {selectedRow.assignedRole ? ` • ${formatAssignedRole(selectedRow.assignedRole)} role` : ''}
              </p>
            </div>
            <div className="v2-chip-row">
              <span className={`v2-badge ${riskBadgeClass(selectedProfile?.contract.risk || selectedRow.contractRisk || 'STABLE')}`}>
                {selectedProfile?.contract.risk || selectedRow.contractRisk || 'STABLE'}
              </span>
              {selectedProfile && (
                <span className={`v2-badge ${roleBadgeClass(selectedProfile.squadContext.roleTier)}`}>
                  {formatRoleTier(selectedProfile.squadContext.roleTier)}
                </span>
              )}
            </div>
          </header>

          {profileLoading && (
            <div className="v2-stack">
              <div className="v2-skeleton" style={{ height: 86, borderRadius: 12 }} />
              <div className="v2-skeleton" style={{ height: 148, borderRadius: 12 }} />
              <div className="v2-skeleton" style={{ height: 118, borderRadius: 12 }} />
            </div>
          )}

          {!profileLoading && profileError && (
            <div className="v2-panel v2-panel--danger">
              <p className="v2-panel__subtitle" style={{ color: '#ffb9b9' }}>{profileError}</p>
            </div>
          )}

          {!profileLoading && selectedProfile && (
            <div className="v2-stack">
              <div className="v2-grid v2-grid--stats">
                <StatCard label="Ability" value={`${selectedProfile.currentAbility ?? '-'} / ${selectedProfile.potentialAbility ?? '-'}`} />
                <StatCard label="Wage" value={formatMoney(selectedProfile.weeklyWage)} />
                <StatCard label="Market Value" value={formatMoney(selectedProfile.marketValue)} />
                <StatCard label="Contract Time" value={formatContractTime(selectedProfile.contract.daysRemaining, selectedProfile.contract.yearsRemaining)} />
              </div>

              <div className={`v2-panel ${selectedProfile.registration.isRegistered ? 'v2-panel--soft' : 'v2-panel--warm'}`}>
                <div className="v2-squad-detail-section__header">
                  <h4 className="v2-panel__title" style={{ margin: 0 }}>Registration & Eligibility</h4>
                  <span className={`v2-badge ${registrationBadgeClass(selectedProfile.registration.eligibilityCode)}`}>
                    {selectedProfile.registration.eligibilityCode.replace('_', ' ')}
                  </span>
                </div>
                <div className="v2-grid v2-grid--two" style={{ marginTop: 8 }}>
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Active List</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {selectedProfile.registration.registeredCount} / {selectedProfile.registration.registrationLimit}
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      {selectedProfile.registration.competitionLabel}
                      {selectedProfile.registration.overageLimit !== null
                        ? ` • Overage ${selectedProfile.registration.overageCount}/${selectedProfile.registration.overageLimit}`
                        : ''}
                    </p>
                  </div>
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Eligibility Note</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {selectedProfile.registration.isRegistered ? 'Registered' : 'Unregistered'}
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      {selectedProfile.registration.eligibilityNote}
                    </p>
                  </div>
                </div>
                <div className="v2-grid v2-grid--two" style={{ marginTop: 8 }}>
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Registration Window</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {selectedProfile.registration.window.label}
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      {selectedProfile.registration.window.note}
                    </p>
                  </div>
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Rules Focus</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {selectedProfile.registration.minimumRegistered} minimum registered players
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      {selectedProfile.registration.overageLimit !== null
                        ? `Overage slots in use: ${selectedProfile.registration.overageCount}/${selectedProfile.registration.overageLimit}.`
                        : 'No overage cap applies in this active competition.'}
                    </p>
                  </div>
                </div>
                <div className="v2-chip-row" style={{ marginTop: 12 }}>
                  {selectedProfile.registration.rulesNotes.map((note) => (
                    <span key={note} className="v2-chip">{note}</span>
                  ))}
                </div>
                <div className="v2-inline-actions" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className={`v2-button ${selectedProfile.registration.isRegistered ? 'v2-button--primary' : 'v2-button--secondary'}`}
                    disabled={
                      (busyPlayerId === selectedProfile.playerId && busyAction === 'REGISTRATION')
                      || !selectedProfile.registration.window.isOpen
                    }
                    onClick={(event) => onRegistrationAction('REGISTER', event)}
                  >
                    {busyPlayerId === selectedProfile.playerId && busyAction === 'REGISTRATION' && selectedProfile.registration.isRegistered
                      ? 'Saving...'
                      : 'Register Player'}
                  </button>
                  <button
                    type="button"
                    className={`v2-button ${!selectedProfile.registration.isRegistered ? 'v2-button--primary' : 'v2-button--secondary'}`}
                    disabled={
                      (busyPlayerId === selectedProfile.playerId && busyAction === 'REGISTRATION')
                      || !selectedProfile.registration.window.isOpen
                    }
                    onClick={(event) => onRegistrationAction('UNREGISTER', event)}
                  >
                    {busyPlayerId === selectedProfile.playerId && busyAction === 'REGISTRATION' && !selectedProfile.registration.isRegistered
                      ? 'Saving...'
                      : 'Unregister Player'}
                  </button>
                </div>
              </div>

              <div className="v2-panel v2-panel--soft">
                <div className="v2-squad-detail-section__header">
                  <h4 className="v2-panel__title" style={{ margin: 0 }}>Squad Role & Status</h4>
                  <span className={`v2-badge ${roleBadgeClass(selectedProfile.squadContext.roleTier)}`}>
                    {formatExpectation(selectedProfile.squadContext.playingTimeExpectation)}
                  </span>
                </div>
                <div className="v2-grid v2-grid--two">
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Squad Context</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      Ability rank {selectedProfile.squadContext.squadAbilityRank}/{selectedProfile.squadContext.squadSize}
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      Position depth: {selectedProfile.squadContext.depthRankAtPosition ?? '-'} of {selectedProfile.squadContext.positionCount || '-'}
                    </p>
                  </div>
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Availability</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {selectedProfile.availability.status}
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      {selectedProfile.availability.note}
                    </p>
                    {selectedProfile.availability.suspension && (
                      <div style={{ marginTop: 10, display: 'grid', gap: 4 }}>
                        <span className="v2-badge v2-badge--danger">
                          {selectedProfile.availability.suspension.matchesRemaining} match ban
                        </span>
                        <span className="v2-panel__subtitle">
                          {selectedProfile.availability.suspension.reason}
                        </span>
                      </div>
                    )}
                    {selectedProfile.availability.managerDirective && (
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span className="v2-badge v2-badge--warning">
                          {selectedProfile.availability.managerDirective.label}
                        </span>
                        <span className="v2-kicker">
                          Week {selectedProfile.availability.managerDirective.setWeekNumber}
                          {' -> '}
                          Week {selectedProfile.availability.managerDirective.expiresWeekNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="v2-divider" />
                <div className="v2-grid v2-grid--two">
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Manager Availability Directive</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {selectedProfile.availability.managerDirective?.label || 'No active directive'}
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      {selectedProfile.availability.managerDirective?.note
                        || 'Apply a short-term rest/workload/disciplinary directive with immediate morale/fitness effects.'}
                    </p>
                  </div>
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Quick Actions</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      Rest / Limit Minutes / Disciplinary
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      Directives last through the current week and surface in the availability panel.
                    </p>
                  </div>
                </div>
                <div className="v2-inline-actions" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className={`v2-button ${selectedProfile.availability.managerDirective?.directiveCode === 'REST_RECOVERY' ? 'v2-button--primary' : 'v2-button--secondary'}`}
                    disabled={busyPlayerId === selectedProfile.playerId && busyAction === 'STATUS'}
                    onClick={(event) => onPlayerStatusAction('REST_RECOVERY', event)}
                  >
                    {busyPlayerId === selectedProfile.playerId && busyAction === 'STATUS' && selectedProfile.availability.managerDirective?.directiveCode === 'REST_RECOVERY'
                      ? 'Applying...'
                      : 'Rest & Recovery'}
                  </button>
                  <button
                    type="button"
                    className={`v2-button ${selectedProfile.availability.managerDirective?.directiveCode === 'LIMITED_MINUTES' ? 'v2-button--primary' : 'v2-button--secondary'}`}
                    disabled={busyPlayerId === selectedProfile.playerId && busyAction === 'STATUS'}
                    onClick={(event) => onPlayerStatusAction('LIMIT_MINUTES', event)}
                  >
                    {busyPlayerId === selectedProfile.playerId && busyAction === 'STATUS' && selectedProfile.availability.managerDirective?.directiveCode === 'LIMITED_MINUTES'
                      ? 'Applying...'
                      : 'Limit Minutes'}
                  </button>
                  <button
                    type="button"
                    className={`v2-button ${selectedProfile.availability.managerDirective?.directiveCode === 'DISCIPLINARY_NOTE' ? 'v2-button--primary' : 'v2-button--secondary'}`}
                    disabled={busyPlayerId === selectedProfile.playerId && busyAction === 'STATUS'}
                    onClick={(event) => onPlayerStatusAction('DISCIPLINARY_NOTE', event)}
                  >
                    {busyPlayerId === selectedProfile.playerId && busyAction === 'STATUS' && selectedProfile.availability.managerDirective?.directiveCode === 'DISCIPLINARY_NOTE'
                      ? 'Applying...'
                      : 'Disciplinary Note'}
                  </button>
                  <button
                    type="button"
                    className="v2-button v2-button--ghost"
                    disabled={(busyPlayerId === selectedProfile.playerId && busyAction === 'STATUS') || !selectedProfile.availability.managerDirective}
                    onClick={(event) => onPlayerStatusAction('CLEAR_DIRECTIVE', event)}
                  >
                    Clear Directive
                  </button>
                </div>
                <div className="v2-divider" />
                <div className="v2-grid v2-grid--two">
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Role Assignment</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {formatAssignedRole(selectedProfile.squadContext.assignedRole ?? selectedProfile.squadContext.recommendedAssignedRole)}
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      Recommended: {formatAssignedRole(selectedProfile.squadContext.recommendedAssignedRole)}
                    </p>
                  </div>
                  <div className={`v2-stat-card ${selectedProfile.squadContext.roleMismatch ? 'v2-squad-pressure-card' : ''}`}>
                    <p className="v2-stat-card__label">Hierarchy Pressure</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {selectedProfile.squadContext.roleMismatch ? 'Mismatch' : 'Aligned'}
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      {selectedProfile.squadContext.rolePressureNote}
                    </p>
                  </div>
                </div>
                <div className="v2-inline-actions" style={{ marginTop: 12 }}>
                  {SQUAD_ROLE_ASSIGNMENTS.map((role) => {
                    const isAssigned = (selectedProfile.squadContext.assignedRole ?? selectedProfile.squadContext.recommendedAssignedRole) === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        className={`v2-button ${isAssigned ? 'v2-button--primary' : 'v2-button--secondary'}`}
                        disabled={busyPlayerId === selectedProfile.playerId && busyAction === 'ROLE'}
                        onClick={(event) => onRoleAssignment(role, event)}
                      >
                        {busyPlayerId === selectedProfile.playerId && busyAction === 'ROLE' && isAssigned
                          ? 'Saving...'
                          : `Set ${formatAssignedRole(role)}`}
                      </button>
                    );
                  })}
                </div>
                <div className="v2-divider" />
                <p className="v2-panel__subtitle">{selectedProfile.squadContext.recommendation}</p>
              </div>

              <div className={`v2-panel ${selectedProfile.medical.workloadRisk === 'CRITICAL' ? 'v2-panel--danger' : selectedProfile.medical.workloadRisk === 'HIGH' ? 'v2-panel--warm' : 'v2-panel--soft'}`}>
                <div className="v2-squad-detail-section__header">
                  <h4 className="v2-panel__title" style={{ margin: 0 }}>Medical & Workload</h4>
                  <span className={`v2-badge ${medicalRiskBadgeClass(selectedProfile.medical.workloadRisk)}`}>
                    {selectedProfile.medical.workloadRisk}
                  </span>
                </div>

                <div className="v2-grid v2-grid--two" style={{ marginTop: 8 }}>
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Rehab Status</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {formatMedicalRehabStatus(selectedProfile.medical.rehabStatus)}
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      Workload score {selectedProfile.medical.workloadScore}/100
                    </p>
                  </div>
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Availability Recommendation</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {formatMedicalAvailabilityRecommendation(selectedProfile.medical.availabilityRecommendation)}
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      {selectedProfile.medical.recoveryRecommendation}
                    </p>
                  </div>
                </div>

                <div className="v2-grid v2-grid--two" style={{ marginTop: 8 }}>
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Active Medical Plan</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {selectedProfile.medical.activePlan
                        ? `${selectedProfile.medical.activePlan.label} (${selectedProfile.medical.activePlan.weeksRemaining}w left)`
                        : 'No active medical plan'}
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      {selectedProfile.medical.activePlan?.projectedEffects.summary
                        || `Recommended next step: ${formatMedicalPlanLabel(selectedProfile.medical.recommendedPlanCode)}.`}
                    </p>
                  </div>
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Risk Factors</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {selectedProfile.medical.riskFactors.length > 0 ? `${selectedProfile.medical.riskFactors.length} live factor(s)` : 'No major flags'}
                    </p>
                    <div className="v2-chip-row" style={{ marginTop: 8 }}>
                      {selectedProfile.medical.riskFactors.length > 0
                        ? selectedProfile.medical.riskFactors.map((factor) => <span key={factor} className="v2-chip">{factor}</span>)
                        : <span className="v2-chip">Medical load is currently controlled.</span>}
                    </div>
                  </div>
                </div>

                <div className="v2-grid v2-grid--two" style={{ marginTop: 8 }}>
                  <label className="v2-field">
                    <span className="v2-field__label">Medical Plan</span>
                    <select
                      className="v2-select"
                      value={medicalPlanDraft}
                      onChange={(e) => onMedicalPlanChange(e.target.value as ActivePlayerMedicalPlanCode)}
                      disabled={busyPlayerId === selectedProfile.playerId && busyAction === 'MEDICAL'}
                    >
                      {PLAYER_MEDICAL_PLAN_CODES.map((planCode) => (
                        <option key={planCode} value={planCode}>{formatMedicalPlanLabel(planCode)}</option>
                      ))}
                    </select>
                    <span className="v2-field__hint">
                      Longer-horizon medical programming sits alongside the short-term availability directive above.
                    </span>
                  </label>

                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Program Guidance</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {formatMedicalPlanLabel(selectedProfile.medical.recommendedPlanCode)}
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      {selectedProfile.medical.activePlan?.note || selectedProfile.medical.recoveryRecommendation}
                    </p>
                  </div>
                </div>

                <div className="v2-inline-actions" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    data-testid="squad-save-medical-plan"
                    className="v2-button v2-button--primary"
                    disabled={busyPlayerId === selectedProfile.playerId && busyAction === 'MEDICAL'}
                    onClick={onSaveMedicalPlan}
                  >
                    {busyPlayerId === selectedProfile.playerId && busyAction === 'MEDICAL' ? 'Saving...' : 'Save Medical Plan'}
                  </button>
                  <button
                    type="button"
                    className="v2-button v2-button--ghost"
                    disabled={(busyPlayerId === selectedProfile.playerId && busyAction === 'MEDICAL') || !selectedProfile.medical.activePlan}
                    onClick={onClearMedicalPlan}
                  >
                    Clear Medical Plan
                  </button>
                </div>
              </div>

              {selectedProfile.playingTimePromise && (
                <div className={`v2-panel ${selectedProfile.playingTimePromise.status === 'OVERDUE' ? 'v2-panel--danger' : selectedProfile.playingTimePromise.status === 'DUE' ? 'v2-panel--warm' : 'v2-panel--soft'}`}>
                  <div className="v2-squad-detail-section__header">
                    <h4 className="v2-panel__title" style={{ margin: 0 }}>Playing-Time Promise</h4>
                    <span className={`v2-badge ${playingTimePromiseBadgeClass(selectedProfile.playingTimePromise.status)}`}>
                      {selectedProfile.playingTimePromise.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="v2-grid v2-grid--two" style={{ marginTop: 8 }}>
                    <div className="v2-stat-card">
                      <p className="v2-stat-card__label">Promise Target</p>
                      <p className="v2-stat-card__value v2-stat-card__value--compact">
                        {formatAssignedRole(selectedProfile.playingTimePromise.promisedRoleAssignment)} by week {selectedProfile.playingTimePromise.dueWeekNumber}
                      </p>
                      <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                        Created week {selectedProfile.playingTimePromise.createdWeekNumber}
                        {selectedProfile.playingTimePromise.reaffirmCount > 0 ? ` • Reaffirmed ${selectedProfile.playingTimePromise.reaffirmCount}x` : ''}
                      </p>
                    </div>
                    <div className="v2-stat-card">
                      <p className="v2-stat-card__label">Timing</p>
                      <p className="v2-stat-card__value v2-stat-card__value--compact">
                        {selectedProfile.playingTimePromise.weeksUntilDue > 0
                          ? `${selectedProfile.playingTimePromise.weeksUntilDue} week(s) to deadline`
                          : selectedProfile.playingTimePromise.weeksUntilDue === 0
                            ? 'Deadline this week'
                            : `${Math.abs(selectedProfile.playingTimePromise.weeksUntilDue)} week(s) overdue`}
                      </p>
                      <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                        Matchday inclusions: {selectedProfile.playingTimePromise.matchdaySquadCount} • Appearances: {selectedProfile.playingTimePromise.appearanceCount}
                      </p>
                    </div>
                  </div>
                  <div className="v2-grid v2-grid--two" style={{ marginTop: 8 }}>
                    <div className="v2-stat-card">
                      <p className="v2-stat-card__label">Usage Since Promise</p>
                      <p className="v2-stat-card__value v2-stat-card__value--compact">
                        {selectedProfile.playingTimePromise.totalMinutes} minute(s) • {selectedProfile.playingTimePromise.startCount} start(s)
                      </p>
                      <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                        Unused bench entries: {selectedProfile.playingTimePromise.unusedBenchCount}
                      </p>
                    </div>
                    <div className="v2-stat-card">
                      <p className="v2-stat-card__label">Latest Usage</p>
                      <p className="v2-stat-card__value v2-stat-card__value--compact">
                        {selectedProfile.playingTimePromise.lastUsedWeekNumber !== null
                          ? `Week ${selectedProfile.playingTimePromise.lastUsedWeekNumber}`
                          : 'No match usage yet'}
                      </p>
                      <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                        {selectedProfile.playingTimePromise.lastUsageSummary || 'The player still needs actual matchday inclusion to resolve the promise.'}
                      </p>
                    </div>
                  </div>
                  <div className="v2-divider" />
                  <p className="v2-panel__subtitle">{selectedProfile.playingTimePromise.summary}</p>
                  <div className="v2-inline-actions" style={{ marginTop: 12 }}>
                    <Link to="/inbox" className="v2-link-button v2-link-button--secondary">
                      Open Inbox
                    </Link>
                  </div>
                </div>
              )}

              <div className="v2-panel v2-panel--soft">
                <div className="v2-squad-detail-section__header">
                  <h4 className="v2-panel__title" style={{ margin: 0 }}>Individual Development Plan</h4>
                  {selectedProfile.developmentPlan ? (
                    <span className="v2-badge v2-badge--low">
                      Active since week {selectedProfile.developmentPlan.setWeekNumber}
                    </span>
                  ) : (
                    <span className="v2-badge v2-badge--medium">No active plan</span>
                  )}
                </div>

                <div className="v2-grid v2-grid--two" style={{ marginTop: 8 }}>
                  <label className="v2-field">
                    <span className="v2-field__label">Focus</span>
                    <select
                      className="v2-select"
                      value={devPlanFocusDraft}
                      onChange={(e) => onDevelopmentFocusChange(e.target.value as DevelopmentPlanFocus)}
                      disabled={busyPlayerId === selectedProfile.playerId && busyAction === 'DEV_PLAN'}
                    >
                      {DEVELOPMENT_PLAN_FOCUSES.map((focus) => (
                        <option key={focus} value={focus}>{formatDevelopmentFocus(focus)}</option>
                      ))}
                    </select>
                    <span className="v2-field__hint">
                      Shapes where weekly training attention is concentrated.
                    </span>
                  </label>

                  <label className="v2-field">
                    <span className="v2-field__label">Target Outcome</span>
                    <select
                      className="v2-select"
                      value={devPlanTargetDraft}
                      onChange={(e) => onDevelopmentTargetChange(e.target.value as DevelopmentPlanTarget)}
                      disabled={busyPlayerId === selectedProfile.playerId && busyAction === 'DEV_PLAN'}
                    >
                      {DEVELOPMENT_PLAN_TARGETS.map((target) => (
                        <option key={target} value={target}>{formatDevelopmentTarget(target)}</option>
                      ))}
                    </select>
                    <span className="v2-field__hint">
                      Sets the short-term tradeoff (sharpness, upside, or protection).
                    </span>
                  </label>
                </div>

                <div className="v2-grid v2-grid--two" style={{ marginTop: 8 }}>
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Current Plan</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {selectedProfile.developmentPlan
                        ? `${formatDevelopmentFocus(selectedProfile.developmentPlan.focus)} / ${formatDevelopmentTarget(selectedProfile.developmentPlan.target)}`
                        : 'No active development plan'}
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      {selectedProfile.developmentPlan?.projectedEffects.summary || 'Save a plan to create a weekly progression track for this player.'}
                    </p>
                  </div>
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Projected Weekly Effects</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {selectedProfile.developmentPlan
                        ? `Dev ${formatSigned(selectedProfile.developmentPlan.projectedEffects.developmentDelta)} • Form ${formatSigned(selectedProfile.developmentPlan.projectedEffects.formDelta)}`
                        : 'Applied after saving this plan'}
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      {selectedProfile.developmentPlan
                        ? `Fitness ${formatSigned(selectedProfile.developmentPlan.projectedEffects.fitnessDelta)} • Morale ${formatSigned(selectedProfile.developmentPlan.projectedEffects.moraleDelta)}`
                        : `${formatDevelopmentFocus(devPlanFocusDraft)} / ${formatDevelopmentTarget(devPlanTargetDraft)}`}
                    </p>
                  </div>
                </div>

                <div className="v2-inline-actions" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="v2-button v2-button--primary"
                    disabled={busyPlayerId === selectedProfile.playerId && busyAction === 'DEV_PLAN'}
                    onClick={onSaveDevelopmentPlan}
                  >
                    {busyPlayerId === selectedProfile.playerId && busyAction === 'DEV_PLAN' ? 'Saving Plan...' : 'Save Development Plan'}
                  </button>
                </div>
              </div>

              <div className="v2-panel v2-panel--soft">
                <div className="v2-squad-detail-section__header">
                  <h4 className="v2-panel__title" style={{ margin: 0 }}>Positional Retraining</h4>
                  <span className={`v2-badge ${selectedProfile.retraining ? retrainingReadinessBadgeClass(selectedProfile.retraining.readiness) : 'v2-badge--medium'}`}>
                    {selectedProfile.retraining ? selectedProfile.retraining.readiness.replace('_', ' ') : 'No active retraining'}
                  </span>
                </div>
                <div className="v2-grid v2-grid--two" style={{ marginTop: 8 }}>
                  <label className="v2-field">
                    <span className="v2-field__label">Target Position</span>
                    <select
                      className="v2-select"
                      value={retrainingTargetDraft}
                      onChange={(e) => onRetrainingTargetChange(e.target.value as RetrainablePosition)}
                      disabled={busyPlayerId === selectedProfile.playerId && busyAction === 'RETRAINING'}
                    >
                      {RETRAINABLE_POSITIONS.map((position) => (
                        <option key={position} value={position}>{formatRetrainingPosition(position)}</option>
                      ))}
                    </select>
                    <span className="v2-field__hint">
                      Select the next role family to develop. Choosing the current natural role clears active retraining.
                    </span>
                  </label>

                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Current Track</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {selectedProfile.retraining
                        ? `${formatRetrainingPosition(selectedProfile.retraining.currentPosition)} -> ${formatRetrainingPosition(selectedProfile.retraining.targetPosition)}`
                        : `${formatRetrainingPosition(selectedProfile.position)} (natural role)`}
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      Effective match-prep role: {formatRetrainingPosition(selectedProfile.effectivePosition || selectedProfile.position)}
                    </p>
                  </div>
                </div>

                <div className="v2-grid v2-grid--two" style={{ marginTop: 8 }}>
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Progress</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {selectedProfile.retraining
                        ? `${selectedProfile.retraining.progressPct}% (${selectedProfile.retraining.weeklyProgressPct}% / week)`
                        : 'No active progress'}
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      {selectedProfile.retraining
                        ? `Estimated ${selectedProfile.retraining.estimatedWeeksRemaining} week(s) remaining.`
                        : 'Set a retraining target to start a weekly positional transition.'}
                    </p>
                  </div>
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Readiness</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {selectedProfile.retraining
                        ? selectedProfile.retraining.readiness.replace('_', ' ')
                        : 'Natural role only'}
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      {selectedProfile.retraining?.summary || 'Emergency match-prep cover unlocks once enough progress is built.'}
                    </p>
                  </div>
                </div>

                <div className="v2-inline-actions" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    className="v2-button v2-button--primary"
                    disabled={busyPlayerId === selectedProfile.playerId && busyAction === 'RETRAINING'}
                    onClick={onSaveRetrainingPlan}
                  >
                    {busyPlayerId === selectedProfile.playerId && busyAction === 'RETRAINING' ? 'Saving...' : 'Save Retraining Plan'}
                  </button>
                </div>
              </div>

              {(selectedProfile.recentHistory.roleChanges.length > 0
                || selectedProfile.recentHistory.developmentPlanChanges.length > 0
                || selectedProfile.recentHistory.medicalPlanChanges.length > 0
                || selectedProfile.recentHistory.retrainingChanges.length > 0
                || selectedProfile.recentHistory.promiseTimeline.length > 0) && (
                <div className="v2-panel v2-panel--soft">
                  <div className="v2-squad-detail-section__header">
                    <h4 className="v2-panel__title" style={{ margin: 0 }}>Recent Management History</h4>
                    <span className="v2-badge v2-badge--low">
                      Audit-backed
                    </span>
                  </div>

                  <div
                    className="v2-grid"
                    style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginTop: 8 }}
                  >
                    <div className="v2-stat-card">
                      <p className="v2-stat-card__label">Role Changes</p>
                      {selectedProfile.recentHistory.roleChanges.length === 0 && (
                        <p className="v2-panel__subtitle">No recent role assignment changes.</p>
                      )}
                      {selectedProfile.recentHistory.roleChanges.length > 0 && (
                        <div className="v2-history-list">
                          {selectedProfile.recentHistory.roleChanges.slice(0, 4).map((entry) => (
                            <div key={`role-${entry.occurredAt}-${entry.roleAssignment}`} className="v2-history-item">
                              <div className="v2-history-item__top">
                                <strong>
                                  {formatAssignedRole(entry.previousRoleAssignment)} {'->'} {formatAssignedRole(entry.roleAssignment)}
                                </strong>
                                <span className="v2-kicker">{formatHistoryTime(entry.occurredAt)}</span>
                              </div>
                              <div className="v2-history-item__meta">
                                <span>Morale {formatSigned(entry.moraleDelta)}</span>
                                <span>Board {formatSigned(entry.boardDelta)}</span>
                                {entry.expectedRole && <span>Expected {formatAssignedRole(entry.expectedRole)}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="v2-stat-card">
                      <p className="v2-stat-card__label">Development Plan Changes</p>
                      {selectedProfile.recentHistory.developmentPlanChanges.length === 0 && (
                        <p className="v2-panel__subtitle">No recent development plan updates.</p>
                      )}
                      {selectedProfile.recentHistory.developmentPlanChanges.length > 0 && (
                        <div className="v2-history-list">
                          {selectedProfile.recentHistory.developmentPlanChanges.slice(0, 4).map((entry) => (
                            <div key={`dev-${entry.occurredAt}-${entry.focus}-${entry.target}`} className="v2-history-item">
                              <div className="v2-history-item__top">
                                <strong>{formatDevelopmentFocus(entry.focus)} / {formatDevelopmentTarget(entry.target)}</strong>
                                <span className="v2-kicker">{formatHistoryTime(entry.occurredAt)}</span>
                              </div>
                              <div className="v2-history-item__meta">
                                {entry.previousFocus && entry.previousTarget && (
                                  <span>From {formatDevelopmentFocus(entry.previousFocus)} / {formatDevelopmentTarget(entry.previousTarget)}</span>
                                )}
                                {entry.immediateMoraleDelta !== 0 && <span>Morale {formatSigned(entry.immediateMoraleDelta)}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="v2-stat-card">
                      <p className="v2-stat-card__label">Medical Plan Changes</p>
                      {selectedProfile.recentHistory.medicalPlanChanges.length === 0 && (
                        <p className="v2-panel__subtitle">No recent medical plan updates.</p>
                      )}
                      {selectedProfile.recentHistory.medicalPlanChanges.length > 0 && (
                        <div className="v2-history-list">
                          {selectedProfile.recentHistory.medicalPlanChanges.slice(0, 4).map((entry) => (
                            <div key={`medical-${entry.occurredAt}-${entry.planCode || 'clear'}`} className="v2-history-item">
                              <div className="v2-history-item__top">
                                <strong>{formatMedicalHistoryAction(entry.action)}</strong>
                                <span className="v2-kicker">{formatHistoryTime(entry.occurredAt)}</span>
                              </div>
                              <div className="v2-history-item__meta">
                                {entry.planCode && <span>{formatMedicalPlanLabel(entry.planCode)}</span>}
                                {entry.previousPlanCode && <span>From {formatMedicalPlanLabel(entry.previousPlanCode)}</span>}
                                {entry.expiresWeekNumber !== null && <span>Through W{entry.expiresWeekNumber}</span>}
                                {entry.immediateFitnessDelta !== 0 && <span>Fitness {formatSigned(entry.immediateFitnessDelta)}</span>}
                                {entry.immediateMoraleDelta !== 0 && <span>Morale {formatSigned(entry.immediateMoraleDelta)}</span>}
                                {entry.immediateFormDelta !== 0 && <span>Form {formatSigned(entry.immediateFormDelta)}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="v2-stat-card">
                      <p className="v2-stat-card__label">Retraining Changes</p>
                      {selectedProfile.recentHistory.retrainingChanges.length === 0 && (
                        <p className="v2-panel__subtitle">No recent positional retraining changes.</p>
                      )}
                      {selectedProfile.recentHistory.retrainingChanges.length > 0 && (
                        <div className="v2-history-list">
                          {selectedProfile.recentHistory.retrainingChanges.slice(0, 5).map((entry) => (
                            <div key={`retrain-${entry.occurredAt}-${entry.action}-${entry.targetPosition || 'none'}`} className="v2-history-item">
                              <div className="v2-history-item__top">
                                <strong>{formatRetrainingHistoryAction(entry.action)}</strong>
                                <span className="v2-kicker">{formatHistoryTime(entry.occurredAt)}</span>
                              </div>
                              <div className="v2-history-item__meta">
                                {entry.currentPosition && <span>{formatRetrainingPosition(entry.currentPosition)}</span>}
                                {entry.targetPosition && <span>{formatRetrainingPosition(entry.targetPosition)}</span>}
                                {entry.progressPct !== null && <span>{entry.progressPct}%</span>}
                                {entry.weeklyProgressPct !== null && <span>{entry.weeklyProgressPct}% / week</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="v2-stat-card">
                      <p className="v2-stat-card__label">Promise Timeline</p>
                      {selectedProfile.recentHistory.promiseTimeline.length === 0 && (
                        <p className="v2-panel__subtitle">No recent promise outcomes for this player.</p>
                      )}
                      {selectedProfile.recentHistory.promiseTimeline.length > 0 && (
                        <div className="v2-history-list">
                          {selectedProfile.recentHistory.promiseTimeline.slice(0, 5).map((entry) => (
                            <div key={`promise-${entry.occurredAt}-${entry.action}`} className="v2-history-item">
                              <div className="v2-history-item__top">
                                <strong>{formatPromiseTimelineAction(entry.action)}</strong>
                                <span className="v2-kicker">{formatHistoryTime(entry.occurredAt)}</span>
                              </div>
                              <div className="v2-history-item__meta">
                                {entry.promiseKind && <span>{formatPromiseKind(entry.promiseKind)}</span>}
                                {entry.dueWeekNumber !== null && <span>Due W{entry.dueWeekNumber}</span>}
                                {entry.resolvedWeekNumber !== null && <span>Resolved W{entry.resolvedWeekNumber}</span>}
                                {entry.sourceAction && <span>{formatPromiseSourceAction(entry.sourceAction)}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="v2-panel v2-panel--warm">
                <div className="v2-squad-detail-section__header">
                  <h4 className="v2-panel__title" style={{ margin: 0 }}>Contract Strategy</h4>
                  <span className={`v2-badge ${riskBadgeClass(selectedProfile.contract.risk)}`}>
                    {selectedProfile.contract.risk}
                  </span>
                </div>
                <div className="v2-grid v2-grid--two">
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Recommended Offer Shape</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      {selectedProfile.contract.suggestedRenewalYears} year(s), +{selectedProfile.contract.suggestedWageAdjustmentPct}% wage
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      Current end date: {formatContractEnd(selectedProfile.contract.contractEnd)}
                    </p>
                  </div>
                  <div className="v2-stat-card">
                    <p className="v2-stat-card__label">Performance Snapshot</p>
                    <p className="v2-stat-card__value v2-stat-card__value--compact">
                      Morale {selectedProfile.performance.morale} • Fitness {selectedProfile.performance.fitness} • Form {selectedProfile.performance.form}
                    </p>
                    <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                      Development delta: {formatSigned(selectedProfile.performance.developmentDelta)}
                    </p>
                  </div>
                </div>
                <div className="v2-divider" />
                <p className="v2-panel__subtitle">{selectedProfile.contract.recommendation}</p>
              </div>

              {selectedProfile.pendingContractTalk && (
                <div className="v2-panel v2-panel--danger">
                  <div className="v2-squad-detail-section__header">
                    <h4 className="v2-panel__title" style={{ margin: 0 }}>Live Contract Talk</h4>
                    <span className={`v2-badge ${pendingStageBadgeClass(selectedProfile.pendingContractTalk.stage)}`}>
                      {formatPendingStage(selectedProfile.pendingContractTalk.stage)}
                    </span>
                  </div>
                  <p className="v2-panel__subtitle" style={{ marginTop: 6 }}>
                    {selectedProfile.pendingContractTalk.title}
                  </p>
                  <div className="v2-chip-row" style={{ marginTop: 10 }}>
                    <span className={`v2-chip ${selectedProfile.pendingContractTalk.urgency === 'HIGH' ? 'v2-chip--danger' : selectedProfile.pendingContractTalk.urgency === 'MEDIUM' ? 'v2-chip--warm' : ''}`}>
                      {selectedProfile.pendingContractTalk.urgency}
                    </span>
                    <span className="v2-chip">
                      Deadline {new Date(selectedProfile.pendingContractTalk.deadline).toLocaleString()}
                    </span>
                  </div>
                  <div className="v2-inline-actions" style={{ marginTop: 12 }}>
                    <Link to="/inbox" className="v2-link-button v2-link-button--secondary">
                      Open Inbox
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  </aside>
);

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="v2-stat-card">
    <p className="v2-stat-card__label">{label}</p>
    <p className="v2-stat-card__value v2-stat-card__value--compact">{value}</p>
  </div>
);

export default SquadProfilePanel;
