import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Plus, ArrowRight } from 'lucide-react';

export const SubscriptionsPage = () => {
  const navigate = useNavigate();

  // Screen 9 exact rows from wireframe
  const subscriptions = [
    { id: 'sub-01', customer: 'Acme Corp', plan: 'Care Plan 2yr', cycle: 'Monthly', nextBill: 'Sep 15', status: 'Active' },
    { id: 'sub-02', customer: 'Beta Industries', plan: 'Support SLA', cycle: 'Quarterly', nextBill: 'Nov 1', status: 'Active' },
    { id: 'sub-03', customer: 'Delta LLC', plan: 'Care Plan 1yr', cycle: 'Monthly', nextBill: '-', status: 'Paused' }
  ];

  return (
    <div className="space-y-8">
      {/* Screen 9 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div>
          <h1 className="text-[26px] sm:text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.025em]">
            Subscriptions
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b] mt-1">
            Recurring billing lifecycle, active SaaS contracts, and proration schedules
          </p>
        </div>

        {/* Status Pills (from Wireframe: 18 Active, 2 Paused, 3 Cancelled) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="h-9 px-4 rounded-full text-[13px] font-medium bg-[#34c759]/15 text-[#1b7a36] dark:text-[#30d158] border border-[#34c759]/30 flex items-center whitespace-nowrap w-fit shrink-0">
            18 Active
          </span>
          <span className="h-9 px-4 rounded-full text-[13px] font-medium bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a] border border-[#ff9f0a]/30 flex items-center whitespace-nowrap w-fit shrink-0">
            2 Paused
          </span>
          <span className="h-9 px-4 rounded-full text-[13px] font-medium bg-[#ff453a]/15 text-[#c9342c] dark:text-[#ff453a] border border-[#ff453a]/30 flex items-center whitespace-nowrap w-fit shrink-0">
            3 Cancelled
          </span>

          <Button
            onClick={() => alert('New subscription plan modal opened.')}
            variant="primary"
            size="md"
            icon={Plus}
            className="ml-1"
          >
            New Plan
          </Button>
        </div>
      </div>

      {/* Screen 9 Table */}
      <Card className="p-0 overflow-hidden rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 font-semibold whitespace-nowrap">Customer</th>
                <th className="py-3.5 px-5 font-semibold whitespace-nowrap">Plan</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Cycle</th>
                <th className="py-3.5 px-5 font-mono font-semibold whitespace-nowrap">Next Bill</th>
                <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {subscriptions.map((sub) => (
                <tr
                  key={sub.id}
                  onClick={() => navigate(`/subscriptions/${sub.id}`)}
                  className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] cursor-pointer transition-colors"
                >
                  <td className="py-4 px-5 font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                    {sub.customer}
                  </td>
                  <td className="py-4 px-5 text-[#0071e3] dark:text-[#2997ff] font-medium whitespace-nowrap">
                    {sub.plan}
                  </td>
                  <td className="py-4 px-4 text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">
                    {sub.cycle}
                  </td>
                  <td className="py-4 px-5 font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">
                    {sub.nextBill}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <Badge variant={sub.status === 'Active' ? 'success' : 'warning'} size="xs">
                      {sub.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <ArrowRight className="w-4 h-4 text-[#6e6e73] dark:text-[#86868b]" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Wireframe Exact Callout */}
        <div className="p-4 sm:p-5 bg-black/[0.02] dark:bg-white/[0.03] border-t border-black/[0.08] dark:border-white/[0.08] text-[13px] text-[#6e6e73] dark:text-[#86868b]">
          Click a subscription row to open its billing detail and proration history.
        </div>
      </Card>
    </div>
  );
};

export default SubscriptionsPage;
