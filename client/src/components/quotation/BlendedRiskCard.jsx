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
    <Card className="border-slate-800 bg-slate-900/60 mb-6">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <CardTitle>AI Deal Health & Blended Risk Assessment</CardTitle>
        </div>
        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${riskConfig.badgeColor}`}>
          {riskConfig.label}
        </span>
      </CardHeader>

      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800/80 text-center">
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
            Composite Risk Score
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {dealHealth.riskScore}
            <span className="text-xs text-slate-500 font-normal">/100</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Predicted Win Rate</span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {dealHealth.winProbability}%
          </div>
        </div>
      </div>

      {/* Identified Risk Factors */}
      <div className="mt-4 space-y-2">
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-mono">
          Diagnostic Factors
        </div>
        {dealHealth.riskFactors && dealHealth.riskFactors.length > 0 ? (
          <ul className="space-y-1.5">
            {dealHealth.riskFactors.map((factor, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs text-amber-300/90">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400 mt-0.5" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center space-x-2 text-xs text-emerald-400/90 py-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Clean commercial profile. No anomalous risk signals detected.</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BlendedRiskCard;
