import React, { useState } from 'react';
import BaseModal from './BaseModal';

interface HireStaffModalProps {
    onConfirm: (name: string, role: string, skill: number) => void;
    onCancel: () => void;
    loading?: boolean;
    staffRoles: string[];
}

const HireStaffModal: React.FC<HireStaffModalProps> = ({ onConfirm, onCancel, loading, staffRoles }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState(staffRoles[0]);
    const [skill, setSkill] = useState(50);

    const valid = name && staffRoles.includes(role) && skill >= 0 && skill <= 100;
    return (
        <BaseModal open={true} onClose={onCancel} ariaLabel="Hire Staff" maxWidth={400} minWidth={320}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Hire Staff</h3>
            <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', marginBottom: 6 }}>Name:</label>
                <input style={{ borderRadius: 8, padding: 8, width: '100%', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} value={name} onChange={e => setName(e.target.value)} aria-label="Staff name" />
            </div>
            <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', marginBottom: 6 }}>Role:</label>
                <select style={{ borderRadius: 8, padding: 8, width: '100%', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} value={role} onChange={e => setRole(e.target.value)} aria-label="Staff role">
                    {staffRoles.map(r => <option key={r}>{r}</option>)}
                </select>
            </div>
            <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', marginBottom: 6 }}>Skill (0-100):</label>
                <input type="range" min={0} max={100} style={{ width: '100%' }} value={skill} onChange={e => setSkill(Number(e.target.value))} aria-label="Staff skill" />
                <div style={{ textAlign: 'center', fontSize: 13 }}>{skill}</div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
                <button style={{ padding: '8px 20px', borderRadius: 8, background: '#4ade80', color: '#1e293b', border: 'none', fontWeight: 700, cursor: 'pointer' }} onClick={() => valid && onConfirm(name, role, skill)} disabled={!valid || loading}>{loading ? 'Processing...' : 'Confirm'}</button>
                <button style={{ padding: '8px 20px', borderRadius: 8, background: '#334155', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }} onClick={onCancel}>Cancel</button>
            </div>
        </BaseModal>
    );
};

export default HireStaffModal; 