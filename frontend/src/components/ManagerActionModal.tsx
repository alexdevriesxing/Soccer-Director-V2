import React from 'react';

interface ManagerActionModalProps {
  open: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  loading: boolean;
  result: { morale: number; psychology: any; message: string } | null;
}

const actions = [
  { key: 'praise', label: 'Praise' },
  { key: 'discipline', label: 'Discipline' },
  { key: 'team_talk', label: 'Team Talk' },
  { key: 'private_chat', label: 'Private Chat' }
];

const ManagerActionModal: React.FC<ManagerActionModalProps> = ({ open, onClose, onAction, loading, result }) => {
  if (!open) return null;
  const modalRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
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
  }, [onClose]);
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Manager Action"
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
          maxWidth: 420,
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
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>Manager Action</h2>
        <div style={{marginBottom: 16}}>
          {actions.map(a => (
            <button key={a.key} onClick={() => onAction(a.key)} disabled={loading} style={{marginRight: 8}}>
              {a.label}
            </button>
          ))}
        </div>
        {loading && <div>Processing...</div>}
        {result && (
          <div style={{marginTop: 16}}>
            <div><strong>{result.message}</strong></div>
            <div>Morale: <progress value={result.morale} max={100} style={{width: 120}} /> {result.morale}</div>
            {result.psychology && (
              <table style={{marginTop: 8}}>
                <tbody>
                  <tr><td>Homesickness</td><td>{result.psychology.homesickness}</td></tr>
                  <tr><td>Pressure Handling</td><td>{result.psychology.pressureHandling}</td></tr>
                  <tr><td>Leadership</td><td>{result.psychology.leadership}</td></tr>
                  <tr><td>Ambition</td><td>{result.psychology.ambition}</td></tr>
                  <tr><td>Adaptability</td><td>{result.psychology.adaptability}</td></tr>
                </tbody>
              </table>
            )}
          </div>
        )}
        <button onClick={onClose} style={{marginTop: 16}}>Close</button>
      </div>
    </div>
  );
};

export default ManagerActionModal; 