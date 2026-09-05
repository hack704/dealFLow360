import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ArrowLeft, CreditCard, AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const BillingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState('');

  // Screen 10 exact data from wireframe
  const oneTimeLines = [
    { product: 'Laptop Pro 14', qty: 2, amount: 2280 },
    { product: 'Onsite Setup', qty: 1, amount: 450 }
  ];

  const recurringLines = [
    { plan: 'Care Plan 2yr', cycle: 'Monthly', nextBillDate: 'Sep 15', amount: 46 },
    { plan: 'Support SLA', cycle: 'Quarterly', nextBillDate: 'Nov 1', amount: 300 }
  ];

  return (
    <div className="space-y-8">
      {/* Screen 10 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div>
          <button
            onClick={() => navigate('/subscriptions')}
            className="text-[13px] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] inline-flex items-center gap-2 mb-2 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Subscriptions list</span>
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[26px] sm:text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.025em]">
              Billing Detail: Acme Corp — Care Plan 2yr
            </h1>
            <Badge variant="success" size="sm">
              Active Recurring
            </Badge>
          </div>
          <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b] mt-1">
            Opened by clicking a row on the Subscriptions list
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setMessage('Subscription modified. Mid-cycle proration applied.')}
            variant="primary"
            size="md"
          >
            Modify Subscription
          </Button>

          <Button
            onClick={() => setMessage('Subscription cancellation initiated effective end of term.')}
            variant="danger"
            size="md"
            icon={XCircle}
          >
            Cancel Subscription
          </Button>
        </div>
      </div>

      {message && (
        <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white">
          {message}
        </div>
      )}

      {/* Section 1: One-Time Lines — Originating Order */}
      <Card className="p-0 overflow-hidden rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
        <div className="p-5 sm:p-6 pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
          <CardTitle className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">One-Time Lines — Originating Order</CardTitle>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#6e6e73] dark:text-apple-muted">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Product</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Qty</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {oneTimeLines.map((it, idx) => (
                <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">{it.product}</td>
                  <td className="py-4 px-4 text-center font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">{it.qty}</td>
                  <td className="py-4 px-5 text-right font-mono font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                    {formatCurrency(it.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section 2: Recurring Lines */}
      <Card className="p-0 overflow-hidden rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
        <div className="p-5 sm:p-6 pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
          <CardTitle className="text-[15px] font-semibold text-[#0071e3] dark:text-[#2997ff]">Recurring Lines & Subscription Schedules</CardTitle>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#6e6e73] dark:text-apple-muted">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Plan</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Cycle</th>
                <th className="py-3.5 px-4 font-mono whitespace-nowrap">Next Bill Date</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {recurringLines.map((it, idx) => (
                <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">{it.plan}</td>
                  <td className="py-4 px-4 text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">{it.cycle}</td>
                  <td className="py-4 px-4 font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">{it.nextBillDate}</td>
                  <td className="py-4 px-5 text-right font-mono font-semibold text-[#1b7a36] dark:text-[#30d158] whitespace-nowrap">
                    {formatCurrency(it.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default BillingDetailPage;
