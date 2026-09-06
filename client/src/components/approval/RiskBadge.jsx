import React from 'react';
import { ShieldAlert, ShieldCheck, ShieldX, Shield } from 'lucide-react';

const RISK_MAP = {
  low:      { label: 'Low Risk',      color: 'text-[#30d158] bg-[#30d158]/15 border-[#30d158]/30', Icon: ShieldCheck },
  moderate: { label: 'Moderate Risk', color: 'text-[#ff9f0a] bg-[#ff9f0a]/15 border-[#ff9f0a]/30', Icon: Shield },
  high:     { label: 'High Risk',     color: 'text-[#ff453a] bg-[#ff453a]/15 border-[#ff453a]/30', Icon: ShieldAlert },
  critical: { label: 'Critical Risk', color: 'text-[#ff453a] bg-[#ff453a]/25 border-[#ff453a]/50 font-bold', Icon: ShieldX }
};

const RiskBadge = ({ level, score, className = '' }) => {
  const key = (level || 'low').toLowerCase();
  const cfg = RISK_MAP[key] || RISK_MAP.low;
  const { label, color, Icon } = cfg;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-semibold ${color} ${className}`}
    >
      <Icon size={12} />
      {label}
      {score !== undefined && <span className="opacity-70">({score})</span>}
    </span>
  );
};

export default RiskBadge;
