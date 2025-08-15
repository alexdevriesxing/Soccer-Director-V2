import React from 'react';
import BaseModal from './BaseModal';

interface RecallConfirmModalProps {
    playerName: string;
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

const RecallConfirmModal: React.FC<RecallConfirmModalProps> = ({ playerName, open, onClose, onConfirm, loading }) => {
    return (
        <BaseModal open={open} onClose={onClose} ariaLabel={`Recall Player ${playerName}`} maxWidth={400} minWidth={320}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Recall Player</h3>
            <div style={{ marginBottom: 22 }}>Are you sure you want to recall {playerName}?</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
                <button style={{ padding: '8px 20px', borderRadius: 8, background: '#38bdf8', color: '#1e293b', border: 'none', fontWeight: 700, cursor: 'pointer' }} onClick={onConfirm} disabled={loading}>{loading ? 'Processing...' : 'Recall'}</button>
                <button style={{ padding: '8px 20px', borderRadius: 8, background: '#334155', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }} onClick={onClose}>Cancel</button>
            </div>
        </BaseModal>
    );
};

export default RecallConfirmModal;