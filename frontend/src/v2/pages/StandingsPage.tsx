import React, { useEffect, useMemo, useState } from 'react';
import ActiveCareerRequired from '../components/ActiveCareerRequired';
import V2Shell from '../components/V2Shell';
import { getCareerState, getLeagueRules, getStandings, listCareerLeagues } from '../api';
import { CareerLeagueOption, CareerState, LeagueRules, StandingsRow } from '../types';
import { useActiveCareer } from '../useActiveCareer';

function ruleSlotsLabel(slots: number): string {
  if (slots <= 0) {
    return 'None';
  }
  return `${slots} automatic`;
}

function progressionBadgeStyle(status: string): React.CSSProperties {
  const normalized = status.toUpperCase();
  if (normalized === 'PROMOTED') {
    return {
      border: '1px solid rgba(140, 234, 179, 0.7)',
      background: 'rgba(111, 224, 150, 0.2)',
      color: '#d6ffe8'
    };
  }
  if (normalized === 'RELEGATED') {
    return {
      border: '1px solid rgba(244, 127, 127, 0.75)',
      background: 'rgba(244, 127, 127, 0.18)',
      color: '#ffd0d0'
    };
  }

  return {
    border: '1px solid rgba(132, 222, 181, 0.5)',
    background: 'rgba(132, 222, 181, 0.14)',
    color: '#ddfbe9'
  };
}

const StandingsPage: React.FC = () => {
  const { careerId, careers, resolving, resolveError, setCareerId } = useActiveCareer();
  const [career, setCareer] = useState<CareerState | null>(null);
  const [leagueOptions, setLeagueOptions] = useState<CareerLeagueOption[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | null>(null);
  const [rows, setRows] = useState<StandingsRow[]>([]);
  const [rules, setRules] = useState<LeagueRules | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingStandings, setLoadingStandings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!careerId) {
      setCareer(null);
      setLeagueOptions([]);
      setSelectedLeagueId(null);
      setRows([]);
      setRules(null);
      setLoadingInitial(false);
      return;
    }

    let cancelled = false;
    setLoadingInitial(true);
    setError(null);

    Promise.all([
      getCareerState(careerId),
      listCareerLeagues(careerId)
    ])
      .then(([state, leagues]) => {
        if (cancelled) return;

        const sorted = [...leagues].sort((a, b) =>
          a.tier - b.tier ||
          (a.region ?? '').localeCompare(b.region ?? '') ||
          (a.matchdayType ?? '').localeCompare(b.matchdayType ?? '') ||
          a.leagueName.localeCompare(b.leagueName)
        );

        setCareer(state);
        setLeagueOptions(sorted);

        const desiredLeagueId = state.activeLeagueId && sorted.some((league) => league.leagueId === state.activeLeagueId)
          ? state.activeLeagueId
          : sorted[0]?.leagueId ?? null;
        setSelectedLeagueId(desiredLeagueId);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load standings context.');
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingInitial(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [careerId]);

  useEffect(() => {
    if (!careerId || selectedLeagueId === null) {
      setRows([]);
      setRules(null);
      return;
    }

    let cancelled = false;
    setLoadingStandings(true);
    setError(null);

    Promise.all([
      getStandings(careerId, selectedLeagueId),
      getLeagueRules(careerId, selectedLeagueId)
    ])
      .then(([tableRows, rulesPayload]) => {
        if (cancelled) return;
        setRows(tableRows);
        setRules(rulesPayload);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load standings.');
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingStandings(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [careerId, selectedLeagueId]);

  const selectedLeague = useMemo(
    () => leagueOptions.find((league) => league.leagueId === selectedLeagueId) ?? null,
    [leagueOptions, selectedLeagueId]
  );

  if (!careerId) {
    return (
      <V2Shell title="Standings">
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
    <V2Shell title="League Standings">
      {loadingInitial && <p>Loading standings...</p>}
      {error && <p style={{ color: '#ffb9b9' }}>{error}</p>}

      {!loadingInitial && (
        <>
          <section style={{ ...card, marginBottom: 12 }}>
            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <div>
                <div style={label}>Career</div>
                <div style={{ fontWeight: 700 }}>{career?.managerName ?? '-'}</div>
                <div style={{ color: '#bde8d2', fontSize: 13 }}>
                  {career?.club?.name || `Club #${career?.controlledClubId ?? '-'}`}
                </div>
              </div>
              <div>
                <div style={label}>Season</div>
                <div style={{ fontWeight: 700 }}>{career?.season ?? '-'}</div>
                <div style={{ color: '#bde8d2', fontSize: 13 }}>Week {career?.weekNumber ?? '-'}</div>
              </div>
              <div>
                <div style={label}>Division</div>
                <div style={{ fontWeight: 700 }}>
                  {(selectedLeague?.divisionType ?? 'AMATEUR') === 'PRO' ? 'Professional' : 'Amateur'}
                </div>
                <div style={{ color: '#bde8d2', fontSize: 13 }}>
                  {selectedLeague
                    ? `Tier ${selectedLeague.tier} | ${(selectedLeague.ageCategory ?? 'SENIOR') === 'O21' ? 'O21' : 'Senior'}`
                    : '-'}
                </div>
              </div>
              <div>
                <div style={label}>Season Phase</div>
                <div style={{ fontWeight: 700 }}>{rules?.seasonPhase.label ?? 'Loading...'}</div>
                <div style={{ color: '#bde8d2', fontSize: 13 }}>
                  {rules?.seasonPhase.note ?? 'Competition timing will update once league rules load.'}
                </div>
              </div>
            </div>

            <label style={{ display: 'grid', gap: 6, marginTop: 12 }}>
              <span style={label}>Select league table</span>
              <select
                value={selectedLeagueId ?? ''}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  setSelectedLeagueId(event.target.value ? Number(event.target.value) : null)
                }
                style={inputStyle}
              >
                {leagueOptions.map((league) => (
                  <option key={league.leagueId} value={league.leagueId}>
                    {league.divisionType === 'PRO' ? '[PRO]' : '[AM]'} {league.ageCategory === 'O21' ? '[O21]' : ''} Tier {league.tier} - {league.leagueName} ({league.clubCount} clubs)
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <div style={card}>
              {loadingStandings && <p>Refreshing table...</p>}
              {!loadingStandings && rows.length === 0 && <p style={{ margin: 0 }}>No standings data found for this league.</p>}

              {rows.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={head}>Pos</th>
                      <th style={head}>Club</th>
                      <th style={head}>P</th>
                      <th style={head}>W</th>
                      <th style={head}>D</th>
                      <th style={head}>L</th>
                      <th style={head}>GF</th>
                      <th style={head}>GA</th>
                      <th style={head}>GD</th>
                      <th style={head}>Pts</th>
                      <th style={head}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const isUserClub = row.clubId === career?.controlledClubId;
                      return (
                        <tr
                          key={`${row.clubId}-${row.position}`}
                          style={isUserClub ? { background: 'rgba(132, 222, 181, 0.14)' } : undefined}
                        >
                          <td style={cell}>{row.position}</td>
                          <td style={cell}>
                            <span style={isUserClub ? { fontWeight: 700 } : undefined}>{row.clubName}</span>
                          </td>
                          <td style={cell}>{row.played}</td>
                          <td style={cell}>{row.won}</td>
                          <td style={cell}>{row.drawn}</td>
                          <td style={cell}>{row.lost}</td>
                          <td style={cell}>{row.goalsFor}</td>
                          <td style={cell}>{row.goalsAgainst}</td>
                          <td style={cell}>{row.goalDifference}</td>
                          <td style={cell}><b>{row.points}</b></td>
                          <td style={cell}>
                            <span style={{ ...badgeBase, ...progressionBadgeStyle(row.progressionStatus) }}>
                              {row.progressionStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div style={card}>
              <h3 style={{ marginTop: 0 }}>League Rules</h3>
              {!rules && <p style={{ margin: 0, color: '#bde8d2' }}>Select a league to inspect movement rules.</p>}

              {rules && (
                <div style={{ display: 'grid', gap: 10 }}>
                  <div>
                    <div style={label}>Group</div>
                    <div>{rules.transitionGroup}</div>
                    <div style={{ marginTop: 4, color: '#bde8d2', fontSize: 13 }}>
                      Category: {rules.league.ageCategory === 'O21' ? 'O21' : 'Senior'}
                    </div>
                  </div>

                  <div>
                    <div style={label}>Season Phase</div>
                    <div>{rules.seasonPhase.label}</div>
                    <div style={{ marginTop: 4, color: '#bde8d2', fontSize: 13 }}>
                      {rules.seasonPhase.note}
                    </div>
                  </div>

                  <div>
                    <div style={label}>Registration Window</div>
                    <div>{rules.registration.window.label}</div>
                    <div style={{ marginTop: 4, color: '#bde8d2', fontSize: 13 }}>
                      {rules.registration.window.note}
                    </div>
                  </div>

                  <div>
                    <div style={label}>Transfer Window</div>
                    <div>{rules.transferWindow.label}</div>
                    <div style={{ marginTop: 4, color: '#bde8d2', fontSize: 13 }}>
                      {rules.transferWindow.note}
                    </div>
                  </div>

                  <div>
                    <div style={label}>Squad Registration</div>
                    <div>
                      {rules.registration.registrationLimit} max / {rules.registration.minimumRegistered} minimum
                      {rules.registration.overageLimit !== null ? ` / ${rules.registration.overageLimit} overage` : ''}
                    </div>
                    <div style={{ marginTop: 4, color: '#bde8d2', fontSize: 13 }}>
                      {rules.registration.competitionLabel}
                    </div>
                  </div>

                  <div>
                    <div style={label}>Promotion</div>
                    <div>{ruleSlotsLabel(rules.promotion.slots)}</div>
                    {rules.promotion.targetLeagues.length > 0 && (
                      <div style={{ marginTop: 5, color: '#bde8d2', fontSize: 13 }}>
                        To: {rules.promotion.targetLeagues.map((league) => `${league.name} (T${league.tier})`).join(', ')}
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={label}>Relegation</div>
                    <div>{ruleSlotsLabel(rules.relegation.slots)}</div>
                    {rules.relegation.targetLeagues.length > 0 && (
                      <div style={{ marginTop: 5, color: '#bde8d2', fontSize: 13 }}>
                        To: {rules.relegation.targetLeagues.map((league) => `${league.name} (T${league.tier})`).join(', ')}
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={label}>Disciplinary Rules</div>
                    <div style={{ display: 'grid', gap: 6 }}>
                      <div style={{ color: '#bde8d2', fontSize: 13 }}>
                        {rules.disciplinary.suspensionRule}
                      </div>
                      {rules.disciplinary.notes.map((note) => (
                        <div key={note} style={{ color: '#bde8d2', fontSize: 13 }}>
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div style={label}>Notes</div>
                    <div style={{ display: 'grid', gap: 6 }}>
                      {rules.notes.map((note) => (
                        <div key={note} style={{ color: '#bde8d2', fontSize: 13 }}>
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </V2Shell>
  );
};

const card: React.CSSProperties = {
  background: 'rgba(8, 20, 14, 0.55)',
  border: '1px solid rgba(132, 222, 181, 0.35)',
  borderRadius: 12,
  padding: 14
};

const label: React.CSSProperties = {
  color: '#bde8d2',
  fontSize: 12,
  marginBottom: 2
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.35)',
  color: '#effff6',
  border: '1px solid rgba(132, 222, 181, 0.5)',
  borderRadius: 8,
  padding: '8px 10px'
};

const head: React.CSSProperties = {
  textAlign: 'left',
  padding: '7px 8px',
  borderBottom: '1px solid rgba(132, 222, 181, 0.35)',
  fontSize: 13
};

const cell: React.CSSProperties = {
  padding: '6px 8px',
  borderBottom: '1px solid rgba(132, 222, 181, 0.16)',
  fontSize: 13
};

const badgeBase: React.CSSProperties = {
  borderRadius: 6,
  padding: '2px 7px',
  fontSize: 11,
  fontWeight: 700
};

export default StandingsPage;
