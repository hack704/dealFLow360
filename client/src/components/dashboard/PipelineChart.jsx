import React from 'react';

/**
 * PipelineChart — Horizontal bar visualisation of pipeline by status.
 * Props: data = [{ label, value, color }]
 */
const PipelineChart = ({ data = [] }) => {
  const total = data.reduce((acc, d) => acc + (d.value || 0), 0) || 1;

  const defaults = [
    { label: 'Draft',            value: 4,  color: '#6e6e73' },
    { label: 'Pending Approval', value: 3,  color: '#ff9f0a' },
    { label: 'Approved',         value: 7,  color: '#30d158' },
    { label: 'Sent to Customer', value: 5,  color: '#2997ff' },
    { label: 'Accepted',         value: 6,  color: '#5e5ce6' }
  ];

  const bars = data.length > 0 ? data : defaults;
  const barTotal = bars.reduce((acc, d) => acc + d.value, 0) || 1;

  return (
    <div className="flex flex-col gap-3">
      {/* Stacked horizontal bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
        {bars.map((d, i) => (
          <div
            key={i}
            className="transition-all duration-700"
            style={{
              width: `${(d.value / barTotal) * 100}%`,
              backgroundColor: d.color,
              marginLeft: i === 0 ? 0 : '1px'
            }}
            title={`${d.label}: ${d.value}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {bars.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-[12px] text-[#86868b]">{d.label}</span>
            <span className="text-[12px] font-semibold text-[#f5f5f7]">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PipelineChart;
