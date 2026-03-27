import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import V2Shell from '../components/V2Shell';
import { createCareer, deleteCareer, listCareers, listV2Clubs } from '../api';
import { CareerSummary, ClubChoice } from '../types';
import { clearActiveCareerId, getActiveCareerId, setActiveCareerId } from '../careerStore';

const NewCareerPage: React.FC = () => {
  const CLUBS_PER_PAGE = 80;
  const MAX_VISIBLE_CAREERS = 12;

  const navigate = useNavigate();
  const [managerName, setManagerName] = useState('');
  const [controlledClubId, setControlledClubId] = useState<number | null>(null);
  const [clubQuery, setClubQuery] = useState('');
  const [careerQuery, setCareerQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<'ALL' | 'PRO' | 'AMATEUR'>('ALL');
  const [ageFilter, setAgeFilter] = useState<'ALL' | 'SENIOR' | 'O21'>('ALL');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [clubPage, setClubPage] = useState(1);
  const [clubs, setClubs] = useState<ClubChoice[]>([]);
  const [careers, setCareers] = useState<CareerSummary[]>([]);
  const [clubsLoading, setClubsLoading] = useState(true);
  const [careersLoading, setCareersLoading] = useState(true);
  const [clubsLoadError, setClubsLoadError] = useState<string | null>(null);
  const [careersLoadError, setCareersLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingCareerId, setDeletingCareerId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tierCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const club of clubs) {
      if (!Number.isFinite(club.leagueTier)) {
        continue;
      }
      const tier = Number(club.leagueTier);
      counts.set(tier, (counts.get(tier) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => a[0] - b[0]);
  }, [clubs]);

  const selectedClub = useMemo(
    () => clubs.find((club) => club.id === controlledClubId) ?? null,
    [clubs, controlledClubId]
  );

  const filteredClubs = useMemo(() => {
    const query = clubQuery.trim().toLowerCase();

    return clubs.filter((club) => {
      if (divisionFilter !== 'ALL' && (club.divisionType ?? 'AMATEUR') !== divisionFilter) {
        return false;
      }

      if (ageFilter !== 'ALL' && (club.ageCategory ?? 'SENIOR') !== ageFilter) {
        return false;
      }

      if (tierFilter !== 'ALL' && String(club.leagueTier ?? '') !== tierFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = `${club.name} ${club.leagueName} tier ${club.leagueTier ?? ''} ${club.ageCategory ?? 'SENIOR'}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [ageFilter, clubQuery, clubs, divisionFilter, tierFilter]);

  const totalClubPages = useMemo(
    () => Math.max(1, Math.ceil(filteredClubs.length / CLUBS_PER_PAGE)),
    [filteredClubs.length]
  );

  useEffect(() => {
    setClubPage((current) => {
      if (filteredClubs.length === 0) {
        return 1;
      }
      return Math.max(1, Math.min(current, totalClubPages));
    });
  }, [filteredClubs.length, totalClubPages]);

  const visibleClubs = useMemo(() => {
    if (filteredClubs.length === 0) {
      return [];
    }

    const currentPage = Math.max(1, Math.min(clubPage, totalClubPages));
    const start = (currentPage - 1) * CLUBS_PER_PAGE;
    const rows = filteredClubs.slice(start, start + CLUBS_PER_PAGE);

    if (controlledClubId === null) {
      return rows;
    }

    if (rows.some((club) => club.id === controlledClubId)) {
      return rows;
    }

    const selected = filteredClubs.find((club) => club.id === controlledClubId);
    if (!selected) {
      return rows;
    }

    if (rows.length === 0) {
      return [selected];
    }

    return [selected, ...rows.slice(0, Math.max(0, CLUBS_PER_PAGE - 1))];
  }, [clubPage, controlledClubId, filteredClubs, totalClubPages]);

  const clubSliceBounds = useMemo(() => {
    if (filteredClubs.length === 0) {
      return { from: 0, to: 0 };
    }
    const currentPage = Math.max(1, Math.min(clubPage, totalClubPages));
    const from = (currentPage - 1) * CLUBS_PER_PAGE + 1;
    const to = Math.min(filteredClubs.length, currentPage * CLUBS_PER_PAGE);
    return { from, to };
  }, [clubPage, filteredClubs.length, totalClubPages]);

  const filteredCareers = useMemo(() => {
    const query = careerQuery.trim().toLowerCase();
    if (!query) {
      return careers;
    }

    return careers.filter((career) => {
      const haystack = `${career.managerName} ${career.controlledClubName ?? ''} ${career.controlledLeagueName ?? ''} ${career.season} ${career.currentPhase}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [careerQuery, careers]);

  const visibleCareers = useMemo(
    () => filteredCareers.slice(0, MAX_VISIBLE_CAREERS),
    [filteredCareers]
  );

  useEffect(() => {
    let isActive = true;

    const loadCareers = async () => {
      setCareersLoading(true);
      setCareersLoadError(null);
      try {
        const careerRows = await listCareers();
        if (!isActive) {
          return;
        }
        setCareers(careerRows);
      } catch (err: unknown) {
        if (!isActive) {
          return;
        }
        setCareersLoadError(err instanceof Error ? err.message : 'Failed to load existing careers.');
      } finally {
        if (isActive) {
          setCareersLoading(false);
        }
      }
    };

    const loadClubs = async () => {
      setClubsLoading(true);
      setClubsLoadError(null);
      try {
        const clubRows = await listV2Clubs();
        if (!isActive) {
          return;
        }
        setClubs(
          clubRows
            .filter((club) => Number.isFinite(club.id) && club.name)
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      } catch (err: unknown) {
        if (!isActive) {
          return;
        }
        setClubsLoadError(err instanceof Error ? err.message : 'Failed to load clubs.');
      } finally {
        if (isActive) {
          setClubsLoading(false);
        }
      }
    };

    loadCareers();
    loadClubs();

    return () => {
      isActive = false;
    };
  }, []);

  const handleCreate = async () => {
    if (!managerName.trim() || controlledClubId === null) {
      setError('Manager name and club are required.');
      return;
    }

    setLoading(true);
    setNotice(null);
    setError(null);

    try {
      const careerState = await createCareer({
        managerName: managerName.trim(),
        controlledClubId
      });

      setActiveCareerId(careerState.id);
      navigate('/hq');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create career.');
    } finally {
      setLoading(false);
    }
  };

  const createDisabled = loading || !managerName.trim() || controlledClubId === null;

  const resumeCareer = (careerId: string) => {
    setNotice(null);
    setActiveCareerId(careerId);
    navigate('/hq');
  };

  const handleDeleteCareer = async (career: CareerSummary) => {
    const confirmed = window.confirm(
      `Delete career "${career.managerName}" (${career.controlledClubName || `Club #${career.controlledClubId}`})?\n\nThis permanently removes career progress and save slots.`
    );
    if (!confirmed) {
      return;
    }

    setDeletingCareerId(career.id);
    setNotice(null);
    setError(null);
    try {
      await deleteCareer(career.id);
      const rows = await listCareers();
      setCareers(rows);

      if (getActiveCareerId() === career.id) {
        if (rows.length > 0) {
          setActiveCareerId(rows[0].id);
        } else {
          clearActiveCareerId();
        }
      }

      setNotice(`Deleted career "${career.managerName}".`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete career.');
    } finally {
      setDeletingCareerId(null);
    }
  };

  return (
    <V2Shell title="Career Setup">
      <section style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(320px, 520px) minmax(260px, 1fr)' }}>
        <div style={{ background: 'rgba(8, 20, 14, 0.55)', border: '1px solid rgba(132, 222, 181, 0.35)', borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Start New Career</h2>
          <p style={{ marginTop: 0, color: '#bee8d3' }}>Parallel save format. Legacy saves are intentionally unsupported.</p>

          <label style={{ display: 'block', marginBottom: 10 }}>
            Manager Name
            <input
              data-testid="new-career-manager-name"
              value={managerName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManagerName(e.target.value)}
              placeholder="Enter manager name"
              style={{
                display: 'block',
                width: '100%',
                marginTop: 6,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid rgba(140, 213, 178, 0.5)',
                background: 'rgba(0, 0, 0, 0.35)',
                color: '#eafff3'
              }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: 16 }}>
            Controlled Club
            <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', marginTop: 6 }}>
              <input
                data-testid="new-career-club-query"
                value={clubQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setClubQuery(e.target.value);
                  setClubPage(1);
                }}
                placeholder="Search club or league"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(140, 213, 178, 0.5)',
                  background: 'rgba(0, 0, 0, 0.35)',
                  color: '#eafff3'
                }}
              />
              <select
                data-testid="new-career-tier-filter"
                value={tierFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setTierFilter(e.target.value);
                  setClubPage(1);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(140, 213, 178, 0.5)',
                  background: 'rgba(0, 0, 0, 0.35)',
                  color: '#eafff3'
                }}
              >
                <option value="ALL">All tiers</option>
                {tierCounts.map(([tier, count]) => (
                  <option key={tier} value={String(tier)}>
                    Tier {tier} ({count})
                  </option>
                ))}
              </select>
              <select
                value={ageFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setAgeFilter(e.target.value as 'ALL' | 'SENIOR' | 'O21');
                  setClubPage(1);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(140, 213, 178, 0.5)',
                  background: 'rgba(0, 0, 0, 0.35)',
                  color: '#eafff3'
                }}
              >
                <option value="ALL">All squads</option>
                <option value="SENIOR">Senior</option>
                <option value="O21">O21</option>
              </select>
              <select
                value={divisionFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setDivisionFilter(e.target.value as 'ALL' | 'PRO' | 'AMATEUR');
                  setClubPage(1);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(140, 213, 178, 0.5)',
                  background: 'rgba(0, 0, 0, 0.35)',
                  color: '#eafff3'
                }}
              >
                <option value="ALL">All divisions</option>
                <option value="PRO">Professional</option>
                <option value="AMATEUR">Amateur</option>
              </select>
            </div>

            <select
              data-testid="new-career-club-select"
              value={controlledClubId ?? ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setControlledClubId(e.target.value ? Number(e.target.value) : null)}
              style={{
                display: 'block',
                width: '100%',
                marginTop: 8,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid rgba(140, 213, 178, 0.5)',
                background: 'rgba(0, 0, 0, 0.35)',
                color: '#eafff3'
              }}
            >
              <option value="">Select club</option>
              {visibleClubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {(club.divisionType ?? 'AMATEUR') === 'PRO' ? '[PRO] ' : '[AM] '}
                  {(club.ageCategory ?? 'SENIOR') === 'O21' ? '[O21] ' : ''}
                  {club.leagueTier ? `Tier ${club.leagueTier} - ` : ''}{club.name} ({club.leagueName})
                </option>
              ))}
            </select>
            <div style={{ marginTop: 6, fontSize: 12, color: '#bde8d2' }}>
              Showing {clubSliceBounds.from}-{clubSliceBounds.to} of {filteredClubs.length} filtered clubs ({clubs.length} total).
            </div>
            {clubsLoading && (
              <p data-testid="new-career-club-loading" style={{ marginTop: 8, marginBottom: 0, color: '#bee8d3', fontSize: 12 }}>
                Loading club list...
              </p>
            )}
            {clubsLoadError && (
              <p data-testid="new-career-club-error" style={{ marginTop: 8, marginBottom: 0, color: '#ffb9b9', fontSize: 12 }}>
                {clubsLoadError}
              </p>
            )}
            {!clubsLoading && !clubsLoadError && filteredClubs.length === 0 && (
              <div data-testid="new-career-club-empty" className="v2-panel v2-panel--warm" style={{ marginTop: 10, padding: 12 }}>
                <p className="v2-panel__title" style={{ marginBottom: 4 }}>No clubs match these filters.</p>
                <p className="v2-panel__subtitle">
                  Broaden the search or reset tier, squad, and division filters to see the full career list again.
                </p>
              </div>
            )}
            {filteredClubs.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setClubPage((page) => Math.max(1, page - 1))}
                  disabled={clubPage <= 1}
                  style={{
                    border: '1px solid rgba(132, 222, 181, 0.6)',
                    background: 'rgba(132, 222, 181, 0.2)',
                    color: '#e8fff3',
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: 12, color: '#bde8d2' }}>
                  Page {Math.max(1, Math.min(clubPage, totalClubPages))} / {totalClubPages}
                </span>
                <button
                  type="button"
                  onClick={() => setClubPage((page) => Math.min(totalClubPages, page + 1))}
                  disabled={clubPage >= totalClubPages}
                  style={{
                    border: '1px solid rgba(132, 222, 181, 0.6)',
                    background: 'rgba(132, 222, 181, 0.2)',
                    color: '#e8fff3',
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </label>

          <div
            data-testid="new-career-selected-club-panel"
            className={`v2-panel ${selectedClub ? 'v2-panel--soft' : 'v2-panel--warm'}`}
            style={{ marginBottom: 16 }}
          >
            <p className="v2-kicker" style={{ marginTop: 0, marginBottom: 6 }}>Selection Snapshot</p>
            {selectedClub ? (
              <>
                <h3 className="v2-panel__title" style={{ marginBottom: 4 }}>{selectedClub.name}</h3>
                <p className="v2-panel__subtitle">
                  {selectedClub.leagueName} {selectedClub.leagueTier ? `· Tier ${selectedClub.leagueTier}` : ''}
                </p>
                <div className="v2-chip-row" style={{ marginTop: 10 }}>
                  <span className="v2-chip">{selectedClub.divisionType === 'PRO' ? 'Professional' : 'Amateur'}</span>
                  <span className="v2-chip">{selectedClub.ageCategory === 'O21' ? 'O21 Squad' : 'Senior Squad'}</span>
                  <span className="v2-chip">Reputation {selectedClub.reputation}</span>
                </div>
              </>
            ) : (
              <>
                <p className="v2-panel__title" style={{ marginBottom: 4 }}>Choose a club to preview the save profile.</p>
                <p className="v2-panel__subtitle">
                  Use the filters to narrow the pyramid, then select the team you want to control before creating the career.
                </p>
              </>
            )}
          </div>

          <button
            data-testid="new-career-create-button"
            onClick={handleCreate}
            disabled={createDisabled}
            style={{
              border: 'none',
              borderRadius: 8,
              padding: '10px 16px',
              fontWeight: 700,
              cursor: 'pointer',
              background: '#7bd6ae',
              color: '#081910'
            }}
          >
            {loading ? 'Creating...' : 'Create Career'}
          </button>
          {createDisabled && !loading && (
            <p style={{ marginBottom: 0, color: '#bee8d3', fontSize: 12 }}>
              Enter a manager name and pick a club to unlock the career start.
            </p>
          )}

          {notice && <p style={{ color: '#9be7c3' }}>{notice}</p>}
          {error && <p style={{ color: '#ffb9b9' }}>{error}</p>}
        </div>

        <div style={{ background: 'rgba(8, 20, 14, 0.55)', border: '1px solid rgba(132, 222, 181, 0.35)', borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Existing Careers</h2>
          {careersLoading && careers.length === 0 && <p style={{ color: '#bee8d3' }}>Loading careers...</p>}
          {careersLoadError && (
            <p data-testid="new-career-careers-error" style={{ color: '#ffb9b9' }}>
              {careersLoadError}
            </p>
          )}
          {!careersLoading && !careersLoadError && careers.length === 0 && <p style={{ color: '#bee8d3' }}>No careers yet.</p>}
          {careers.length > 0 && (
            <label style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#bde8d2' }}>Find career</span>
              <input
                value={careerQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCareerQuery(e.target.value)}
                placeholder="Search manager, club, league, season"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '9px 11px',
                  borderRadius: 8,
                  border: '1px solid rgba(140, 213, 178, 0.5)',
                  background: 'rgba(0, 0, 0, 0.35)',
                  color: '#eafff3'
                }}
              />
            </label>
          )}
          <div style={{ display: 'grid', gap: 10 }}>
            {visibleCareers.map((career) => (
              <div key={career.id} style={{ border: '1px solid rgba(140, 213, 178, 0.3)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontWeight: 700 }}>{career.managerName}</div>
                <div style={{ fontSize: 13, color: '#d3f6e6' }}>
                  {career.controlledClubName || `Club #${career.controlledClubId}`}
                  {career.controlledLeagueName ? ` (${career.controlledLeagueName})` : ''}
                </div>
                <div style={{ fontSize: 13, color: '#bee8d3' }}>
                  Season {career.season} | Week {career.weekNumber} | {career.currentPhase}
                </div>
                <button
                  onClick={() => resumeCareer(career.id)}
                  style={{ marginTop: 8, border: '1px solid rgba(140, 213, 178, 0.6)', background: 'rgba(140, 213, 178, 0.18)', color: '#eafff3', padding: '7px 10px', borderRadius: 7, cursor: 'pointer' }}
                >
                  Resume
                </button>
                <button
                  onClick={() => handleDeleteCareer(career)}
                  disabled={deletingCareerId === career.id}
                  style={{
                    marginTop: 8,
                    marginLeft: 8,
                    border: '1px solid rgba(255, 138, 138, 0.6)',
                    background: 'rgba(255, 138, 138, 0.2)',
                    color: '#ffd8d8',
                    padding: '7px 10px',
                    borderRadius: 7,
                    cursor: 'pointer'
                  }}
                >
                  {deletingCareerId === career.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
          {filteredCareers.length > visibleCareers.length && (
            <p style={{ marginTop: 10, marginBottom: 0, color: '#bde8d2', fontSize: 12 }}>
              Showing {visibleCareers.length} of {filteredCareers.length} matching careers. Narrow search to find older saves.
            </p>
          )}
        </div>
      </section>
    </V2Shell>
  );
};

export default NewCareerPage;
