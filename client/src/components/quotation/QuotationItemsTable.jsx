import React from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { Trash2, ShoppingCart, Percent, TrendingUp } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '../common/Card';
import Badge from '../common/Badge';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export const QuotationItemsTable = () => {
  const { items, removeItem, updateItemQuantity, updateItemDiscount, calculation } = useQuotation();

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed border-slate-800 bg-slate-900/30 mb-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-200">Quote Configuration is Empty</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Select products from the catalog above or accept intelligent upsell suggestions to start building your proposal.
        </p>
      </Card>
    );
  }

  // Use calculated items if available from backend CPQ engine, otherwise fallback to raw items
  const displayItems = calculation?.items || items;

  return (
    <Card className="mb-6 overflow-hidden border-slate-800 bg-slate-900/60">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <CardTitle>Configured Line Items</CardTitle>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <span>Automated Volume & Tier Discounts Applied</span>
        </div>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Item & SKU</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3 text-right">List Price</th>
              <th className="py-3 px-3 text-center">Qty</th>
              <th className="py-3 px-3 text-right">Discount</th>
              <th className="py-3 px-3 text-right">Net Price</th>
              <th className="py-3 px-3 text-right">Margin %</th>
              <th className="py-3 px-4 text-right">Line Total</th>
              <th className="py-3 px-2 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {displayItems.map((item) => {
              const prodId = item.productId || item.product?._id || item.product;
              const margin = item.marginPercent || 0;
              const marginColor =
                margin >= 40 ? 'text-emerald-400' : margin >= 20 ? 'text-amber-400' : 'text-rose-400';

              return (
                <tr key={prodId} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-100">
                    <div>{item.productName || item.product?.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{item.sku || item.product?.sku}</div>
                  </td>

                  <td className="py-3.5 px-3">
                    <Badge variant="default" size="xs">
                      {item.category || item.product?.category || 'Software'}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono text-slate-300">
                    {formatCurrency(item.listPrice || item.product?.basePrice)}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItemQuantity(prodId, e.target.value)}
                      className="w-16 text-center bg-slate-950 border border-slate-700/80 rounded px-2 py-1 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <input
                        type="number"
                        min="0"
                        max="70"
                        step="1"
                        value={item.discountPercent || 0}
                        onChange={(e) => updateItemDiscount(prodId, e.target.value)}
                        className="w-14 text-right bg-slate-950 border border-slate-700/80 rounded px-1.5 py-1 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-slate-500 text-xs">%</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono text-slate-200">
                    {formatCurrency(item.netUnitPrice || item.listPrice)}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-medium">
                    <span className={marginColor}>{formatPercent(margin)}</span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">
                    {formatCurrency(item.lineTotal || (item.listPrice || 0) * (item.quantity || 1))}
                  </td>

                  <td className="py-3.5 px-2 text-center">
                    <button
                      onClick={() => removeItem(prodId)}
                      className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default QuotationItemsTable;
