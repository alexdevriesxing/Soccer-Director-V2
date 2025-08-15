import React from 'react';

interface Sponsorship {
  id: number;
  sponsor: string;
  amount: number;
  expires: string;
}

// Note: sample data removed to avoid unused variable warnings.

interface Props {
  open: boolean;
  onClose: () => void;
  sponsorships: Sponsorship[];
  onNegotiate: () => void;
  onDelete: (id: number) => void;
  loading?: boolean;
  error?: string | null;
}

const SponsorshipsModal: React.FC<Props> = ({ open, onClose, sponsorships, onNegotiate, onDelete, loading, error }) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
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

  const firstButtonRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (open) setTimeout(() => firstButtonRef.current?.focus(), 50);
  }, [open]);
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sponsorships"
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
          width: '90vw',
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
          🗑️
        </button>
        <h2 style={{ marginBottom: 24, color: '#38bdf8' }}>Sponsorships</h2>
        {loading ? (
          <div style={{color:'#38bdf8', marginBottom:16}}>Loading sponsorships...</div>
        ) : error ? (
          <div style={{color:'#ef4444', marginBottom:16}}>{error}</div>
        ) : (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {(!sponsorships || sponsorships.length === 0) ? (
              <div style={{padding: '32px 0', textAlign: 'center', color: '#888', fontSize: 18}}>
                No sponsorships found.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ padding: 8, textAlign: 'left' }}>Sponsor</th>
                    <th style={{ padding: 8, textAlign: 'right' }}>Amount (€)</th>
                    <th style={{ padding: 8, textAlign: 'right' }}>Expires</th>
                    <th style={{ padding: 8, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sponsorships.map(s => (
                    <tr key={s.id}>
                      <td style={{ padding: 8 }}>{s.sponsor}</td>
                      <td style={{ padding: 8, textAlign: 'right' }}>{s.amount.toLocaleString()}</td>
                      <td style={{ padding: 8, textAlign: 'right' }}>{s.expires}</td>
                      <td style={{ padding: 8, textAlign: 'center' }}>
                        <button style={{color:'#ef4444', border:'none', background:'none', cursor:'pointer'}} onClick={() => onDelete(s.id)} title="Delete">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        <button style={{ padding: '10px 24px', borderRadius: 8, background: 'linear-gradient(90deg,#22d3ee,#4ade80)', color: '#1e293b', border: 'none', fontWeight: 700, cursor: 'pointer' }} onClick={onNegotiate}>
          Negotiate New Sponsorship
        </button>
      </div>
    </div>
  );
};

export default SponsorshipsModal;
