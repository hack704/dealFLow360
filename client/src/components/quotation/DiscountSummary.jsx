import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import Card, { CardHeader, CardTitle } from '../common/Card';
import Badge from '../common/Badge';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Calculator, Tag, Percent, ShieldCheck, AlertCircle } from 'lucide-react';

export const DiscountSummary = () => {
  const { calculation, items, calculating } = useQuotation();

  const subtotal = calculation?.subtotal || items.reduce((acc, it) => acc + (it.listPrice || 0) * (it.quantity || 1), 0);
  const totalDiscount = calculation?.totalDiscountAmount || 0;
  const grandTotal = calculation?.grandTotal || subtotal - totalDiscount;
  const blendedMargin = calculation?.blendedMarginPercent || 0;
  const requiresApproval = calculation?.requiresApproval || false;

  return (
    <Card className="border-slate-800 bg-slate-900/60">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Calculator className="w-4 h-4 text-indigo-400" />
          <CardTitle>Commercial Pricing Summary</CardTitle>
        </div>
        {calculating && (
          <span className="text-xs text-indigo-400 animate-pulse font-mono">
            Recalculating CPQ...
          </span>
        )}
      </CardHeader>

      <div className="space-y-3.5 text-xs">
        <div className="flex justify-between items-center text-slate-400">
          <span>Gross Catalog Subtotal</span>
          <span className="font-mono text-slate-200 text-sm">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Applied Volume & Tier Discounts</span>
          </div>
          <span className="font-mono text-emerald-400 font-medium">
            -{formatCurrency(totalDiscount)} ({formatPercent(calculation?.totalDiscountPercent || 0)})
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-400">
          <span>Target Deal Blended Margin</span>
          <div className="flex items-center space-x-2">
            <span
              className={`font-mono font-semibold ${
                blendedMargin >= 40
                  ? 'text-emerald-400'
                  : blendedMargin >= 25
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {formatPercent(blendedMargin)}
            </span>
            <Badge
              variant={blendedMargin >= 40 ? 'success' : blendedMargin >= 25 ? 'warning' : 'danger'}
              size="xs"
            >
              {calculation?.dealHealth?.marginHealth || 'Evaluating'}
            </Badge>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex justify-between items-baseline">
          <div>
            <div className="text-sm font-semibold text-white">Net Contract Value</div>
            <div className="text-[10px] text-slate-400 font-mono">Billed per agreement terms</div>
          </div>
          <div className="text-xl font-bold font-mono text-white tracking-tight">
            {formatCurrency(grandTotal)}
          </div>
        </div>

        {requiresApproval ? (
          <div className="mt-4 p-3 rounded-lg bg-amber-950/40 border border-amber-800/50 flex items-start space-x-2 text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-semibold block">Manager Approval Triggered</span>
              {calculation?.approvalReason || 'Discount depth or margin thresholds require managerial authorization before issuance.'}
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 flex items-center space-x-2 text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-medium">
              Within standard delegation of authority. Direct quotation issue eligible.
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DiscountSummary;
