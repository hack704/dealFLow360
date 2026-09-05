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
    <Card className="border-indigo-900/40 bg-indigo-950/10 mb-6">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <CardTitle className="text-indigo-200">Recommended Expansion & Upsells</CardTitle>
        </div>
        <Badge variant="primary" size="xs">
          AI Suggested
        </Badge>
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {recommendations.slice(0, 4).map((rec) => {
          const prod = rec.product;
          return (
            <div
              key={prod._id}
              className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-indigo-800/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-xs font-semibold text-white">{prod.name}</h5>
                    <span className="text-[10px] text-slate-400 font-mono">{prod.category}</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-indigo-300">
                    {formatCurrency(prod.basePrice)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  {rec.rationale}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <TrendingUp className="w-3 h-3" /> +{formatCurrency(rec.projectedRevenueLift)} ACV Lift
                </span>
                <Button
                  onClick={() => addItem(prod)}
                  variant="outline"
                  size="xs"
                  icon={Plus}
                  className="hover:border-indigo-500 hover:text-indigo-300"
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
