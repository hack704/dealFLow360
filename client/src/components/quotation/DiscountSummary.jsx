import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import Card, { CardHeader, CardTitle } from '../common/Card';
import Badge from '../common/Badge';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Calculator, Tag, Percent, ShieldCheck, AlertCircle } from 'lucide-react';

export const DiscountSummary = () => {
  const { calculation, items, calculating, orderDiscountPercent, applyOrderDiscount } = useQuotation();

  const subtotal = calculation?.subtotal || items.reduce((acc, it) => acc + (it.listPrice || 0) * (it.quantity || 1), 0);
  const totalDiscount = calculation?.totalDiscountAmount || 0;
  const grandTotal = calculation?.grandTotal || subtotal - totalDiscount;
  const blendedMargin = calculation?.blendedMarginPercent || 0;
  const requiresApproval = calculation?.requiresApproval || false;

  return (
    <Card className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-apple-card">
      <CardHeader className="pb-4 border-b border-black/[0.08] dark:border-white/[0.08] mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] text-[#0071e3] dark:text-[#2997ff]">
            <Calculator className="w-4.5 h-4.5" />
          </div>
          <div>
            <CardTitle className="text-[16px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Commercial Pricing Summary</CardTitle>
            <p className="text-[12px] text-[#6e6e73] dark:text-[#86868b] mt-0.5">Real-time CPQ calculation & margins</p>
          </div>
        </div>
        {calculating && (
          <span className="text-[12px] text-[#0071e3] dark:text-[#2997ff] animate-pulse font-mono font-medium">
            Recalculating...
          </span>
        )}
      </CardHeader>

      <div className="space-y-4 text-[13px]">
        {/* Order-Level Discount Control */}
        <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-[#0071e3] dark:text-[#2997ff]" />
              Order-Level Concession (%)
            </span>
            <div className="flex items-center space-x-1.5">
              <input
                type="number"
                min="0"
                max="50"
                value={orderDiscountPercent || 0}
                onChange={(e) => applyOrderDiscount(e.target.value)}
                className="w-16 h-7 text-right bg-white dark:bg-white/[0.06] border border-black/[0.12] dark:border-white/[0.12] rounded-lg px-2 text-[#1d1d1f] dark:text-white font-mono text-[12px] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
              />
              <span className="text-[#86868b] font-mono text-[12px]">%</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {[0, 5, 10, 15, 20].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => applyOrderDiscount(pct)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  orderDiscountPercent === pct
                    ? 'bg-[#0071e3] text-white font-bold'
                    : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center text-[#6e6e73] dark:text-[#86868b]">
          <span>Gross Catalog Subtotal</span>
          <span className="font-mono text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold text-[14px]">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center text-[#6e6e73] dark:text-[#86868b]">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-[#1b7a36] dark:text-[#30d158]" />
            <span>Applied Volume & Tier Discounts</span>
          </div>
          <span className="font-mono text-[#1b7a36] dark:text-[#30d158] font-semibold text-[14px]">
            -{formatCurrency(totalDiscount)} ({formatPercent(calculation?.totalDiscountPercent || 0)})
          </span>
        </div>

        <div className="flex justify-between items-center text-[#6e6e73] dark:text-[#86868b]">
          <span>Target Deal Blended Margin</span>
          <div className="flex items-center space-x-2.5">
            <span
              className={`font-mono font-semibold text-[14px] ${
                blendedMargin >= 40
                  ? 'text-[#1b7a36] dark:text-[#30d158]'
                  : blendedMargin >= 25
                  ? 'text-[#9e5200] dark:text-[#ff9f0a]'
                  : 'text-[#c9342c] dark:text-[#ff453a]'
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

        <div className="pt-4 border-t border-black/[0.08] dark:border-white/[0.08] flex justify-between items-baseline">
          <div>
            <div className="text-[15px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">Net Contract Value</div>
            <div className="text-[11px] text-[#6e6e73] dark:text-[#86868b] font-mono mt-0.5">Billed per agreement terms</div>
          </div>
          <div className="text-[24px] font-bold font-mono text-[#0071e3] dark:text-[#2997ff] tracking-tight">
            {formatCurrency(grandTotal)}
          </div>
        </div>

        {requiresApproval ? (
          <div className="mt-4 p-4 rounded-xl bg-[#ff9f0a]/10 dark:bg-[#ff9f0a]/15 border border-[#ff9f0a]/30 flex items-start space-x-3 text-[#9e5200] dark:text-[#ff9f0a]">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
            <div className="text-[12px] leading-relaxed">
              <span className="font-semibold block text-[13px] mb-0.5">Manager Approval Triggered</span>
              {calculation?.approvalReason || 'Discount depth or margin thresholds require managerial authorization before issuance.'}
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-xl bg-[#34c759]/10 dark:bg-[#30d158]/15 border border-[#34c759]/30 flex items-center space-x-3 text-[#1b7a36] dark:text-[#30d158]">
            <ShieldCheck className="w-4.5 h-4.5 shrink-0" />
            <span className="text-[12px] font-medium leading-relaxed">
              Within standard delegation of authority. Direct quotation issue eligible.
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DiscountSummary;
