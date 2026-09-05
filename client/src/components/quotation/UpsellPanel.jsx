import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import Card, { CardHeader, CardTitle } from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { Sparkles, Plus, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const UpsellPanel = () => {
  const { calculation, addItem } = useQuotation();

  const recommendations = calculation?.upsellRecommendations || [];

  if (recommendations.length === 0) return null;

  return (
    <Card className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-apple-card mb-6">
      <CardHeader className="pb-4 border-b border-black/[0.08] dark:border-white/[0.08] mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] text-[#0071e3] dark:text-[#2997ff]">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <CardTitle className="text-[16px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Recommended Expansion & Upsells</CardTitle>
            <p className="text-[12px] text-[#6e6e73] dark:text-[#86868b] mt-0.5">High margin opportunities tailored for this account</p>
          </div>
        </div>
        <Badge variant="primary" size="sm">
          AI Suggested
        </Badge>
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.slice(0, 4).map((rec) => {
          const prod = rec.product;
          return (
            <div
              key={prod._id}
              className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#0071e3]/40 dark:hover:border-white/[0.2] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">{prod.name}</h5>
                    <span className="text-[11px] text-[#6e6e73] dark:text-[#86868b] font-mono">{prod.category}</span>
                  </div>
                  <span className="text-[13px] font-mono font-semibold text-[#0071e3] dark:text-[#2997ff]">
                    {formatCurrency(prod.basePrice)}
                  </span>
                </div>
                <p className="text-[12px] text-[#6e6e73] dark:text-[#86868b] mt-2 leading-relaxed">
                  {rec.rationale}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-[#1b7a36] dark:text-[#30d158] flex items-center gap-1.5 font-mono font-medium">
                  <TrendingUp className="w-3.5 h-3.5" /> +{formatCurrency(rec.projectedRevenueLift)} ACV Lift
                </span>
                <Button
                  onClick={() => addItem(prod)}
                  variant="secondary"
                  size="xs"
                  icon={Plus}
                >
                  Add to Quote
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default UpsellPanel;
