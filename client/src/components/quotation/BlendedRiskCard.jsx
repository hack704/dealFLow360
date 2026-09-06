import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import Card, { CardHeader, CardTitle } from '../common/Card';
import Badge from '../common/Badge';
import { Activity, AlertTriangle, ShieldCheck, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { RISK_LEVELS } from '../../utils/constants';

export const BlendedRiskCard = () => {
  const { calculation, items, customer, orderDiscountPercent } = useQuotation();

  // Instant local deal financial calculations
  const localSubtotal = items.reduce(
    (acc, it) => acc + (Number(it.listPrice) || 0) * (Number(it.quantity) || 1),
    0
  );
  const localDiscounts = items.reduce(
    (acc, it) =>
      acc +
      (Number(it.listPrice) || 0) *
        (Number(it.quantity) || 1) *
        ((Number(it.discountPercent) || 0) / 100),
    0
  );
  const localNet = Math.max(0, localSubtotal - localDiscounts);
  const localCost = items.reduce(
    (acc, it) => acc + (Number(it.unitCost) || 0) * (Number(it.quantity) || 1),
    0
  );
  const localMargin = localNet > 0 ? ((localNet - localCost) / localNet) * 100 : 38;
  const effectiveDiscountPercent =
    localSubtotal > 0 ? (localDiscounts / localSubtotal) * 100 : orderDiscountPercent || 0;

  // Real-time computed risk score if not yet provided by backend
  let dynamicRiskScore = 10;
  const dynamicRiskFactors = [];

  if (localMargin < 15) {
    dynamicRiskScore += 40;
    dynamicRiskFactors.push('Critical margin compression (< 15%) threatens deal profitability');
  } else if (localMargin < 25) {
    dynamicRiskScore += 25;
    dynamicRiskFactors.push('Sub-optimal margin profile (< 25%) requires governance scrutiny');
  } else if (localMargin < 35) {
    dynamicRiskScore += 10;
  }

  if (effectiveDiscountPercent > 30) {
    dynamicRiskScore += 30;
    dynamicRiskFactors.push(`Aggressive discounting (${effectiveDiscountPercent.toFixed(0)}%) may trigger price realization resistance`);
  } else if (effectiveDiscountPercent > 15) {
    dynamicRiskScore += 15;
    dynamicRiskFactors.push(`Discount depth (${effectiveDiscountPercent.toFixed(0)}%) exceeds standard 10% delegation ceiling`);
  }

  const creditRating = customer?.creditRating || 'BBB';
  if (['B', 'BB'].includes(creditRating)) {
    dynamicRiskScore += 25;
    dynamicRiskFactors.push(`Elevated customer credit default risk (Rating: ${creditRating})`);
  } else if (creditRating === 'BBB') {
    dynamicRiskScore += 10;
    dynamicRiskFactors.push(`Moderate payment default probability (Rating: ${creditRating})`);
  }

  if (localNet > 150000) {
    dynamicRiskScore += 10;
    dynamicRiskFactors.push(`High financial exposure (Contract value > $150k)`);
  }

  dynamicRiskScore = Math.min(100, Math.max(5, dynamicRiskScore));

  // Dynamic Win Rate computation
  let dynamicWinRate = 60;
  if (effectiveDiscountPercent >= 8 && effectiveDiscountPercent <= 20) dynamicWinRate += 15;
  if (effectiveDiscountPercent > 20) dynamicWinRate += 8;
  if (customer?.tier === 'Gold' || customer?.tier === 'Enterprise') dynamicWinRate += 5;
  if (dynamicRiskScore > 50) dynamicWinRate -= 15;
  dynamicWinRate = Math.min(95, Math.max(25, dynamicWinRate));

  // Determine active risk tier
  const riskScore = calculation?.dealHealth?.riskScore ?? dynamicRiskScore;
  const winProbability = calculation?.dealHealth?.winProbability ?? dynamicWinRate;
  const riskFactors =
    calculation?.dealHealth?.riskFactors && calculation.dealHealth.riskFactors.length > 0
      ? calculation.dealHealth.riskFactors
      : dynamicRiskFactors;

  let riskLevelKey = 'low';
  let riskLevelLabel = 'Low Risk';
  let badgeStyle = 'bg-[#30d158]/15 text-[#1b7a36] dark:text-[#30d158] border-[#30d158]/30';

  if (riskScore >= 70) {
    riskLevelKey = 'critical';
    riskLevelLabel = 'Critical Risk';
    badgeStyle = 'bg-[#ff453a]/15 text-[#c9342c] dark:text-[#ff453a] border-[#ff453a]/30';
  } else if (riskScore >= 50) {
    riskLevelKey = 'high';
    riskLevelLabel = 'High Risk';
    badgeStyle = 'bg-[#ff453a]/15 text-[#c9342c] dark:text-[#ff453a] border-[#ff453a]/30';
  } else if (riskScore >= 25) {
    riskLevelKey = 'moderate';
    riskLevelLabel = 'Moderate Risk';
    badgeStyle = 'bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a] border-[#ff9f0a]/30';
  }

  return (
    <Card className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-apple-card mb-6">
      <CardHeader className="pb-4 border-b border-black/[0.08] dark:border-white/[0.08] mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] text-[#0071e3] dark:text-[#2997ff]">
            <Activity className="w-4.5 h-4.5" />
          </div>
          <div>
            <CardTitle className="text-[16px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              AI Deal Health & Risk Assessment
            </CardTitle>
            <p className="text-[12px] text-[#6e6e73] dark:text-[#86868b] mt-0.5">
              Machine-learned predictive deal scoring
            </p>
          </div>
        </div>
        <span className={`text-[12px] px-3 py-1 rounded-full border font-semibold ${badgeStyle}`}>
          {riskLevelLabel}
        </span>
      </CardHeader>

      {/* Two Metric Tiles: Composite Risk Score + Predicted Win Rate */}
      <div className="grid grid-cols-2 gap-4 pb-5 border-b border-black/[0.08] dark:border-white/[0.08] text-center">
        <div className="p-4 bg-black/[0.02] dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
          <div className="text-[11px] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono">
            Composite Risk Score
          </div>
          <div className="text-[28px] font-bold font-mono text-[#1d1d1f] dark:text-[#f5f5f7] mt-1.5">
            {riskScore}
            <span className="text-[13px] text-[#86868b] font-normal ml-0.5">/100</span>
          </div>

          {/* Mini Segmented Risk Bar */}
          <div className="w-full h-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden mt-2.5">
            <div
              style={{ width: `${riskScore}%` }}
              className={`h-full transition-all duration-300 ${
                riskScore >= 50
                  ? 'bg-[#ff453a]'
                  : riskScore >= 25
                  ? 'bg-[#ff9f0a]'
                  : 'bg-[#30d158]'
              }`}
            />
          </div>
        </div>

        <div className="p-4 bg-black/[0.02] dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
          <div className="text-[11px] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono flex items-center justify-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#1b7a36] dark:text-[#30d158]" />
            <span>Predicted Win Rate</span>
          </div>
          <div className="text-[28px] font-bold font-mono text-[#1b7a36] dark:text-[#30d158] mt-1.5">
            {winProbability}%
          </div>

          <div className="w-full h-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden mt-2.5">
            <div
              style={{ width: `${winProbability}%` }}
              className="h-full bg-[#30d158] transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Identified Risk Factors / Diagnostics */}
      <div className="mt-5 space-y-2.5">
        <div className="text-[11px] font-semibold text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono">
          Diagnostic Factors
        </div>

        {riskFactors && riskFactors.length > 0 ? (
          <ul className="space-y-2">
            {riskFactors.map((factor, idx) => (
              <li
                key={idx}
                className="flex items-start space-x-2.5 text-[12.5px] text-[#9e5200] dark:text-[#ff9f0a] leading-snug"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#ff9f0a] mt-0.5" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center space-x-2.5 text-[13px] text-[#1b7a36] dark:text-[#30d158] py-1">
            <ShieldCheck className="w-4.5 h-4.5 text-[#30d158]" />
            <span>Clean commercial profile. No anomalous risk signals detected.</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BlendedRiskCard;
