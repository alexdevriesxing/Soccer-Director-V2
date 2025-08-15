import React, { useState } from 'react';

interface Player {
  id: string;
  name: string;
  club: string;
  value: number;
}

interface TransferOfferModalProps {
  open: boolean;
  onClose: () => void;
  player: Player | null;
  onSubmit: (offer: { amount: number }) => void;
}

const TransferOfferModal: React.FC<TransferOfferModalProps> = ({ open, onClose, player, onSubmit }) => {
  const modalRef = React.useRef<HTMLFormElement>(null);
  // Focus trap and Escape key
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          (first as HTMLElement).focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          (last as HTMLElement).focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    setTimeout(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      }
    }, 50);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);
  // Overlay click to close
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const [amount, setAmount] = useState(player ? player.value : 0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !player) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (amount <= 0) throw new Error('Offer amount must be positive.');
      await onSubmit({ amount });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit offer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Make Offer for ${player.name}`}
      tabIndex={-1}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(17,24,39,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s',
        backdropFilter: 'blur(2.5px)',
      }}
      onClick={handleOverlayClick}
    >
      <form
        ref={modalRef}
        onSubmit={handleSubmit}
        style={{
          background: '#1e293b',
          borderRadius: 20,
          padding: 32,
          minWidth: 320,
          maxWidth: 480,
          width: '90vw',
          boxShadow: '0 8px 32px #22d3ee44',
          color: '#fff',
          position: 'relative',
          animation: 'fadeInScale 0.25s cubic-bezier(.4,2,.6,1)',
        }}
      >
        <style>{`
          @keyframes fadeInScale {
            0% { opacity: 0; transform: scale(0.92); }
            100% { opacity: 1; transform: scale(1); }
          }
          .modal-close-btn:focus { outline: 2px solid #38bdf8; }
        `}</style>
        {/* Close button top-right */}
        <button
          onClick={onClose}
          aria-label="Close"
          type="button"
          className="modal-close-btn"
          style={{
            position: 'absolute',
            top: 14,
            right: 18,
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: 28,
            fontWeight: 700,
            cursor: 'pointer',
            opacity: 0.8,
            zIndex: 1,
            lineHeight: 1,
          }}
        >
          ×
        </button>
        <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Make Offer for {player.name}</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Offer Amount (€)</label>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #334155', fontSize: 18 }}
            disabled={submitting}
          />
        </div>
        {error && <div style={{ color: '#f87171', marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button type="button" onClick={onClose} style={{ background: '#334155', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: 'pointer' }} disabled={submitting}>Cancel</button>
          <button type="submit" style={{ background: 'linear-gradient(90deg,#22d3ee,#4ade80)', color: '#111827', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px #22d3ee44' }} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Offer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransferOfferModal; 