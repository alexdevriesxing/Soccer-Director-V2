import React, { useState } from 'react';
import BaseModal from './BaseModal';

interface ExtraTrainingModalProps {
    playerName: string;
    onConfirm: (focus: string) => void;
    onCancel: () => void;
    loading?: boolean;
    focusOptions: string[];
}

const ExtraTrainingModal: React.FC<ExtraTrainingModalProps> = ({ playerName, onConfirm, onCancel, loading, focusOptions }) => {
    const [focus, setFocus] = useState(focusOptions[0]);
    return (
        <BaseModal open={true} onClose={onCancel} ariaLabel="Assign Extra Training" maxWidth={400} minWidth={320}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Assign Extra Training</h3>
            <div style={{ marginBottom: 10 }}>Assign extra training to <b>{playerName}</b>:</div>
            <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', marginBottom: 6 }}>Focus:</label>
                <select style={{ borderRadius: 8, padding: 8, width: '100%', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} value={focus} onChange={e => setFocus(e.target.value)} aria-label="Training focus">
                    {focusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
                <button style={{ padding: '8px 20px', borderRadius: 8, background: '#38bdf8', color: '#1e293b', border: 'none', fontWeight: 700, cursor: 'pointer' }} onClick={() => onConfirm(focus)} disabled={loading}>{loading ? 'Processing...' : 'Assign'}</button>
                <button style={{ padding: '8px 20px', borderRadius: 8, background: '#334155', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }} onClick={onCancel}>Cancel</button>
            </div>
        </BaseModal>
    );
};

export default ExtraTrainingModal; 