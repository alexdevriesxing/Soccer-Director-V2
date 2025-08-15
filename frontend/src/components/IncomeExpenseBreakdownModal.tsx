import React from 'react';

interface BreakdownItem {
  category: string;
  amount: number;
}


interface BreakdownItem {
  category: string;
  amount: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  income: BreakdownItem[];
  expenses: BreakdownItem[];
  loading?: boolean;
  error?: string | null;
}

const IncomeExpenseBreakdownModal: React.FC<Props> = ({ open, onClose, income, expenses, loading, error }) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previouslyFocused = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    const modal = modalRef.current;
    if (modal) {
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length) focusable[0].focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === 'Tab') {
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      modal.addEventListener('keydown', handleKeyDown);
      return () => {
        modal.removeEventListener('keydown', handleKeyDown);
        previouslyFocused.current?.focus();
      };
    }
  }, [open, onClose]);

  if (!open) return null;
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };
  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(17,24,39,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s',
        backdropFilter: 'blur(2.5px)',
      }}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="breakdown-modal-title"
        tabIndex={-1}
        style={{
          background: '#1e293b',
          color: '#fff',
          borderRadius: 20,
          padding: 32,
          minWidth: 320,
          maxWidth: 480,
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
          onClick={onClose}
          aria-label="Close breakdown modal"
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
        <h2 id="breakdown-modal-title" style={{ marginBottom: 24, color: '#38bdf8' }}>Income & Expense Breakdown</h2>
        {loading ? (
          <div style={{color:'#38bdf8', marginBottom:16}}>Loading breakdown...</div>
        ) : error ? (
          <div style={{color:'#ef4444', marginBottom:16}}>{error}</div>
        ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div>
            <h3 style={{ color: '#22d3ee', marginBottom: 8 }}>Income</h3>
            <PieChart data={income} />
            <PieLegend data={income} />
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <tbody>
                {income.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ padding: 16, textAlign: 'center', color: '#888' }}>No income data available.</td>
                  </tr>
                ) : (
                  income.map((item, i) => (
                    <tr key={i}>
                      <td style={{ padding: 8 }}>{item.category}</td>
                      <td style={{ padding: 8, textAlign: 'right' }}>€{item.amount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
                <tr style={{ fontWeight: 700, background: '#f0fdfa' }}>
                  <td style={{ padding: 8 }}>Total</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>€{income.reduce((a, b) => a + b.amount, 0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 style={{ color: '#f87171', marginBottom: 8 }}>Expenses</h3>
            <PieChart data={expenses} />
            <PieLegend data={expenses} />
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
              <tbody>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ padding: 16, textAlign: 'center', color: '#888' }}>No expense data available.</td>
                  </tr>
                ) : (
                  expenses.map((item, i) => (
                    <tr key={i}>
                      <td style={{ padding: 8 }}>{item.category}</td>
                      <td style={{ padding: 8, textAlign: 'right' }}>€{item.amount.toLocaleString()}</td>
                    </tr>
                  ))
                )}
                <tr style={{ fontWeight: 700, background: '#fef2f2' }}>
                  <td style={{ padding: 8 }}>Total</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>€{expenses.reduce((a, b) => a + b.amount, 0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

// Simple SVG PieChart component
const COLORS = [
  '#38bdf8', '#22d3ee', '#818cf8', '#fbbf24', '#f87171', '#34d399', '#f472b6', '#a3e635', '#facc15', '#f472b6', '#f87171', '#a78bfa', '#f472b6', '#fbbf24', '#f87171', '#4ade80', '#f472b6', '#f87171'
];

function PieChart({ data }: { data: { category: string; amount: number }[] }) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [tooltip, setTooltip] = React.useState<{ x: number; y: number; label: string } | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);

  // Accessibility: describe chart for screen readers
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  if (total === 0) return null;
  let cumulative = 0;
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <svg
        ref={svgRef}
        width={120}
        height={120}
        viewBox="0 0 120 120"
        style={{ display: 'block', margin: '0 auto 12px' }}
        role="img"
        aria-label="Pie chart showing category breakdown"
        tabIndex={0}
      >
        {data.map((d, i) => {
          const startAngle = (cumulative / total) * 2 * Math.PI;
          const sliceAngle = (d.amount / total) * 2 * Math.PI;
          cumulative += d.amount;
          const endAngle = startAngle + sliceAngle;
          const x1 = 60 + 50 * Math.sin(startAngle);
          const y1 = 60 - 50 * Math.cos(startAngle);
          const x2 = 60 + 50 * Math.sin(endAngle);
          const y2 = 60 - 50 * Math.cos(endAngle);
          const largeArc = sliceAngle > Math.PI ? 1 : 0;
          const pathData = `M60,60 L${x1},${y1} A50,50 0 ${largeArc} 1 ${x2},${y2} Z`;
          return (
            <path
              key={d.category}
              d={pathData}
              fill={COLORS[i % COLORS.length]}
              stroke="#fff"
              strokeWidth={activeIndex === i ? 3 : 1}
              tabIndex={0}
              aria-label={`${d.category}: €${d.amount.toLocaleString()}`}
              onMouseEnter={e => {
                setActiveIndex(i);
                const rect = svgRef.current?.getBoundingClientRect();
                setTooltip({
                  x: e.clientX - (rect?.left ?? 0),
                  y: e.clientY - (rect?.top ?? 0),
                  label: `${d.category}: €${d.amount.toLocaleString()}`
                });
              }}
              onMouseMove={e => {
                const rect = svgRef.current?.getBoundingClientRect();
                setTooltip(tooltip => tooltip && {
                  ...tooltip,
                  x: e.clientX - (rect?.left ?? 0),
                  y: e.clientY - (rect?.top ?? 0)
                });
              }}
              onMouseLeave={() => {
                setActiveIndex(null);
                setTooltip(null);
              }}
              onFocus={e => {
                setActiveIndex(i);
                // Place tooltip at center of slice
                setTooltip({
                  x: 60 + 35 * Math.sin((startAngle + endAngle) / 2),
                  y: 60 - 35 * Math.cos((startAngle + endAngle) / 2),
                  label: `${d.category}: €${d.amount.toLocaleString()}`
                });
              }}
              onBlur={() => {
                setActiveIndex(null);
                setTooltip(null);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setActiveIndex(i);
                  setTooltip({
                    x: 60 + 35 * Math.sin((startAngle + endAngle) / 2),
                    y: 60 - 35 * Math.cos((startAngle + endAngle) / 2),
                    label: `${d.category}: €${d.amount.toLocaleString()}`
                  });
                }
              }}
              style={{ cursor: 'pointer', outline: activeIndex === i ? '2px solid #222' : 'none' }}
            >
              <title>{`${d.category}: €${d.amount.toLocaleString()}`}</title>
            </path>
          );
        })}
      </svg>
      {tooltip && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            left: tooltip.x + 8,
            top: tooltip.y - 24,
            background: '#222',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: 6,
            fontSize: 13,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
            boxShadow: '0 2px 8px #0003',
            opacity: 0.96
          }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  );
}

function PieLegend({ data }: { data: { category: string; amount: number }[] }) {
  // Accessibility: legend for pie chart
  if (!data || data.length === 0) return null;
  return (
    <div aria-label="Pie chart legend" role="list" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0 16px 0', justifyContent: 'center' }}>
      {data.map((d, i) => (
        <div key={d.category} role="listitem" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
          <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 3, background: COLORS[i % COLORS.length], marginRight: 4, border: '1px solid #ddd' }} />
          <span>{d.category}</span>
        </div>
      ))}
    </div>
  );
}

export default IncomeExpenseBreakdownModal;
