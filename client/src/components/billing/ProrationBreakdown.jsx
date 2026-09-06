import React from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';

/**
 * ProrationBreakdown — Shows mid-cycle proration calculation details.
 * Props: proration = {
 *   currentPlanRate, newPlanRate, rateDifference,
 *   daysRemainingInCycle, totalCycleDays,
 *   prorationFraction, immediateProratedCharge, nextBillingDateCharge
 * }
 */
const ProrationBreakdown = ({ proration = {} }) => {
  const {
    currentPlanRate = 0,
    newPlanRate = 0,
    rateDifference = 0,
    daysRemainingInCycle = 0,
    totalCycleDays = 30,
    prorationFraction = 0,
    immediateProratedCharge = 0,
    nextBillingDateCharge = 0
  } = proration;

  const isUpgrade = rateDifference >= 0;

  const rows = [
    { label: 'Current Plan Rate',    value: `$${currentPlanRate}/mo`,       highlight: false },
    { label: 'New Plan Rate',        value: `$${newPlanRate}/mo`,            highlight: false },
    { label: 'Rate Difference',      value: `${isUpgrade ? '+' : ''}$${rateDifference}/mo`, highlight: false },
    { label: 'Days Remaining',       value: `${daysRemainingInCycle} / ${totalCycleDays} days`, highlight: false },
    { label: 'Proration %',          value: `${prorationFraction}%`,         highlight: false },
    { label: 'Charge Now',           value: `$${Math.abs(immediateProratedCharge).toFixed(2)}`, highlight: true  },
    { label: 'Next Billing Amount',  value: `$${nextBillingDateCharge}/mo`,  highlight: false }
  ];

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
        {isUpgrade
          ? <ArrowUpRight size={14} className="text-[#30d158]" />
          : <ArrowDownRight size={14} className="text-[#ff9f0a]" />}
        <p className="text-[12px] font-semibold text-[#f5f5f7]">
          {isUpgrade ? 'Upgrade' : 'Downgrade'} Proration Breakdown
        </p>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/[0.04]">
        {rows.map(({ label, value, highlight }) => (
          <div key={label} className={`flex items-center justify-between px-4 py-2.5 ${highlight ? 'bg-[#2997ff]/08' : ''}`}>
            <span className="text-[12px] text-[#86868b]">{label}</span>
            <span className={`text-[13px] font-${highlight ? 'bold' : 'semibold'} ${highlight ? 'text-[#2997ff]' : 'text-[#f5f5f7]'}`}>
              {highlight && <DollarSign size={11} className="inline mr-0.5 text-[#2997ff]" />}
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProrationBreakdown;
