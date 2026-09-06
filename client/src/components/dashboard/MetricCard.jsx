import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * MetricCard — KPI summary card for the Dashboard.
 * Props: title, value, subtext, trend ('+X%'), trendUp (bool), Icon, accentColor
 */
const MetricCard = ({ title, value, subtext, trend, trendUp, Icon, accentColor = '#2997ff' }) => {
  return (
    <div className="relative flex flex-col gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.03] p-5 overflow-hidden transition-all hover:bg-white/[0.05]">
      {/* Subtle gradient accent */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5 rounded-2xl"
        style={{ background: `radial-gradient(circle at top right, ${accentColor}, transparent 70%)` }}
      />

      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium tracking-wide text-[#86868b] uppercase">{title}</span>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: `${accentColor}18` }}>
            <Icon size={15} style={{ color: accentColor }} />
          </div>
        )}
      </div>

      <div>
        <p className="text-[26px] font-bold leading-none text-[#f5f5f7] tabular-nums">{value}</p>
        {subtext && <p className="mt-1 text-[12px] text-[#86868b]">{subtext}</p>}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1">
          {trendUp
            ? <TrendingUp size={12} className="text-[#30d158]" />
            : <TrendingDown size={12} className="text-[#ff453a]" />}
          <span className={`text-[12px] font-semibold ${trendUp ? 'text-[#30d158]' : 'text-[#ff453a]'}`}>{trend}</span>
          <span className="text-[12px] text-[#555]">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
