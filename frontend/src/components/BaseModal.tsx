import React from 'react';

interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: React.ReactNode;
  maxWidth?: number | string;
  minWidth?: number | string;
  style?: React.CSSProperties;
}

const BaseModal: React.FC<BaseModalProps> = ({
  open,
  onClose,
  ariaLabel,
  children,
  maxWidth = 480,
  minWidth = 320,
  style = {},
}) => {
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
        if (!focusable.length) return;
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

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
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
          minWidth,
          maxWidth,
          width: '90vw',
          boxShadow: '0 8px 32px #22d3ee44',
          position: 'relative',
          animation: 'fadeInScale 0.25s cubic-bezier(.4,2,.6,1)',
          ...style,
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
        {children}
      </div>
    </div>
  );
};

export default BaseModal;
