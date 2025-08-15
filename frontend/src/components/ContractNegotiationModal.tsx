import React, { useState } from 'react';

interface ContractOffer {
  wage?: number;
  contractStart?: string;
  contractExpiry?: string;
  goalBonus?: number;
  appearanceBonus?: number;
  promotionBonus?: number;
  releaseClause?: number;
  buyoutClause?: number;
  optionalExtension?: boolean;
  agentName?: string;
  agentFee?: number;
}

interface ContractNegotiationModalProps {
  open: boolean;
  onClose: () => void;
  player: { id: number; name: string };
  pendingOffer?: ContractOffer;
  onOffer: (offer: ContractOffer) => void;
  onAccept: () => void;
  onReject: () => void;
  onCounter: (offer: ContractOffer) => void;
}

const ContractNegotiationModal: React.FC<ContractNegotiationModalProps> = ({ open, onClose, player, pendingOffer, onOffer, onAccept, onReject, onCounter }) => {
  const [form, setForm] = useState<ContractOffer>({});
  const modalRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
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
        const focusable = modalRef.current.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        focusable?.focus();
      }
    }, 50);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value === '' ? undefined : isNaN(Number(value)) ? value : Number(value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOffer(form);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Contract Negotiation for ${player.name}`}
      tabIndex={-1}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(17,24,39,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s',
        backdropFilter: 'blur(2.5px)',
      }}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        style={{
          background: '#1e293b',
          color: '#fff',
          borderRadius: 20,
          padding: 32,
          minWidth: 320,
          maxWidth: 480,
          width: '95vw',
          boxShadow: '0 8px 32px #22d3ee44',
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
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>Negotiate Contract for {player.name}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: 12 }}>
            <label>Wage: <input name="wage" type="number" value={form.wage ?? ''} onChange={handleChange} style={{ borderRadius: 8, padding: 8, background: '#0f172a', color: '#fff', border: '1px solid #334155' }} /></label>
            <label>Start: <input name="contractStart" type="date" value={form.contractStart ?? ''} onChange={handleChange} style={{ borderRadius: 8, padding: 8, background: '#0f172a', color: '#fff', border: '1px solid #334155' }} /></label>
            <label>Expiry: <input name="contractExpiry" type="date" value={form.contractExpiry ?? ''} onChange={handleChange} style={{ borderRadius: 8, padding: 8, background: '#0f172a', color: '#fff', border: '1px solid #334155' }} /></label>
            <label>Goal Bonus: <input name="goalBonus" type="number" value={form.goalBonus ?? ''} onChange={handleChange} style={{ borderRadius: 8, padding: 8, background: '#0f172a', color: '#fff', border: '1px solid #334155' }} /></label>
            <label>Appearance Bonus: <input name="appearanceBonus" type="number" value={form.appearanceBonus ?? ''} onChange={handleChange} style={{ borderRadius: 8, padding: 8, background: '#0f172a', color: '#fff', border: '1px solid #334155' }} /></label>
            <label>Promotion Bonus: <input name="promotionBonus" type="number" value={form.promotionBonus ?? ''} onChange={handleChange} style={{ borderRadius: 8, padding: 8, background: '#0f172a', color: '#fff', border: '1px solid #334155' }} /></label>
            <label>Release Clause: <input name="releaseClause" type="number" value={form.releaseClause ?? ''} onChange={handleChange} style={{ borderRadius: 8, padding: 8, background: '#0f172a', color: '#fff', border: '1px solid #334155' }} /></label>
            <label>Buyout Clause: <input name="buyoutClause" type="number" value={form.buyoutClause ?? ''} onChange={handleChange} style={{ borderRadius: 8, padding: 8, background: '#0f172a', color: '#fff', border: '1px solid #334155' }} /></label>
            <label>Optional Extension: <input name="optionalExtension" type="checkbox" checked={form.optionalExtension ?? false} onChange={handleChange} style={{ marginLeft: 8 }} /></label>
            <label>Agent Name: <input name="agentName" type="text" value={form.agentName ?? ''} onChange={handleChange} style={{ borderRadius: 8, padding: 8, background: '#0f172a', color: '#fff', border: '1px solid #334155' }} /></label>
            <label>Agent Fee: <input name="agentFee" type="number" value={form.agentFee ?? ''} onChange={handleChange} style={{ borderRadius: 8, padding: 8, background: '#0f172a', color: '#fff', border: '1px solid #334155' }} /></label>
          </div>
          <button type="submit" style={{ marginTop: 18, padding: '8px 20px', borderRadius: 8, background: '#38bdf8', color: '#1e293b', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Propose Offer</button>
        </form>
        {pendingOffer && (
          <div style={{marginTop: 32}}>
            <h3 style={{ color: '#22d3ee', fontWeight: 700, marginBottom: 8 }}>Pending Offer</h3>
            <pre style={{fontSize: '0.95em', background: '#0f172a', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 12}}>{JSON.stringify(pendingOffer, null, 2)}</pre>
            <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <button onClick={onAccept} style={{ padding: '8px 18px', borderRadius: 8, background: '#4ade80', color: '#1e293b', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Accept</button>
              <button onClick={onReject} style={{ padding: '8px 18px', borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
              <button onClick={() => onCounter(form)} style={{ padding: '8px 18px', borderRadius: 8, background: '#818cf8', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Counter</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractNegotiationModal; 