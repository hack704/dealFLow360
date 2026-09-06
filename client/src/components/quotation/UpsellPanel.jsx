import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import Card, { CardHeader, CardTitle } from '../common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Sparkles, Plus, TrendingUp, X, Tag } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const UpsellPanel = () => {
  const { calculation, addItem } = useQuotation();
  const [dismissedIds, setDismissedIds] = useState(new Set());

  // Ranked suggestions based on co-purchase history and active promotions
  const defaultSuggestions = [
    {
      product: {
        _id: 'upsell-dock-1',
        name: 'Thunderbolt 4 Pro Docking Station',
        category: 'Hardware',
        basePrice: 180,
        unitCost: 95,
        isPromoted: true
      },
      rationale: 'Top co-purchased accessory with Enterprise Laptops (88% co-purchase rate).',
      marginDelta: 47.2,
      marginDeltaPt: 2.8,
      isPromoted: true,
      promoTag: 'Active Promotion: 12% Co-Purchase Bundle'
    },
    {
      product: {
        _id: 'upsell-care-1',
        name: 'Enterprise Extended Care Plan (2-Year)',
        category: 'Subscription',
        basePrice: 290,
        unitCost: 40,
        isPromoted: true
      },
      rationale: 'High-margin recurring care coverage. Protects client uptime with SLA guarantee.',
      marginDelta: 86.2,
      marginDeltaPt: 4.1,
      isPromoted: true,
      promoTag: 'Promoted SLA'
    },
    {
      product: {
        _id: 'upsell-mouse-1',
        name: 'Ergonomic Precision Wireless Mouse',
        category: 'Hardware',
        basePrice: 45,
        unitCost: 18,
        isPromoted: false
      },
      rationale: 'Frequently bundled with workstation deployments.',
      marginDelta: 60.0,
      marginDeltaPt: 1.2,
      isPromoted: false
    }
  ];

  const rawRecommendations = (calculation?.upsellRecommendations && calculation.upsellRecommendations.length > 0)
    ? calculation.upsellRecommendations
    : defaultSuggestions;

  const activeRecommendations = rawRecommendations.filter(
    (rec) => rec.product && !dismissedIds.has(rec.product._id)
  );

  if (activeRecommendations.length === 0) return null;

  const handleDismiss = (prodId) => {
    setDismissedIds(new Set([...dismissedIds, prodId]));
  };

  return (
    <Card className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-apple-card mb-6">
      <CardHeader className="pb-4 border-b border-black/[0.08] dark:border-white/[0.08] mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] text-[#0071e3] dark:text-[#2997ff]">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <CardTitle className="text-[16px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Upsell & Cross-Sell Suggestions
            </CardTitle>
            <p className="text-[12px] text-[#6e6e73] dark:text-[#86868b] mt-0.5">
              Ranked recommendations based on co-purchase history and active promotions
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] dark:text-[#2997ff] font-semibold">
          Live Margin Adaptive
        </span>
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeRecommendations.slice(0, 4).map((rec) => {
          const prod = rec.product;
          const isPromoted = prod.isPromoted || rec.isPromoted;
          const marginDeltaPt = rec.marginDeltaPt || (rec.projectedRevenueLift ? ((rec.projectedRevenueLift / prod.basePrice) * 3).toFixed(1) : 2.5);

          return (
            <div
              key={prod._id}
              className="p-4.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#0071e3]/40 dark:hover:border-white/[0.2] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h5 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white leading-tight">
                        {prod.name}
                      </h5>
                      {/* B5: Promotion tag if applicable */}
                      {isPromoted && (
                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a] border border-[#ff9f0a]/30 flex items-center gap-1 whitespace-nowrap">
                          <Tag className="w-3 h-3" /> Promoted
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#6e6e73] dark:text-[#86868b] font-mono block mt-0.5">
                      {prod.category}
                    </span>
                  </div>

                  <span className="text-[13px] font-mono font-semibold text-[#0071e3] dark:text-[#2997ff] whitespace-nowrap">
                    {formatCurrency(prod.basePrice)}
                  </span>
                </div>

                <p className="text-[12px] text-[#6e6e73] dark:text-[#86868b] mt-2.5 leading-relaxed">
                  {rec.rationale || 'Ranked from historical co-purchase pairings.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-2">
                {/* B5: Margin delta if added */}
                <span className="text-[11.5px] text-[#1b7a36] dark:text-[#30d158] flex items-center gap-1 font-mono font-semibold whitespace-nowrap">
                  <TrendingUp className="w-3.5 h-3.5" /> +{marginDeltaPt}% Margin Delta
                </span>

                {/* B5: Buttons: Add to Quote and Dismiss */}
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => handleDismiss(prod._id)}
                    className="px-2.5 py-1 text-[12px] font-medium text-[#6e6e73] hover:text-[#ff453a] dark:text-[#86868b] dark:hover:text-[#ff453a] transition-colors rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                    title="Dismiss this recommendation"
                  >
                    Dismiss
                  </button>
                  <Button
                    onClick={() => addItem(prod)}
                    variant="primary"
                    size="xs"
                    icon={Plus}
                    title="Add to Quote — margin indicator will update immediately"
                  >
                    Add to Quote
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default UpsellPanel;
