import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import Card, { CardHeader, CardTitle } from '../common/Card';
import Badge from '../common/Badge';
import { Activity, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react';
import { RISK_LEVELS } from '../../utils/constants';

export const BlendedRiskCard = () => {
  const { calculation } = useQuotation();

  const dealHealth = calculation?.dealHealth || {
    riskScore: 15,
    riskLevel: 'low',
    riskFactors: [],
    winProbability: 75,
    marginHealth: 'Healthy'
  };

  const riskConfig = RISK_LEVELS[dealHealth.riskLevel] || RISK_LEVELS.low;

  return (
    <Card className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-apple-card mb-6">
      <CardHeader className="pb-4 border-b border-black/[0.08] dark:border-white/[0.08] mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] text-[#0071e3] dark:text-[#2997ff]">
            <Activity className="w-4.5 h-4.5" />
          </div>
          <div>
            <CardTitle className="text-[16px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">AI Deal Health & Risk Assessment</CardTitle>
            <p className="text-[12px] text-[#6e6e73] dark:text-[#86868b] mt-0.5">Machine-learned predictive deal scoring</p>
          </div>
        </div>
        <span className={`text-[12px] px-3 py-1 rounded-full border font-semibold ${riskConfig.badgeColor}`}>
          {riskConfig.label}
        </span>
      </CardHeader>

      <div className="grid grid-cols-2 gap-4 pb-5 border-b border-black/[0.08] dark:border-white/[0.08] text-center">
        <div className="p-4 bg-black/[0.02] dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
          <div className="text-[11px] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono">
            Composite Risk Score
          </div>
          <div className="text-[28px] font-bold font-mono text-[#1d1d1f] dark:text-[#f5f5f7] mt-1.5">
            {dealHealth.riskScore}
            <span className="text-[13px] text-[#86868b] font-normal ml-0.5">/100</span>
          </div>
        </div>

        <div className="p-4 bg-black/[0.02] dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
          <div className="text-[11px] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono flex items-center justify-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#1b7a36] dark:text-[#30d158]" />
            <span>Predicted Win Rate</span>
          </div>
          <div className="text-[28px] font-bold font-mono text-[#1b7a36] dark:text-[#30d158] mt-1.5">
            {dealHealth.winProbability}%
          </div>
        </div>
      </div>

      {/* Identified Risk Factors */}
      <div className="mt-5 space-y-2.5">
        <div className="text-[11px] font-semibold text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono">
          Diagnostic Factors
        </div>
        {dealHealth.riskFactors && dealHealth.riskFactors.length > 0 ? (
          <ul className="space-y-2">
            {dealHealth.riskFactors.map((factor, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 text-[13px] text-[#9e5200] dark:text-[#ff9f0a]">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#ff9f0a] mt-0.5" />
                <span className="leading-snug">{factor}</span>
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
