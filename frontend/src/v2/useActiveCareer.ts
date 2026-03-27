import { useCallback, useEffect, useRef, useState } from 'react';
import { listCareers } from './api';
import {
  clearActiveCareerId,
  getActiveCareerId,
  setActiveCareerId,
  subscribeActiveCareer
} from './careerStore';
import { CareerSummary } from './types';

interface UseActiveCareerOptions {
  autoResolve?: boolean;
}

interface UseActiveCareerResult {
  careerId: string | null;
  careers: CareerSummary[];
  resolving: boolean;
  resolveError: string | null;
  refreshCareers: () => Promise<CareerSummary[]>;
  setCareerId: (careerId: string) => void;
  clearCareerId: () => void;
}

export function useActiveCareer(options: UseActiveCareerOptions = {}): UseActiveCareerResult {
  const { autoResolve = true } = options;
  const [careerId, setCareerIdState] = useState<string | null>(() => getActiveCareerId());
  const [careers, setCareers] = useState<CareerSummary[]>([]);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const validatedCareerIdRef = useRef<string | null>(null);

  useEffect(() => {
    return subscribeActiveCareer(() => {
      setCareerIdState(getActiveCareerId());
    });
  }, []);

  const refreshCareers = useCallback(async () => {
    const rows = await listCareers();
    setCareers(rows);
    return rows;
  }, []);

  useEffect(() => {
    if (!autoResolve) {
      return;
    }
    if (careerId && validatedCareerIdRef.current === careerId) {
      return;
    }

    let cancelled = false;
    setResolving(true);
    setResolveError(null);

    refreshCareers()
      .then((rows) => {
        if (cancelled) {
          return;
        }
        if (rows.length === 0) {
          if (careerId) {
            clearActiveCareerId();
          }
          validatedCareerIdRef.current = null;
          return;
        }

        if (!careerId) {
          setActiveCareerId(rows[0].id);
          validatedCareerIdRef.current = rows[0].id;
          return;
        }

        const stillExists = rows.some((row) => row.id === careerId);
        if (!stillExists) {
          setActiveCareerId(rows[0].id);
          validatedCareerIdRef.current = rows[0].id;
          return;
        }

        validatedCareerIdRef.current = careerId;
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        setResolveError(error instanceof Error ? error.message : 'Failed to resolve active career.');
      })
      .finally(() => {
        if (!cancelled) {
          setResolving(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [autoResolve, careerId, refreshCareers]);

  const setCareerId = useCallback((nextCareerId: string) => {
    setResolveError(null);
    setActiveCareerId(nextCareerId);
  }, []);

  const clearCareerId = useCallback(() => {
    clearActiveCareerId();
  }, []);

  return {
    careerId,
    careers,
    resolving,
    resolveError,
    refreshCareers,
    setCareerId,
    clearCareerId
  };
}
