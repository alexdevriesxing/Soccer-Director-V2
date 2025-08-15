import React from 'react';
import BaseModal from './BaseModal';
import LanguageSelector from './LanguageSelector';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  return (
    <BaseModal open={open} onClose={onClose} ariaLabel="Settings" maxWidth={420} minWidth={320}>
      <h2 style={{ marginTop: 0, fontSize: 22, fontWeight: 700, marginBottom: 18 }}>Settings</h2>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="lang-select" style={{ marginRight: 8 }}>Language:</label>
        <LanguageSelector />
      </div>
      <button onClick={onClose} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 8, background: '#38bdf8', color: '#1e293b', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Close</button>
    </BaseModal>
  );
};

export default SettingsModal;