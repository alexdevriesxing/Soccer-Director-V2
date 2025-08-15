import { useState, useEffect, useCallback } from 'react';
import { getTransferMarketPlayers } from '../api/footballApi';
import { TransferMarketPlayer } from '../types';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Custom React hook for managing transfer market data, filtering, pagination, and loading/error state.
 * Encapsulates all business/data logic for the TransferMarketTable UI component.
 *
 * @returns {object} State and handlers for transfer market UI:
 *   - players: array of TransferMarketPlayer
 *   - filter, setFilter: string and setter
 *   - page, setPage: number and setter
 *   - pageSize, setPageSize: number and setter
 *   - totalPlayers, totalPages: numbers
 *   - loading: boolean
 *   - error: string or null
 *   - PAGE_SIZE_OPTIONS: array of page size options
 */
export default function useTransferMarket() {
  const [players, setPlayers] = useState<TransferMarketPlayer[]>([]);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlayers = useCallback(() => {
    setLoading(true);
    setError(null);
    getTransferMarketPlayers()
      .then((data: any) => {
        setPlayers(data.players || []);
        setTotalPlayers(data.totalPlayers || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, pageSize, filter]);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  return {
    players,
    filter,
    setFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPlayers,
    totalPages,
    loading,
    error,
    PAGE_SIZE_OPTIONS
  };
} 