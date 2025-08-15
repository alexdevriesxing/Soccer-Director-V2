import React from 'react';

interface LoanDurationPickerProps {
    value: string;
    onChange: (date: string) => void;
    disabled?: boolean;
}

const LoanDurationPicker: React.FC<LoanDurationPickerProps> = ({ value, onChange, disabled }) => {
    const today = new Date();
    const threeMonths = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
    const endOfSeason = new Date(today.getFullYear(), 5, 30); // June 30
    function toISO(d: Date) { return d.toISOString().slice(0, 10); }
    return (
        <div className="flex gap-2 items-center">
            <select
                className="border rounded px-2 py-1"
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                aria-label="Loan duration"
            >
                <option value="">Select duration...</option>
                <option value={toISO(threeMonths)}>3 months ({toISO(threeMonths)})</option>
                <option value={toISO(endOfSeason)}>End of season ({toISO(endOfSeason)})</option>
                <option value="custom">Custom date...</option>
            </select>
            {value === 'custom' && (
                <input type="date" className="border rounded px-2 py-1" onChange={e => onChange(e.target.value)} disabled={disabled} />
            )}
        </div>
    );
};

export default LoanDurationPicker; 