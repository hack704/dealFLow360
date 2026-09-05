import React from 'react';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { Activity, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

export const DealHealthPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">AI Deal Risk & Margin Analytics</h2>
        <p className="text-xs text-slate-400 mt-1">
          Predictive deal scoring models analyzing margin erosion, customer credit rating, and win probabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Risk Threshold</span>
            <Badge variant="success" size="xs">Safe</Badge>
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400 mt-2">15 / 100</div>
          <p className="text-xs text-slate-400 mt-2">Average composite deal risk across all active proposals.</p>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Margin Guardrail</span>
            <Badge variant="primary" size="xs">Healthy</Badge>
          </div>
          <div className="text-3xl font-bold font-mono text-white mt-2">81.6%</div>
          <p className="text-xs text-slate-400 mt-2">Enterprise average gross margin above policy floor of 25%.</p>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Predicted Win Velocity</span>
            <Badge variant="info" size="xs">High</Badge>
          </div>
          <div className="text-3xl font-bold font-mono text-cyan-400 mt-2">78%</div>
          <p className="text-xs text-slate-400 mt-2">Machine-learned win rate based on customer tier alignment.</p>
        </Card>
      </div>
    </div>
  );
};

export default DealHealthPage;
