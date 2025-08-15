import React, { useEffect, useState } from 'react';
import { useManagerProfile } from '../context/ManagerProfileContext';
import { useResolvedClubId } from '../hooks/useResolvedClubId';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface RegulatoryWarning {
  id: number;
  issuedBy: string;
  reason: string;
  issuedAt: string;
  deadline: string;
  status: string;
  consequence: string;
}
interface Bailout {
  id: number;
  amount: number;
  date: string;
  type: string;
  status: string;
  conditions?: string;
}
interface BankruptcyEvent {
  id: number;
  date: string;
  reason: string;
  amount: number;
  resolved: boolean;
  resolutionDate?: string;
}

const CompliancePage: React.FC = () => {
  const { profile } = useManagerProfile();
  const { clubId, loading: clubIdLoading } = useResolvedClubId();
  const [status, setStatus] = useState<string>('');
  const [complianceDeadline, setComplianceDeadline] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<RegulatoryWarning[]>([]);
  const [bailouts, setBailouts] = useState<Bailout[]>([]);
  const [bankruptcies, setBankruptcies] = useState<BankruptcyEvent[]>([]);

  useEffect(() => {
    if (!clubId) return;
    fetch(`/api/regulatory/status/${clubId}`)
      .then(res => res.json())
      .then(data => {
        setStatus(data.status || '');
        setComplianceDeadline(data.complianceDeadline || null);
      });
    fetch(`/api/regulatory/warnings/${clubId}`)
      .then(res => res.json())
      .then(data => setWarnings(data.warnings || []));
    fetch(`/api/regulatory/bailouts/${clubId}`)
      .then(res => res.json())
      .then(data => setBailouts(data.bailouts || []));
    fetch(`/api/regulatory/bankruptcy/${clubId}`)
      .then(res => res.json())
      .then(data => setBankruptcies(data.events || []));
  }, [clubId]);

  if (!profile) return null;
  if (clubIdLoading) return <LoadingSpinner />;
  if (!clubId) return <ErrorMessage message="Club not found." />;

  return (
    <div className="compliance-page" style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1>Regulatory Compliance</h1>
      <section>
        <h2>Status</h2>
        <div>Status: <b>{status}</b></div>
        {complianceDeadline && <div>Compliance Deadline: {new Date(complianceDeadline).toLocaleDateString()}</div>}
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Regulatory Warnings</h2>
        {warnings.length === 0 ? <div>No warnings.</div> : (
          <ul>
            {warnings.map(w => (
              <li key={w.id}>
                <b>{w.issuedBy}</b>: {w.reason} (Issued: {new Date(w.issuedAt).toLocaleDateString()}, Deadline: {new Date(w.deadline).toLocaleDateString()})<br/>
                Status: {w.status}, Consequence: {w.consequence}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Government Bailouts</h2>
        {bailouts.length === 0 ? <div>No bailouts.</div> : (
          <ul>
            {bailouts.map(b => (
              <li key={b.id}>
                Amount: €{b.amount.toLocaleString()} ({b.type}) on {new Date(b.date).toLocaleDateString()}<br/>
                Status: {b.status}{b.conditions && <> | Conditions: {b.conditions}</>}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Bankruptcy Events</h2>
        {bankruptcies.length === 0 ? <div>No bankruptcy events.</div> : (
          <ul>
            {bankruptcies.map(e => (
              <li key={e.id}>
                Date: {new Date(e.date).toLocaleDateString()} | Reason: {e.reason} | Amount: €{e.amount?.toLocaleString?.() ?? 'N/A'}<br/>
                Resolved: {e.resolved ? 'Yes' : 'No'}{e.resolutionDate && <> | Resolution Date: {new Date(e.resolutionDate).toLocaleDateString()}</>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default CompliancePage; 