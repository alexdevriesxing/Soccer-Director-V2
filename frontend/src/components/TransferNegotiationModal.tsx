import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { submitTransferBid, negotiateTransfer } from '../api/footballApi';
import NegotiationTimeline from './NegotiationTimeline';
import toast, { Toaster } from 'react-hot-toast';
import { TransferMarketPlayer } from '../types';
import { useManagerProfile } from '../context/ManagerProfileContext';
// Optionally, import LanguageSelector if available
// import LanguageSelector from './LanguageSelector';

interface Props {
    player: TransferMarketPlayer;
    onClose: () => void;
    onComplete: () => void;
}

const TransferNegotiationModal: React.FC<Props> = ({ player, onClose, onComplete }) => {
    const { profile } = useManagerProfile();
    const [bidAmount, setBidAmount] = useState(player.estimatedValue);
    const [wageOffer, setWageOffer] = useState(player.wage);
    const [contractLength, setContractLength] = useState(3);
    const [round, setRound] = useState(1);
    const [result, setResult] = useState<any>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [negotiationId, setNegotiationId] = useState<string>('');

    const handlePreset = (type: 'match' | 'lowball' | 'custom') => {
        if (type === 'match') {
            setBidAmount(player.estimatedValue);
            setWageOffer(player.wage);
            setContractLength(3);
        } else if (type === 'lowball') {
            setBidAmount(Math.round(player.estimatedValue * 0.7));
            setWageOffer(Math.round(player.wage * 0.8));
            setContractLength(4);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (round === 1) {
                // Initial bid
                // Use the manager's club ID from context/profile (profile.club)
                const biddingClubId = profile?.club || 1;
                const bidResponse = await submitTransferBid(player.id.toString(), {
                    bidAmount: Number(bidAmount),
                    biddingClubId: Number(biddingClubId),
                    wageOffer: Number(wageOffer),
                    contractLength: Number(contractLength)
                });

                setNegotiationId(bidResponse.negotiation.id);
                setResult(bidResponse);
                setTimeline(tl => [...tl, {
                    round,
                    offer: { bidAmount, wageOffer, contractLength },
                    response: bidResponse
                }]);
            } else {
                // Negotiation
                const negotiationResponse = await negotiateTransfer(player.id.toString(), {
                    negotiationId,
                    newBidAmount: Number(bidAmount),
                    newWageOffer: Number(wageOffer),
                    newContractLength: Number(contractLength)
                });

                setResult(negotiationResponse);
                setTimeline(tl => [...tl, {
                    round,
                    offer: { bidAmount, wageOffer, contractLength },
                    response: negotiationResponse
                }]);

                if (negotiationResponse.accepted) {
                    toast.success('Transfer completed successfully!');
                    onComplete?.();
                    setTimeout(() => {
                        setResult(null);
                        setTimeline([]);
                        setRound(1);
                        setNegotiationId('');
                        onClose();
                    }, 1000);
                    return;
                }
            }

            setRound(r => r + 1);
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit offer');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const modalRef = React.useRef<HTMLDivElement>(null);
    useEffect(() => {
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
        <BaseModal open={true} onClose={onClose} ariaLabel={`Transfer Negotiation: ${player.name}`} maxWidth={680} minWidth={320}>
            <Toaster position="top-center" />
            <div className="relative w-full max-w-2xl mx-auto p-0">
                <div className="backdrop-blur-lg bg-white/10 rounded-3xl shadow-2xl border border-white/20 px-8 py-10 w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-2xl sm:text-3xl font-extrabold mb-6 text-white drop-shadow-lg tracking-tight text-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Transfer Negotiation: {player.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 shadow border border-white/10">
                            <h4 className="font-semibold mb-2 text-indigo-100">Player Information</h4>
                            <div className="space-y-1 text-sm text-white/90">
                                <div><span className="text-indigo-200">Nationality:</span> {player.nationality}</div>
                                <div><span className="text-indigo-200">Position:</span> {player.position}</div>
                                <div><span className="text-indigo-200">Age:</span> {player.age}</div>
                                <div><span className="text-indigo-200">Skill:</span> {player.skill}</div>
                                <div><span className="text-indigo-200">Current Club:</span> {player.currentClub}</div>
                                <div><span className="text-indigo-200">Estimated Value:</span> {formatCurrency(player.estimatedValue)}</div>
                                <div><span className="text-indigo-200">Current Wage:</span> {formatCurrency(player.wage)}/week</div>
                                <div><span className="text-indigo-200">Style:</span> {player.agent.style}</div>
                                <div><span className="text-indigo-200">Reputation:</span> {player.agent.reputation}</div>
                                <div><span className="text-indigo-200">Ambition:</span> {player.ambition}</div>
                                <div><span className="text-indigo-200">Loyalty:</span> {player.loyalty}</div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-4 flex gap-2 justify-center">
                        <button
                            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:from-indigo-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all text-sm glow"
                            onClick={() => handlePreset('match')}
                        >
                            Match Value
                        </button>
                        <button
                            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold shadow-lg hover:from-yellow-400 hover:to-orange-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all text-sm glow"
                            onClick={() => handlePreset('lowball')}
                        >
                            Lowball Offer
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-indigo-100">Transfer Fee (€)</label>
                                <input
                                    type="number"
                                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                                    value={bidAmount}
                                    onChange={e => setBidAmount(Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-indigo-100">Wage Offer (€ / week)</label>
                                <input
                                    type="number"
                                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                                    value={wageOffer}
                                    onChange={e => setWageOffer(Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-indigo-100">Contract Length (years)</label>
                                <input
                                    type="number"
                                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                                    value={contractLength}
                                    onChange={e => setContractLength(Number(e.target.value))}
                                    min="1"
                                    max="5"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:from-green-400 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all text-lg glow mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : round === 1 ? 'Submit Initial Bid' : 'Submit Counter-Offer'}
                        </button>
                    </form>
                    {result && (
                        <div className="mb-4 p-4 border border-white/20 rounded-xl bg-white/10 backdrop-blur shadow">
                            <h4 className="font-semibold mb-2 text-indigo-100">Agent Response:</h4>
                            <p className="text-sm mb-2 text-white/90">{result.message}</p>
                            {result.counterOffer && (
                                <div className="mt-3 p-3 bg-indigo-900/40 rounded-xl">
                                    <h5 className="font-medium mb-2 text-indigo-200">Counter-Offer:</h5>
                                    <div className="text-sm space-y-1 text-white/90">
                                        <div>Transfer Fee: {formatCurrency(result.counterOffer.bidAmount)}</div>
                                        <div>Wage: {formatCurrency(result.counterOffer.wageOffer)}/week</div>
                                        <div>Contract Length: {result.counterOffer.contractLength} years</div>
                                    </div>
                                </div>
                            )}
                            {result.accepted && (
                                <div className="mt-3 p-3 bg-green-600/80 rounded-xl">
                                    <h5 className="font-medium text-white">Transfer Accepted!</h5>
                                </div>
                            )}
                        </div>
                    )}
                    {timeline.length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-semibold mb-2 text-indigo-100">Negotiation Timeline</h4>
                            <div className="bg-white/10 rounded-xl p-3 shadow border border-white/10">
                                <NegotiationTimeline timeline={timeline} />
                            </div>
                        </div>
                    )}
                </div>
                {/* Google Fonts for Montserrat and Inter */}
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Inter:wght@400;600&display=swap" rel="stylesheet" />
            </div>
        </BaseModal>
    );
};

export default TransferNegotiationModal;