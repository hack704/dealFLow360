import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quotationService from '../../services/quotationService';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import {
  ArrowLeft,
  Sparkles,
  Plus,
  Save,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  Printer
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/formatters';

export const QuotationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('Acme Corp');
  const [priceList, setPriceList] = useState('Standard Enterprise (USD)');
  const [quoteId, setQuoteId] = useState(id || 'Q-1042');

  // Screen 4 items from wireframe
  const [items, setItems] = useState([
    { id: 1, name: 'Laptop Pro 14', qty: 2, price: 1200, discount: 12, limit: 15 },
    { id: 2, name: 'Onsite Setup Service', qty: 1, price: 450, discount: 18, limit: 10 },
    { id: 3, name: 'Extended Warranty', qty: 1, price: 180, discount: 10, limit: 15 }
  ]);

  const [upsells, setUpsells] = useState([
    { id: 'u1', name: 'Wireless Mouse', benefit: 'Margin +$18', price: 45 },
    { id: 'u2', name: 'Docking Station', benefit: 'Promo: 12% off', price: 180 },
    { id: 'u3', name: 'Care Plan 2yr', benefit: 'Margin +$46', price: 290 }
  ]);

  const [statusMessage, setStatusMessage] = useState('');

  const updateQuantity = (itemId, newQty) => {
    const qty = Math.max(1, parseInt(newQty, 10) || 1);
    setItems(items.map((it) => (it.id === itemId ? { ...it, qty } : it)));
  };

  const updateDiscount = (itemId, newDisc) => {
    const discount = Math.min(100, Math.max(0, parseFloat(newDisc) || 0));
    setItems(items.map((it) => (it.id === itemId ? { ...it, discount } : it)));
  };

  const addUpsell = (upsell) => {
    setItems([
      ...items,
      {
        id: Date.now(),
        name: upsell.name,
        qty: 1,
        price: upsell.price,
        discount: 0,
        limit: 15
      }
    ]);
    setUpsells(upsells.filter((u) => u.id !== upsell.id));
  };

  const hasOverLimit = items.some((it) => it.discount > it.limit);

  const subtotal = items.reduce((acc, it) => acc + it.price * it.qty, 0);
  const totalDiscount = items.reduce(
    (acc, it) => acc + it.price * it.qty * (it.discount / 100),
    0
  );
  const grandTotal = subtotal - totalDiscount;

  const handleAction = (action) => {
    if (action === 'submit') {
      setStatusMessage('Quotation submitted for approval! Routing to Screen 6.');
      setTimeout(() => navigate('/approvals/Q-1042'), 1000);
    } else {
      setStatusMessage('Draft saved successfully.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Screen 4 Header (from Wireframe) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div>
          <button
            onClick={() => navigate('/quotations')}
            className="text-[13px] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] inline-flex items-center gap-2 mb-2 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Quotations list</span>
          </button>
          <h1 className="text-[26px] sm:text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.025em]">
            4. Quotation Detail: {quoteId} ({customerName})
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b] mt-1">
            Opened by clicking a row on the Quotations list. Add products, apply discounts, review upsells.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button onClick={() => handleAction('draft')} variant="secondary" size="md" icon={Save}>
            Save Draft
          </Button>
          <Button
            onClick={() => handleAction('submit')}
            variant={hasOverLimit ? 'primary' : 'success'}
            size="md"
            icon={Send}
          >
            {hasOverLimit ? 'Submit for Approval' : 'Confirm Quotation'}
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#34c759]/10 border border-[#34c759]/30 text-[13px] text-[#1b7a36] dark:text-[#30d158] flex items-center gap-3">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold">{statusMessage}</span>
        </div>
      )}

      {/* Customer & Price List Header Inputs */}
      <Card className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Customer"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <Input
            label="Price List"
            value={priceList}
            onChange={(e) => setPriceList(e.target.value)}
          />
        </div>
      </Card>

      {/* Screen 4 Products & Discounts Table */}
      <Card className="p-0 overflow-hidden rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="p-5 sm:p-6 pb-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <CardTitle className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Products & Discount Line Items</CardTitle>
          <span className="text-[13px] text-[#6e6e73] dark:text-[#86868b] font-mono px-3.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] whitespace-nowrap">{items.length} active lines</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Product</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Qty</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Price</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Discount</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Limit</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Status</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {items.map((item) => {
                const isOver = item.discount > item.limit;
                const diff = item.discount - item.limit;
                const lineTotal = item.price * item.qty * (1 - item.discount / 100);

                return (
                  <tr key={item.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5 font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">{item.name}</td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateQuantity(item.id, e.target.value)}
                        className="w-16 h-8 text-center bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.12] dark:border-white/[0.12] rounded-lg px-2 text-[#1d1d1f] dark:text-white font-mono text-[13px] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
                      />
                    </td>

                    <td className="py-4 px-4 text-right font-mono text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">
                      {formatCurrency(item.price)}
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) => updateDiscount(item.id, e.target.value)}
                          className="w-16 h-8 text-right bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.12] dark:border-white/[0.12] rounded-lg px-2 text-[#1d1d1f] dark:text-white font-mono text-[13px] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
                        />
                        <span className="text-[#86868b] text-[13px]">%</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">
                      {item.limit}%
                    </td>

                    <td className="py-4 px-4 text-center font-mono whitespace-nowrap">
                      {isOver ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-semibold bg-[#ff453a]/15 text-[#c91d12] dark:text-[#ff453a] border border-[#ff453a]/30 whitespace-nowrap">
                          OVER (+{diff}pt)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[13px] font-semibold bg-[#34c759]/15 text-[#1b7e36] dark:text-[#30d158] border border-[#34c759]/30 whitespace-nowrap">
                          OK
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-right font-mono font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                      {formatCurrency(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Live check callout note (from Wireframe) */}
        <div className="p-4 sm:p-5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.08] dark:border-white/[0.08] text-[13px] text-[#6e6e73] dark:text-[#86868b] flex items-center gap-3">
          <Clock className="w-4.5 h-4.5 text-[#0071e3] dark:text-[#2997ff] shrink-0" />
          <span>
            <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">Live Policy Validation:</strong> Discount is checked against each line's own limit live, as soon as it is entered, not only at submit time.
          </span>
        </div>
      </Card>

      {/* Screen 4 Upsell and Cross-Sell Suggestions */}
      <Card className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-black/[0.08] dark:border-white/[0.08] mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] text-[#0071e3] dark:text-[#2997ff]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Upsell and Cross-Sell Suggestions
            </h3>
            <p className="text-[13px] text-[#6e6e73] dark:text-[#86868b]">Pre-screened recommendations to expand deal volume</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {upsells.map((up) => (
            <div
              key={up.id}
              className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#0071e3]/40 dark:hover:border-white/[0.2] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">{up.name}</div>
                <div className="text-[13px] text-[#1b7e36] dark:text-[#30d158] font-mono mt-1 font-medium whitespace-nowrap">{up.benefit}</div>
              </div>
              <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-[13px] font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">{formatCurrency(up.price)}</span>
                <Button onClick={() => addUpsell(up)} variant="secondary" size="xs" icon={Plus}>
                  Add
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Total Aggregation */}
      <div className="flex justify-end pt-2">
        <div className="p-6 sm:p-7 rounded-[22px] bg-white/90 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] w-full sm:w-96 space-y-3.5 text-[13px] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
          <div className="flex justify-between text-[#6e6e73] dark:text-[#86868b]">
            <span className="whitespace-nowrap">Subtotal:</span>
            <span className="font-mono text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold text-[13px] whitespace-nowrap">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[#1b7e36] dark:text-[#30d158]">
            <span className="whitespace-nowrap">Total Discount:</span>
            <span className="font-mono font-semibold text-[13px] whitespace-nowrap">-{formatCurrency(totalDiscount)}</span>
          </div>
          <div className="pt-3.5 border-t border-black/[0.08] dark:border-white/[0.08] flex justify-between items-baseline">
            <span className="text-[15px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">Net Contract Total:</span>
            <span className="font-mono text-[#0071e3] dark:text-[#2997ff] text-[22px] font-bold whitespace-nowrap">{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetailsPage;
