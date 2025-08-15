import React, { useState } from 'react';
import ClubAutocomplete, { ClubOption } from './ClubAutocomplete';
import LoanDurationPicker from './LoanDurationPicker';
import PlayerDetailsPopover from './PlayerDetailsPopover';

interface LoanOutModalProps {
    player: any;
    clubOptions: ClubOption[];
    onConfirm: (toClubId: string, fee: number, endDate: string) => void;
    onCancel: () => void;
    loading?: boolean;
    suggestedFee?: number;
}

const LoanOutModal: React.FC<LoanOutModalProps> = ({ player, clubOptions, onConfirm, onCancel, loading, suggestedFee }) => {
    const [toClubId, setToClubId] = useState('');
    const [fee, setFee] = useState(suggestedFee || Math.round((player.skill || 50) * 10));
    const [endDate, setEndDate] = useState('');
    const [showPopover, setShowPopover] = useState(false);
    const clubChoices = clubOptions.filter(c => c.id !== player.clubId);
    const valid = toClubId && clubChoices.some(c => c.id === toClubId) && fee >= 0 && endDate;
    if (!player) return null;
    const modalRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
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
    }, [onCancel]);
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onCancel();
    };
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={`Loan Out ${player.name}`}
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
                    onClick={onCancel}
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
                <h3 className="text-lg font-semibold mb-2">Loan Out <span className="relative" onMouseEnter={() => setShowPopover(true)} onMouseLeave={() => setShowPopover(false)}>{player.name}{showPopover && <div className="absolute left-0 top-8 z-50"><PlayerDetailsPopover player={player} /></div>}</span></h3>
                <div className="mb-2">
                    <label className="block mb-1">To Club:</label>
                    <ClubAutocomplete value={toClubId} onChange={setToClubId} options={clubChoices} />
                </div>
                <div className="mb-2">
                    <label className="block mb-1">Loan Duration:</label>
                    <LoanDurationPicker value={endDate} onChange={setEndDate} />
                </div>
                <div className="mb-2">
                    <label className="block mb-1">Loan Fee (€):</label>
                    <input type="number" className="border rounded px-2 py-1 w-full" value={fee} onChange={e => setFee(Number(e.target.value))} min={0} aria-label="Loan fee" />
                    <div className="text-xs text-gray-500">Suggested: €{suggestedFee || Math.round((player.skill || 50) * 10)}</div>
                </div>
                <div className="flex gap-2 mt-4">
                    <button className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50" onClick={() => valid && onConfirm(toClubId, fee, endDate)} disabled={!valid || loading}>{loading ? 'Processing...' : 'Confirm'}</button>
                    <button className="px-3 py-1 bg-gray-400 text-white rounded" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default LoanOutModal; 