import React from 'react';
import BaseModal from './BaseModal';

interface ConfirmFireModalProps {
    staffName: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

const ConfirmFireModal: React.FC<ConfirmFireModalProps> = ({ staffName, onConfirm, onCancel, loading }) => {
  return (
    <BaseModal open={true} onClose={onCancel} ariaLabel="Confirm Fire" maxWidth={400} minWidth={320}>
      <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Confirm Fire</h3>
      <div style={{ marginBottom: 22 }}>Are you sure you want to fire <b>{staffName}</b>?</div>
      <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
        <button style={{ padding: '8px 20px', borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }} onClick={onConfirm} disabled={loading}>{loading ? 'Processing...' : 'Yes, Fire'}</button>
        <button style={{ padding: '8px 20px', borderRadius: 8, background: '#334155', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }} onClick={onCancel}>Cancel</button>
      </div>
    </BaseModal>
  );
};

export default ConfirmFireModal; 