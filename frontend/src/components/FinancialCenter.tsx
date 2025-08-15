import React, { useState } from 'react';
import SponsorshipsModal from './SponsorshipsModal';
import IncomeExpenseBreakdownModal from './IncomeExpenseBreakdownModal';

// Mock data for sponsorships
const mockSponsorships = [
  { id: 1, sponsor: 'Nike', amount: 1200000, expires: '2026-06-30' },
  { id: 2, sponsor: 'Rabobank', amount: 800000, expires: '2025-12-31' },
];

// Mock data for income/expense breakdown
const incomeExpenseData = {
  income: [
    { category: 'Matchday Revenue', amount: 500000 },
    { category: 'Broadcasting', amount: 300000 },
    { category: 'Commercial', amount: 200000 },
  ],
  expenses: [
    { category: 'Player Wages', amount: 400000 },
    { category: 'Staff Wages', amount: 100000 },
    { category: 'Facility Costs', amount: 150000 },
  ],
};

interface FinancialSummary {
  budget: number;
  income: number;
  expenses: number;
  sponsorships: number;
  ticketSales: number;
  merchandise: number;
  prizeMoney: number;
}

const sampleData: FinancialSummary = {
  budget: 12000000,
  income: 4500000,
  expenses: 3200000,
  sponsorships: 1500000,
  ticketSales: 1000000,
  merchandise: 500000,
  prizeMoney: 1500000,
};

const FinancialCenter: React.FC = () => {
  const [summary] = useState<FinancialSummary>(sampleData);

  const [showSponsorships, setShowSponsorships] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <div style={{ background: '#1e293b', color: '#fff', borderRadius: 12, padding: 24, maxWidth: 600, margin: '32px auto', boxShadow: '0 4px 24px #0002' }}>
      <h2 style={{ color: '#38bdf8', marginBottom: 24 }}>Financial Center</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div><strong>Budget:</strong> €{summary.budget.toLocaleString()}</div>
        <div><strong>Total Income:</strong> €{summary.income.toLocaleString()}</div>
        <div style={{ marginLeft: 16, color: '#a7f3d0' }}>- Sponsorships: €{summary.sponsorships.toLocaleString()}</div>
        <div style={{ marginLeft: 16, color: '#a7f3d0' }}>- Ticket Sales: €{summary.ticketSales.toLocaleString()}</div>
        <div style={{ marginLeft: 16, color: '#a7f3d0' }}>- Merchandise: €{summary.merchandise.toLocaleString()}</div>
        <div style={{ marginLeft: 16, color: '#a7f3d0' }}>- Prize Money: €{summary.prizeMoney.toLocaleString()}</div>
        <div><strong>Total Expenses:</strong> €{summary.expenses.toLocaleString()}</div>
      </div>
      <div style={{ marginTop: 32 }}>
        <button onClick={() => setShowSponsorships(true)} style={{ padding: '10px 24px', borderRadius: 8, background: '#38bdf8', color: '#1e293b', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
          Manage Sponsorships
        </button>
        <button onClick={() => setShowBreakdown(true)} style={{ marginLeft: 16, padding: '10px 24px', borderRadius: 8, background: '#22d3ee', color: '#1e293b', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
          View Income/Expense Breakdown
        </button>
      </div>
      <SponsorshipsModal 
        open={showSponsorships} 
        onClose={() => setShowSponsorships(false)}
        sponsorships={mockSponsorships}
        onNegotiate={() => console.log('Negotiate clicked')}
        onDelete={(id) => console.log('Delete sponsorship', id)}
        loading={false}
        error={null}
      />
      <IncomeExpenseBreakdownModal 
        open={showBreakdown} 
        onClose={() => setShowBreakdown(false)}
        income={incomeExpenseData.income}
        expenses={incomeExpenseData.expenses}
      />
    </div>
  );
};

export default FinancialCenter;
