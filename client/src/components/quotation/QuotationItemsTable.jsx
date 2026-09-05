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
      <Card className="p-10 sm:p-12 text-center rounded-[22px] border-dashed border-black/[0.12] dark:border-white/[0.12] bg-white/60 dark:bg-[#161618]/60 backdrop-blur-xl mb-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] flex items-center justify-center text-[#6e6e73] dark:text-[#86868b]">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <h4 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Quote Configuration is Empty</h4>
        <p className="text-[13px] text-[#6e6e73] dark:text-[#86868b] mt-1.5 max-w-sm mx-auto">
          Select products from the catalog above or accept intelligent upsell suggestions to start building your proposal.
        </p>
      </Card>
    );
  }

  // Use calculated items if available from backend CPQ engine, otherwise fallback to raw items
  const displayItems = calculation?.items || items;

  return (
    <Card className="mb-6 overflow-hidden rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-apple-card p-0">
      <div className="p-5 sm:p-6 pb-4 border-b border-black/[0.08] dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <CardTitle className="text-[16px] sm:text-[17px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Configured Line Items</CardTitle>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#86868b] font-mono font-medium">
            {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>
        <div className="text-[12px] text-[#6e6e73] dark:text-[#86868b] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0071e3] dark:bg-[#2997ff]" />
          <span>Automated Volume & Tier Discounts Applied</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
          <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[11px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
            <tr>
              <th className="py-3.5 px-5">Item & SKU</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4 text-right">List Price</th>
              <th className="py-3.5 px-3 text-center">Qty</th>
              <th className="py-3.5 px-4 text-right">Discount</th>
              <th className="py-3.5 px-4 text-right">Net Price</th>
              <th className="py-3.5 px-4 text-right">Margin %</th>
              <th className="py-3.5 px-5 text-right">Line Total</th>
              <th className="py-3.5 px-3 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
            {displayItems.map((item) => {
              const prodId = item.productId || item.product?._id || item.product;
              const margin = item.marginPercent || 0;
              const marginColor =
                margin >= 40 ? 'text-[#1b7a36] dark:text-[#30d158]' : margin >= 20 ? 'text-[#9e5200] dark:text-[#ff9f0a]' : 'text-[#c9342c] dark:text-[#ff453a]';

              return (
                <tr key={prodId} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 font-semibold text-[#1d1d1f] dark:text-white">
                    <div>{item.productName || item.product?.name}</div>
                    <div className="text-[11px] font-mono text-[#86868b] dark:text-[#86868b]">{item.sku || item.product?.sku}</div>
                  </td>

                  <td className="py-4 px-4">
                    <Badge variant="default" size="xs">
                      {item.category || item.product?.category || 'Software'}
                    </Badge>
                  </td>

                  <td className="py-4 px-4 text-right font-mono text-[#6e6e73] dark:text-[#86868b]">
                    {formatCurrency(item.listPrice || item.product?.basePrice)}
                  </td>

                  <td className="py-4 px-3 text-center">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItemQuantity(prodId, e.target.value)}
                      className="w-16 h-8 text-center bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.12] dark:border-white/[0.12] rounded-lg px-2 text-[#1d1d1f] dark:text-white font-mono text-[12px] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
                    />
                  </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <input
                        type="number"
                        min="0"
                        max="70"
                        step="1"
                        value={item.discountPercent || 0}
                        onChange={(e) => updateItemDiscount(prodId, e.target.value)}
                        className="w-14 h-8 text-right bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.12] dark:border-white/[0.12] rounded-lg px-2 text-[#1d1d1f] dark:text-white font-mono text-[12px] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
                      />
                      <span className="text-[#86868b] text-[12px]">%</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right font-mono text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {formatCurrency(item.netUnitPrice || item.listPrice)}
                  </td>

                  <td className="py-4 px-4 text-right font-mono font-medium">
                    <span className={marginColor}>{formatPercent(margin)}</span>
                  </td>

                  <td className="py-4 px-5 text-right font-mono font-semibold text-[#1d1d1f] dark:text-white">
                    {formatCurrency(item.lineTotal || (item.listPrice || 0) * (item.quantity || 1))}
                  </td>

                  <td className="py-4 px-3 text-center">
                    <button
                      onClick={() => removeItem(prodId)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#86868b] hover:text-[#ff453a] hover:bg-[#ff453a]/10 transition-colors"
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
