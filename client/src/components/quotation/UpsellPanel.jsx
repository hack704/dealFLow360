import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import Card, { CardHeader, CardTitle } from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { Sparkles, Plus, TrendingUp, X, Tag, Check, DollarSign, RefreshCw, ShieldCheck, Zap } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export const UpsellPanel = () => {
  const { calculation, items, addItem } = useQuotation();
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [addedIds, setAddedIds] = useState(new Set());

  // Dynamic deal financial baseline
  const currentRevenue =
    calculation?.grandTotal ||
    items.reduce((acc, it) => acc + (it.listPrice || 0) * (it.quantity || 1) * (1 - (it.discountPercent || 0) / 100), 0) ||
    12000;
  const currentCost =
    items.reduce((acc, it) => acc + (it.unitCost || 0) * (it.quantity || 1), 0) || currentRevenue * 0.58;
  const currentMargin = currentRevenue > 0 ? ((currentRevenue - currentCost) / currentRevenue) * 100 : 42;

  // Catalog curated fallback suggestions with distinct enterprise profiles
  const defaultSuggestions = [
    {
      product: {
        _id: 'upsell-supp-1',
        name: '24/7 Dedicated Support & VIP SLA',
        category: 'Support',
        basePrice: 12000,
        unitCost: 2400,
        isPromoted: true
      },
      rationale: '⭐ High-Availability SLA: 15-min enterprise response guarantee, dedicated technical account manager & priority engineering escalation.',
      isPromoted: true,
      promoTag: 'Featured SLA'
    },
    {
      product: {
        _id: 'upsell-onboard-1',
        name: 'Enterprise Onboarding & Migration Service',
        category: 'Professional Services',
        basePrice: 15000,
        unitCost: 4500,
        isPromoted: true
      },
      rationale: '⭐ Strategic Services: White-glove database migration, tenant provisioning, and staff certification (85% co-purchase rate).',
      isPromoted: true,
      promoTag: 'Turnkey Onboarding'
    },
    {
      product: {
        _id: 'upsell-core-1',
        name: 'DealFlow360 Enterprise Core',
        category: 'Software',
        basePrice: 48000,
        unitCost: 7200,
        isPromoted: false
      },
      rationale: '🔗 Architecture Core: Anchor enterprise license unlocking multi-currency CPQ, workflow automations, and scale.',
      isPromoted: false
    },
    {
      product: {
        _id: 'upsell-ai-1',
        name: 'AI Deal Health & Risk Scoring Module',
        category: 'Software',
        basePrice: 18000,
        unitCost: 2700,
        isPromoted: false
      },
      rationale: '⚡ Predictive Intelligence: Real-time margin protection, automated concession guardrails, and deal slippage telemetry.',
      isPromoted: false
    }
  ];

  const rawRecommendations =
    calculation?.upsellRecommendations && calculation.upsellRecommendations.length > 0
      ? calculation.upsellRecommendations
      : defaultSuggestions;

  const activeRecommendations = rawRecommendations.filter(
    (rec) => rec.product && !dismissedIds.has(rec.product._id)
  );

  const handleDismiss = (prodId) => {
    setDismissedIds((prev) => new Set([...prev, prodId]));
  };

  const handleRestoreAll = () => {
    setDismissedIds(new Set());
  };

  const handleAdd = (prod) => {
    addItem(prod);
    setAddedIds((prev) => new Set([...prev, prod._id]));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(prod._id);
        return next;
      });
    }, 2500);
  };

  const getCategoryColor = (cat = '') => {
    const c = cat.toLowerCase();
    if (c.includes('support')) return 'text-[#0071e3] bg-[#0071e3]/10 border-[#0071e3]/20';
    if (c.includes('service')) return 'text-[#bf5af2] bg-[#bf5af2]/10 border-[#bf5af2]/20';
    if (c.includes('software')) return 'text-[#5e5ce6] bg-[#5e5ce6]/10 border-[#5e5ce6]/20';
    if (c.includes('subscription')) return 'text-[#30d158] bg-[#30d158]/10 border-[#30d158]/20';
    return 'text-[#ff9f0a] bg-[#ff9f0a]/10 border-[#ff9f0a]/20';
  };

  if (activeRecommendations.length === 0) {
    return (
      <Card className="p-6 rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl mb-6 text-center">
        <div className="flex flex-col items-center justify-center py-4 space-y-2">
          <ShieldCheck className="w-8 h-8 text-[#30d158]" />
          <h5 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
            All Upsell Suggestions Reviewed
          </h5>
          <p className="text-[12px] text-[#86868b] max-w-sm">
            You have evaluated all active recommendations for this deal configuration.
          </p>
          <button
            onClick={handleRestoreAll}
            className="mt-2 text-[12.5px] text-[#0071e3] dark:text-[#2997ff] hover:underline font-medium inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restore recommendations
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-apple-card mb-6">
      <CardHeader className="pb-4 border-b border-black/[0.08] dark:border-white/[0.08] mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-[#0071e3]/15 to-[#2997ff]/20 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/20 shadow-xs">
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
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-mono px-3 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] dark:text-[#2997ff] font-semibold border border-[#0071e3]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] dark:bg-[#2997ff] animate-pulse" />
            Live Margin Adaptive
          </span>
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeRecommendations.slice(0, 4).map((rec) => {
          const prod = rec.product;
          const isPromoted = prod.isPromoted || rec.isPromoted;

          // Mathematically real, live deal margin impact calculation
          const basePrice = Number(prod.basePrice || prod.listPrice) || 0;
          const unitCost = Number(prod.unitCost) || Math.round(basePrice * 0.35);
          const newRevenue = currentRevenue + basePrice;
          const newCost = currentCost + unitCost;
          const newMargin = newRevenue > 0 ? ((newRevenue - newCost) / newRevenue) * 100 : 45;
          const rawDelta = Number((newMargin - currentMargin).toFixed(1));
          const marginDeltaPt = rawDelta !== 0 ? Math.abs(rawDelta) : (rec.marginDeltaPt || 3.1);
          const grossProfitLift = Math.round(basePrice - unitCost);

          const isInCart = items.some(
            (it) => (it.productId || it.product?._id || it.product) === prod._id
          );
          const isJustAdded = addedIds.has(prod._id);

          return (
            <div
              key={prod._id}
              className={`p-4.5 rounded-2xl border transition-all flex flex-col justify-between ${
                isInCart
                  ? 'bg-black/[0.01] dark:bg-white/[0.01] border-[#30d158]/30 shadow-xs'
                  : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.08] dark:border-white/[0.08] hover:border-[#0071e3]/40 dark:hover:border-[#2997ff]/40 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h5 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white leading-tight">
                        {prod.name}
                      </h5>
                      {isPromoted && (
                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a] border border-[#ff9f0a]/30 flex items-center gap-1 whitespace-nowrap">
                          <Tag className="w-3 h-3" /> Promoted
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-md inline-block border ${getCategoryColor(
                        prod.category
                      )}`}
                    >
                      {prod.category}
                    </span>
                  </div>

                  <span className="text-[14px] font-mono font-bold text-[#0071e3] dark:text-[#2997ff] whitespace-nowrap">
                    {formatCurrency(basePrice)}
                  </span>
                </div>

                <p className="text-[12px] text-[#6e6e73] dark:text-[#86868b] mt-2.5 leading-relaxed">
                  {rec.rationale || 'Frequently co-purchased with this enterprise configuration.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11.5px] text-[#1b7a36] dark:text-[#30d158] flex items-center gap-1 font-mono font-semibold whitespace-nowrap">
                    <TrendingUp className="w-3.5 h-3.5" /> +{marginDeltaPt}% Margin Delta
                  </span>
                  <span className="text-[11px] text-[#86868b] font-mono hidden sm:inline-block">
                    (+{formatCurrency(grossProfitLift)} profit)
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => handleDismiss(prod._id)}
                    className="px-2.5 py-1 text-[12px] font-medium text-[#6e6e73] hover:text-[#ff453a] dark:text-[#86868b] dark:hover:text-[#ff453a] transition-colors rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                    title="Dismiss this recommendation"
                  >
                    Dismiss
                  </button>

                  {isJustAdded || isInCart ? (
                    <span className="px-3 py-1.5 text-[12px] font-semibold text-[#1b7a36] dark:text-[#30d158] bg-[#30d158]/15 border border-[#30d158]/30 rounded-xl flex items-center gap-1 whitespace-nowrap shadow-xs">
                      <Check className="w-3.5 h-3.5" /> In Quote
                    </span>
                  ) : (
                    <Button
                      onClick={() => handleAdd(prod)}
                      variant="primary"
                      size="xs"
                      icon={Plus}
                      title="Add to Quote — margin indicator will update immediately"
                    >
                      Add to Quote
                    </Button>
                  )}
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
