/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchFinancialRecords, createSponsorship, updateClubFinances, deleteClubFinances, updateSponsorship, deleteSponsorship, fetchSponsorships } from '../api/financeApi';
import SponsorshipsModal from '../components/SponsorshipsModal';
import SponsorshipNegotiationModal from '../components/SponsorshipNegotiationModal';
import IncomeExpenseBreakdownModal from '../components/IncomeExpenseBreakdownModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useResolvedClubId } from '../hooks/useResolvedClubId';

const isAdmin = true; // Hardcoded admin flag for demo

interface FinancialRecord {
  id: number;
  type: string; // 'transaction', 'sponsorship', 'loan', etc.
  category: string;
  amount: number;
  date: string;
  description: string;
}

export const FinancesPage: React.FC = () => {
  const navigate = useNavigate();
  const { clubId, loading: clubIdLoading } = useResolvedClubId();

  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editRecord, setEditRecord] = useState<FinancialRecord | null>(null);
  // Filtering state
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  // Sorting state
  const [sortField, setSortField] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [recordType, setRecordType] = useState('transaction');
  const [recordCategory, setRecordCategory] = useState('');
  const [recordAmount, setRecordAmount] = useState(0);
  const [recordDate, setRecordDate] = useState('');
  const [recordDescription, setRecordDescription] = useState('');
  const [savingRecord, setSavingRecord] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSponsorships, setShowSponsorships] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [negotiateLoading, setNegotiateLoading] = useState(false);
  const [negotiateError, setNegotiateError] = useState<string | null>(null);
  const [sponsorships, setSponsorships] = useState<any[]>([]);
  const [sponsorshipsLoading, setSponsorshipsLoading] = useState(false);
  const [sponsorshipsError, setSponsorshipsError] = useState<string | null>(null);
  const [sponsorshipSuccess, setSponsorshipSuccess] = useState<string | null>(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Reset to page 1 on filter/sort change
  React.useEffect(() => { setCurrentPage(1); }, [filterType, filterCategory, filterStartDate, filterEndDate, sortField, sortOrder]);

  // Pagination helpers
  const handleExportCSV = () => { /* TODO: implement CSV export */ };
  const paginate = (arr: any[], page: number, perPage: number) => arr.slice((page - 1) * perPage, page * perPage);
  const getFilteredSortedRecords = () =>
    records.filter(r => {
      if (filterType === 'income' && r.amount < 0) return false;
      if (filterType === 'expense' && r.amount >= 0) return false;
      if (filterCategory !== 'all' && r.category !== filterCategory) return false;
      if (filterStartDate && r.date < filterStartDate) return false;
      if (filterEndDate && r.date > filterEndDate) return false;
      return true;
    })
    .sort((a, b) => {
      let valA, valB;
      if (sortField === 'amount') {
        valA = a.amount;
        valB = b.amount;
      } else if (sortField === 'category') {
        valA = a.category.toLowerCase();
        valB = b.category.toLowerCase();
      } else {
        valA = a.date;
        valB = b.date;
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  const filteredSortedRecords = getFilteredSortedRecords();
  const pagedRecords = paginate(filteredSortedRecords, currentPage, recordsPerPage);
  const totalPages = Math.ceil(filteredSortedRecords.length / recordsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleNegotiateSponsorship = () => {
    setShowNegotiateModal(true);
    setNegotiateError(null);
    setSponsorshipSuccess(null);
  };

  const handleSubmitNegotiation = async (form: any) => {
    setNegotiateLoading(true);
    setNegotiateError(null);
    try {
      if (!clubId) throw new Error('Club ID is required');
      await createSponsorship({
        clubId,
        sponsorName: form.sponsor,
        value: form.amount,
        duration: form.duration,
        type: form.type
      });
      setShowNegotiateModal(false);
      setShowSponsorships(true);
      setSponsorshipSuccess('Sponsorship created successfully!');
      // Refresh sponsorships
      fetchSponsorships(clubId).then(setSponsorships);
    } catch (e: any) {
      setNegotiateError(e.message || 'Failed to create sponsorship');
    } finally {
      setNegotiateLoading(false);
    }
  };
  const handleDeleteSponsorship = async (id: number) => {
    try {
      setSponsorshipsLoading(true);
      setSponsorshipsError(null);
      await deleteSponsorship(id);
      setSponsorships(sponsorships.filter(s => s.id !== id));
    } catch (e: any) {
      setSponsorshipsError(e.message || 'Failed to delete sponsorship');
    } finally {
      setSponsorshipsLoading(false);
    }
  };
  React.useEffect(() => {
    if (!clubId) return;
    setSponsorshipsLoading(true);
    setSponsorshipsError(null);
    fetchSponsorships(clubId)
      .then(setSponsorships)
      .catch((e: any) => setSponsorshipsError(e.message || 'Failed to load sponsorships'))
      .finally(() => setSponsorshipsLoading(false));
  }, [clubId]);

  const fetchRecords = React.useCallback(async () => {
    if (clubId == null) return;
    setSavingRecord(true);
    setError(null);
    try {
      const data = await fetchFinancialRecords(clubId);
      // Map backend ClubFinances to FinancialRecord UI type
      // Helper to map backend record to user-friendly category
      const mapCategory = (item: any): string => {
        if (item.type === 'sponsorship' || item.category === 'sponsorship') return 'Sponsorships';
        if (item.type === 'ticket' || /ticket/i.test(item.description)) return 'Ticket Sales';
        if (item.type === 'merchandise' || /merchandise/i.test(item.description)) return 'Merchandise';
        if (item.type === 'tv' || /tv/i.test(item.description)) return 'TV Revenue';
        if (item.type === 'player_sale' || /player sale/i.test(item.description)) return 'Player Sales';
        if (item.type === 'wages' || /wage/i.test(item.description)) return 'Wages';
        if (item.type === 'transfer' || /transfer/i.test(item.description)) return 'Transfers';
        if (item.type === 'facilities' || /facility/i.test(item.description)) return 'Facilities';
        if (item.type === 'youth' || /youth/i.test(item.description)) return 'Youth Academy';
        if (item.type === 'prize' || /prize/i.test(item.description)) return 'Prize Money';
        return item.category || 'Other';
      };
      const mapped = data.map((item: any) => ({
        id: item.id,
        type: item.type || 'transaction',
        category: mapCategory(item),
        amount: item.balance,
        date: item.season + '-W' + item.week,
        description: item.description || 'Club finances record'
      }));
      setRecords(mapped);
    } catch (e: any) {
      setError(e.message || 'Failed to load records');
    } finally {
      setSavingRecord(false);
    }
  }, [clubId]);

  React.useEffect(() => {
    if (!clubId) return;
    fetchRecords();
  }, [clubId, fetchRecords]);

  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found." />;

  const financialData = {
    balance: 2500000,
    income: {
      matchday: 450000,
      sponsorship: 800000,
      tv: 1200000,
      merchandise: 150000,
      playerSales: 500000
    },
    expenses: {
      wages: 1800000,
      transfers: 300000,
      facilities: 200000,
      youth: 100000,
      other: 150000
    }
  };

  const totalIncome = Object.values(financialData.income).reduce((a, b) => a + b, 0);
  const totalExpenses = Object.values(financialData.expenses).reduce((a, b) => a + b, 0);
  const netIncome = totalIncome - totalExpenses;

  // Replace fetchRecords with real API call

  // CRUD handlers
  const openAddRecord = () => {
    setEditRecord(null);
    setRecordType('transaction');
    setRecordCategory('');
    setRecordAmount(0);
    setRecordDate('');
    setRecordDescription('');
    setShowRecordModal(true);
    setError(null);
  };
  const openEditRecord = (r: FinancialRecord) => {
    setEditRecord(r);
    setRecordType(r.type);
    setRecordCategory(r.category);
    setRecordAmount(r.amount);
    setRecordDate(r.date);
    setRecordDescription(r.description);
    setShowRecordModal(true);
    setError(null);
  };
  const closeRecordModal = () => {
    setShowRecordModal(false);
    setEditRecord(null);
    setRecordType('transaction');
    setRecordCategory('');
    setRecordAmount(0);
    setRecordDate('');
    setRecordDescription('');
    setError(null);
  };
  // Update handleSaveRecord to use API
  const handleSaveRecord = async () => {
    setSavingRecord(true);
    setError(null);
    try {
      if (editRecord) {
        // PATCH: update ClubFinances or Sponsorship
        if (editRecord.type === 'sponsorship') {
          await updateSponsorship(editRecord.id, {
            sponsorName: recordCategory,
            value: recordAmount,
            // Add other fields as needed
          });
        } else {
          await updateClubFinances(editRecord.id, {
            balance: recordAmount,
            // Add other fields as needed
          });
        }
        await fetchRecords();
      } else {
        // POST: create new Sponsorship (as example)
        if (recordType === 'sponsorship') {
          await createSponsorship({
            clubId: clubId, // TODO: dynamic
            sponsorName: recordCategory,
            type: 'shirt',
            value: recordAmount,
            duration: 1
          });
          await fetchRecords();
        } else {
          // For other types, show error or implement as needed
          setError('Only sponsorship creation is supported in this demo.');
        }
      }
      closeRecordModal();
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setSavingRecord(false);
    }
  };
  // Update handleDeleteRecord to use API
  const handleDeleteRecord = async (id: number) => {
    setError(null);
    try {
      // For demo, assume transaction = ClubFinances, sponsorship = Sponsorship
      const rec = records.find(r => r.id === id);
      if (rec?.type === 'sponsorship') {
        await deleteSponsorship(id);
      } else {
        await deleteClubFinances(id);
      }
      await fetchRecords();
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Financial Center</h1>
        <div className="flex gap-4 mb-6">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setShowSponsorships(true)}
          >
            View Sponsorships
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={() => setShowNegotiateModal(true)}
          >
            Negotiate Sponsorship
          </button>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            onClick={() => setShowBreakdown(true)}
          >
            Income/Expense Breakdown
          </button>
        </div>
        {/* ... (existing financial tables, summaries, etc. would go here) ... */}
      </div>
      {/* Sponsorships Modal */}
      <SponsorshipsModal
        open={showSponsorships}
        onClose={() => setShowSponsorships(false)}
        sponsorships={sponsorships}
        loading={sponsorshipsLoading}
        error={sponsorshipsError}
        onDelete={handleDeleteSponsorship}
        onNegotiate={() => setShowNegotiateModal(true)}
      />
      {/* Sponsorship Negotiation Modal */}
      <SponsorshipNegotiationModal
        open={showNegotiateModal}
        onClose={() => setShowNegotiateModal(false)}
        loading={negotiateLoading}
        error={negotiateError}
        onSubmit={handleSubmitNegotiation}
      />
      {/* Income/Expense Breakdown Modal */}
      <IncomeExpenseBreakdownModal
        open={showBreakdown}
        onClose={() => setShowBreakdown(false)}
        income={Object.entries(financialData.income).map(([category, amount]) => ({ category, amount }))}
        expenses={Object.entries(financialData.expenses).map(([category, amount]) => ({ category, amount }))}
      />
    </div>
  );
}
