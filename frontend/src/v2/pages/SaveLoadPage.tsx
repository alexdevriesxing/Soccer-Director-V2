import React, { useEffect, useMemo, useState } from 'react';
import V2Shell from '../components/V2Shell';
import { deleteCareer, loadSlot, saveSlot } from '../api';
import { clearActiveCareerId } from '../careerStore';
import { useActiveCareer } from '../useActiveCareer';

const SaveLoadPage: React.FC = () => {
  const MAX_VISIBLE_CAREERS = 18;
  const { careerId: activeCareerId, careers, resolving, resolveError, refreshCareers, setCareerId } = useActiveCareer();
  const [slotId, setSlotId] = useState('manual');
  const [careerQuery, setCareerQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingSlotKey, setLoadingSlotKey] = useState<string | null>(null);
  const [deletingCareerId, setDeletingCareerId] = useState<string | null>(null);

  useEffect(() => {
    refreshCareers().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Failed to list careers.');
    });
  }, [refreshCareers]);

  const handleSave = async () => {
    if (!activeCareerId) {
      setError('Select an active career first.');
      return;
    }
    if (!slotId.trim()) {
      setError('Slot ID is required.');
      return;
    }

    setMessage(null);
    setError(null);
    setSaving(true);
    try {
      await saveSlot(activeCareerId, slotId.trim());
      await refreshCareers();
      setMessage(`Saved slot "${slotId.trim()}".`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async (careerIdOverride?: string, slotOverride?: string) => {
    const targetCareerId = careerIdOverride ?? activeCareerId;
    const targetSlot = (slotOverride ?? slotId).trim();
    if (!targetCareerId) {
      setError('Select an active career first.');
      return;
    }
    if (!targetSlot) {
      setError('Slot ID is required.');
      return;
    }

    setMessage(null);
    setError(null);
    setLoadingSlotKey(`${targetCareerId}:${targetSlot}`);
    try {
      await loadSlot(targetCareerId, targetSlot);
      setCareerId(targetCareerId);
      await refreshCareers();
      setMessage(`Loaded slot "${targetSlot}".`);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Load failed.';
      setError(formatLoadError(raw));
    } finally {
      setLoadingSlotKey(null);
    }
  };

  const handleDeleteCareer = async (targetCareerId: string, managerName: string) => {
    const confirmed = window.confirm(
      `Delete career "${managerName}"?\n\nThis permanently removes the career and all save slots.`
    );
    if (!confirmed) {
      return;
    }

    setDeletingCareerId(targetCareerId);
    setMessage(null);
    setError(null);
    try {
      await deleteCareer(targetCareerId);
      const rows = await refreshCareers();

      if (activeCareerId === targetCareerId) {
        if (rows.length > 0) {
          setCareerId(rows[0].id);
        } else {
          clearActiveCareerId();
        }
      }

      setMessage(`Deleted career "${managerName}".`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete career.');
    } finally {
      setDeletingCareerId(null);
    }
  };

  const selectCareer = (nextCareerId: string) => {
    setCareerId(nextCareerId);
    const selected = careers.find((career) => career.id === nextCareerId);
    const preferredSlot = selected?.saveSlots?.find((slot) => !slot.isAuto)?.slotName || selected?.saveSlots?.[0]?.slotName;
    if (preferredSlot) {
      setSlotId(preferredSlot);
    }
    setMessage('Active career selected.');
  };

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

  const activeCareer = useMemo(
    () => careers.find((career) => career.id === activeCareerId) ?? null,
    [activeCareerId, careers]
  );

  return (
    <V2Shell title="Save / Load">
      <section style={{ display: 'grid', gap: 12, gridTemplateColumns: 'minmax(280px, 420px) 1fr' }}>
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Save Slot</h3>
          <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
            Slot ID
            <input
              data-testid="save-load-slot-input"
              value={slotId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlotId(e.target.value)}
              style={inputStyle}
            />
          </label>
          {activeCareer && (
            <div style={{ marginBottom: 10, fontSize: 13, color: '#cfeee0' }}>
              Active: <b>{activeCareer.managerName}</b> ({activeCareer.controlledClubName || `Club #${activeCareer.controlledClubId}`})
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button data-testid="save-load-save-button" style={btnPrimary} onClick={handleSave} disabled={saving || !!loadingSlotKey}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button data-testid="save-load-load-button" style={btnGhost} onClick={() => handleLoad()} disabled={saving || !!loadingSlotKey}>
              {loadingSlotKey ? 'Loading...' : 'Load'}
            </button>
            <button
              data-testid="save-load-new-slot-button"
              style={btnGhost}
              onClick={() => setSlotId(`manual-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}`)}
              disabled={saving || !!loadingSlotKey}
            >
              New Slot ID
            </button>
          </div>
          <p style={{ color: '#bde8d2' }}>Autosave is maintained separately as `autosave`.</p>
          {activeCareer?.saveSlots && activeCareer.saveSlots.length > 0 && (
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ fontSize: 12, color: '#bde8d2' }}>Active career slot history</div>
              {activeCareer.saveSlots.map((slot) => {
                const slotKey = `${activeCareer.id}:${slot.slotName}`;
                const slotIsLoading = loadingSlotKey === slotKey;
                return (
                  <div key={slotKey} style={slotRow}>
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {slot.slotName}
                        {slot.isAuto ? ' [AUTO]' : ''}
                      </div>
                      <div style={{ fontSize: 12, color: '#bde8d2' }}>
                        {formatDate(slot.updatedAt)} | Hash {shortHash(slot.stateHash)}
                      </div>
                    </div>
                    <button
                      style={btnGhost}
                      onClick={() => handleLoad(activeCareer.id, slot.slotName)}
                      disabled={saving || !!loadingSlotKey}
                    >
                      {slotIsLoading ? 'Loading...' : 'Load'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {resolving && <p style={{ color: '#bde8d2' }}>Resolving active career...</p>}
          {resolveError && <p style={{ color: '#ffb9b9' }}>{resolveError}</p>}
          {message && <p data-testid="save-load-message" style={{ color: '#9be7c3' }}>{message}</p>}
          {error && <p data-testid="save-load-error" style={{ color: '#ffb9b9' }}>{error}</p>}
          {error && isLoadIntegrityError(error) && (
            <div data-testid="save-load-integrity-hint" style={integrityHint}>
              Tip: try loading `autosave` or another manual slot.
            </div>
          )}
        </div>

        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Careers</h3>
          {careers.length > 0 && (
            <label style={{ display: 'grid', gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#bde8d2' }}>Find career</span>
              <input
                data-testid="save-load-career-query"
                value={careerQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCareerQuery(e.target.value)}
                placeholder="Search manager, club, league, season"
                style={inputStyle}
              />
            </label>
          )}
          <div style={{ display: 'grid', gap: 10 }}>
            {visibleCareers.map((career) => (
              <div key={career.id} data-testid="save-load-career-card" style={{ border: '1px solid rgba(132, 222, 181, 0.35)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontWeight: 700 }}>{career.managerName}</div>
                <div style={{ fontSize: 13, color: '#d3f6e6' }}>
                  {career.controlledClubName || `Club #${career.controlledClubId}`}
                  {career.controlledLeagueName ? ` (${career.controlledLeagueName})` : ''}
                </div>
                <div style={{ fontSize: 13, color: '#bde8d2' }}>
                  Season {career.season} | Week {career.weekNumber} | {career.currentPhase}
                </div>
                <button
                  data-testid={activeCareerId === career.id ? 'save-load-active-career-button' : 'save-load-set-active-button'}
                  style={activeCareerId === career.id ? btnPrimary : btnGhost}
                  onClick={() => selectCareer(career.id)}
                >
                  {activeCareerId === career.id ? 'Active' : 'Set Active'}
                </button>
                <button
                  data-testid="save-load-delete-career-button"
                  style={{ ...btnDanger, marginLeft: 8 }}
                  onClick={() => handleDeleteCareer(career.id, career.managerName)}
                  disabled={deletingCareerId === career.id}
                >
                  {deletingCareerId === career.id ? 'Deleting...' : 'Delete'}
                </button>
                {career.saveSlots && career.saveSlots.length > 0 && (
                  <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                    {career.saveSlots.slice(0, 3).map((slot) => {
                      const slotKey = `${career.id}:${slot.slotName}`;
                      const slotIsLoading = loadingSlotKey === slotKey;
                      return (
                        <div key={slotKey} data-testid="save-load-slot-row" style={slotRowCompact}>
                          <div style={{ fontSize: 12, color: '#d3f6e6' }}>
                            {slot.slotName}
                            {slot.isAuto ? ' [AUTO]' : ''}
                          </div>
                          <button
                            data-testid="save-load-slot-row-button"
                            style={btnGhostCompact}
                            onClick={() => handleLoad(career.id, slot.slotName)}
                            disabled={saving || !!loadingSlotKey}
                          >
                            {slotIsLoading ? 'Loading...' : 'Load'}
                          </button>
                        </div>
                      );
                    })}
                    {career.saveSlots.length > 3 && (
                      <div style={{ fontSize: 11, color: '#bde8d2' }}>
                        +{career.saveSlots.length - 3} more slots
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {filteredCareers.length > visibleCareers.length && (
            <p style={{ marginTop: 10, marginBottom: 0, color: '#bde8d2', fontSize: 12 }}>
              Showing {visibleCareers.length} of {filteredCareers.length} matching careers.
            </p>
          )}
        </div>
      </section>
    </V2Shell>
  );
};

const card: React.CSSProperties = {
  background: 'rgba(8, 20, 14, 0.55)',
  border: '1px solid rgba(132, 222, 181, 0.35)',
  borderRadius: 12,
  padding: 14
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.35)',
  color: '#effff6',
  border: '1px solid rgba(132, 222, 181, 0.5)',
  borderRadius: 8,
  padding: '8px 10px'
};

const btnPrimary: React.CSSProperties = {
  border: 'none',
  background: '#72d7ab',
  color: '#0a2017',
  borderRadius: 8,
  padding: '8px 12px',
  fontWeight: 700,
  cursor: 'pointer'
};

const btnGhost: React.CSSProperties = {
  border: '1px solid rgba(132, 222, 181, 0.6)',
  background: 'rgba(132, 222, 181, 0.2)',
  color: '#e8fff3',
  borderRadius: 8,
  padding: '8px 12px',
  fontWeight: 700,
  cursor: 'pointer'
};

const btnGhostCompact: React.CSSProperties = {
  ...btnGhost,
  padding: '4px 8px',
  fontSize: 12
};

const btnDanger: React.CSSProperties = {
  border: '1px solid rgba(255, 138, 138, 0.6)',
  background: 'rgba(255, 138, 138, 0.2)',
  color: '#ffd8d8',
  borderRadius: 8,
  padding: '8px 12px',
  fontWeight: 700,
  cursor: 'pointer'
};

const slotRow: React.CSSProperties = {
  border: '1px solid rgba(132, 222, 181, 0.28)',
  borderRadius: 8,
  padding: 8,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 8
};

const slotRowCompact: React.CSSProperties = {
  border: '1px solid rgba(132, 222, 181, 0.22)',
  borderRadius: 8,
  padding: '6px 7px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 8
};

function formatDate(value: string | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
}

function shortHash(value: string | undefined): string {
  if (!value) return '-';
  return value.slice(0, 8);
}

function formatLoadError(raw: string): string {
  const normalized = raw.toLowerCase();
  if (normalized.includes('integrity check failed') || normalized.includes('hash mismatch')) {
    return 'This save slot failed integrity validation and was not loaded.';
  }
  if (normalized.includes('snapshot is malformed')) {
    return 'This save slot is damaged and cannot be loaded.';
  }
  return raw;
}

function isLoadIntegrityError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes('integrity') || normalized.includes('damaged');
}

const integrityHint: React.CSSProperties = {
  marginTop: 8,
  border: '1px solid rgba(255, 179, 138, 0.55)',
  background: 'rgba(255, 179, 138, 0.12)',
  color: '#ffd2b7',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 12
};

export default SaveLoadPage;
