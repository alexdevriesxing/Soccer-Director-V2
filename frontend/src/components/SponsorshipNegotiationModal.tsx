import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';

export interface SponsorshipNegotiationForm {
  sponsor: string;
  amount: number;
  duration: number; // in years
  type: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: SponsorshipNegotiationForm) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const SponsorshipNegotiationModal: React.FC<Props> = ({ open, onClose, onSubmit, loading, error }) => {
  const [form, setForm] = useState<SponsorshipNegotiationForm>({
    sponsor: '',
    amount: 0,
    duration: 1,
    type: 'shirt',
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({ sponsor: '', amount: 0, duration: 1, type: 'shirt' });
      setSubmitError(null);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'amount' || name === 'duration' ? Number(value) : value }));
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!form.sponsor.trim() || !form.amount || !form.duration || form.amount < 1 || form.duration < 1) {
      setSubmitError('All fields are required and must be positive.');
      return;
    }
    try {
      await onSubmit(form);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to create sponsorship');
    }
  };

  if (!open) return null;

  return (
    <BaseModal open={open} onClose={onClose} ariaLabel="Negotiate New Sponsorship" maxWidth={480} minWidth={320}>
      <h2 style={{ marginBottom: 24, color: '#38bdf8' }}>Negotiate New Sponsorship</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Sponsor Name</label>
          <input name="sponsor" value={form.sponsor} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #334155', background:'#0f172a', color:'#fff' }} disabled={loading} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Amount (€)</label>
          <input name="amount" type="number" value={form.amount} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #334155', background:'#0f172a', color:'#fff' }} disabled={loading} min={1} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Duration (years)</label>
          <input name="duration" type="number" value={form.duration} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #334155', background:'#0f172a', color:'#fff' }} disabled={loading} min={1} max={5} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 4 }}>Type</label>
          <select name="type" value={form.type} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #334155', background:'#0f172a', color:'#fff' }} disabled={loading}>
            <option value="shirt">Shirt</option>
            <option value="stadium">Stadium</option>
            <option value="sleeve">Sleeve</option>
            <option value="other">Other</option>
          </select>
        </div>
        {(submitError || error) && <div style={{ color: '#ef4444', marginBottom: 12 }}>{submitError || error}</div>}
        <button type="submit" style={{ padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(90deg,#22d3ee,#4ade80)', color: '#1e293b', border: 'none', fontWeight: 700, cursor: 'pointer', width: '100%' }} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </BaseModal>
  );
};

export default SponsorshipNegotiationModal;
