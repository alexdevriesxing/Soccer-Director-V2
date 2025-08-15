import React, { useState } from 'react';

export interface ClubOption {
    id: string;
    name: string;
    badge: string;
    isJongTeam?: boolean;
}

interface ClubAutocompleteProps {
    value: string;
    onChange: (id: string) => void;
    options: ClubOption[];
    disabled?: boolean;
}

const ClubAutocomplete: React.FC<ClubAutocompleteProps> = ({ value, onChange, options, disabled }) => {
    const [search, setSearch] = useState('');
    const filtered = options.filter(c => !c.isJongTeam && (c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase())));
    return (
        <div>
            <input
                className="border rounded px-2 py-1 w-full mb-1"
                placeholder="Search club..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                disabled={disabled}
                aria-label="Search club"
            />
            <select
                className="border rounded px-2 py-1 w-full"
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                aria-label="Select club"
            >
                <option value="">Select club...</option>
                {filtered.map(c => (
                    <option key={c.id} value={c.id}>{c.badge} {c.name}</option>
                ))}
            </select>
        </div>
    );
};

export default ClubAutocomplete; 