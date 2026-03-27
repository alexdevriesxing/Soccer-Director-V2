import React from 'react';
import { Link } from 'react-router-dom';
import { CareerSummary } from '../types';

interface ActiveCareerRequiredProps {
  resolving: boolean;
  resolveError: string | null;
  careers: CareerSummary[];
  onSelectCareer: (careerId: string) => void;
}

const ActiveCareerRequired: React.FC<ActiveCareerRequiredProps> = ({
  resolving,
  resolveError,
  careers,
  onSelectCareer
}) => {
  return (
    <section className="v2-panel v2-empty-state">
      <div>
        <p className="v2-kicker" style={{ marginTop: 0, marginBottom: 6 }}>Career Required</p>
        <h3 className="v2-panel__title" style={{ marginBottom: 4 }}>No active career selected.</h3>
        <p className="v2-panel__subtitle">
        Create a new career or select an existing one to continue.
        </p>
      </div>

      {resolving && <div className="v2-message v2-message--subtle">Resolving active career...</div>}
      {resolveError && <div className="v2-message v2-message--error">{resolveError}</div>}

      {careers.length > 0 && (
        <div className="v2-grid">
          {careers.slice(0, 6).map((career) => (
            <button
              key={career.id}
              onClick={() => onSelectCareer(career.id)}
              className="v2-career-choice"
            >
              <div className="v2-career-choice__top">
                <span>{career.managerName}</span>
                <span className="v2-badge v2-badge--low">Week {career.weekNumber}</span>
              </div>
              <div className="v2-career-choice__meta">
                <span>
                {career.controlledClubName || `Club #${career.controlledClubId}`}
                {career.controlledLeagueName ? ` (${career.controlledLeagueName})` : ''}
                </span>
              </div>
              <div className="v2-career-choice__sub">
                Season {career.season} | {career.currentPhase}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="v2-inline-actions">
        <Link className="v2-link-button v2-link-button--primary" to="/new-career">Open New Career</Link>
        <Link className="v2-link-button v2-link-button--secondary" to="/save-load">Open Save/Load</Link>
      </div>
    </section>
  );
};

export default ActiveCareerRequired;
