import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  TrendingDown,
  Truck,
  Bell,
  ArrowUpRight,
  ShieldAlert,
  Send,
  CheckCircle2,
  Filter
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export const DealHealthPage = () => {
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [deals, setDeals] = useState([
    {
      id: 'Q-1030',
      deal: 'Zenith Co',
      issue: 'Idle 9 days',
      issueType: 'stalled',
      flagged: 'Aug 24',
      action: 'Nudge sent',
      actionStatus: 'done',
      rep: 'J. Rao',
      value: '$18,300',
      riskScore: 68
    },
    {
      id: 'Q-1025',
      deal: 'Delta LLC',
      issue: 'Discount 22% vs avg 8%',
      issueType: 'discount',
      flagged: 'Aug 25',
      action: 'Escalated to Manager',
      actionStatus: 'pending',
      rep: 'M. Chen',
      value: '$34,900',
      riskScore: 84
    },
    {
      id: 'Q-1042',
      deal: 'Acme Corp',
      issue: 'Split delivery delayed +4 days',
      issueType: 'slippage',
      flagged: 'Aug 26',
      action: 'Warehouse notice',
      actionStatus: 'pending',
      rep: 'J. Rao',
      value: '$28,400',
      riskScore: 54
    },
    {
      id: 'Q-1039',
      deal: 'Beta Industries',
      issue: 'Pending Finance approval 3+ days',
      issueType: 'stalled',
      flagged: 'Aug 27',
      action: 'Awaiting Signoff',
      actionStatus: 'pending',
      rep: 'S. Patel',
      value: '$48,000',
      riskScore: 72
    }
  ]);

  const triggerAction = (dealId, newAction) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, action: newAction, actionStatus: 'done' } : d))
    );
    setToastMessage(`Action triggered: ${newAction} for ${dealId}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleEscalateAll = () => {
    setDeals((prev) =>
      prev.map((d) => ({ ...d, action: 'Escalated to Exec VP', actionStatus: 'done' }))
    );
    setToastMessage('All flagged anomalies escalated to Executive VP');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleNudgeAll = () => {
    setDeals((prev) =>
      prev.map((d) => ({ ...d, action: 'Automated Nudge Sent', actionStatus: 'done' }))
    );
    setToastMessage('Automated Slack/Email nudges sent to all assigned sales reps');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-5">
        <div>
          <h1 className="text-[26px] sm:text-[28px] font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
            Deal Health and Anomaly Dashboard
          </h1>
          <p className="text-[13px] text-[#86868b] mt-1">
            Real-time flags for stalled deals and unusual discount patterns
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button
            variant="danger"
            size="md"
            onClick={handleEscalateAll}
          >
            <ShieldAlert className="w-4 h-4 mr-2" />
            Escalate
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleNudgeAll}
          >
            <Send className="w-4 h-4 mr-2" />
            Nudge Rep
          </Button>
        </div>
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-[#0071e3]/10 dark:bg-[#2997ff]/10 border border-[#0071e3]/30 dark:border-[#2997ff]/30 text-[13px] text-[#0071e3] dark:text-[#2997ff] flex items-center space-x-2.5 shadow-sm">
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 3 Anomaly Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Stalled Deals */}
        <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 sm:p-7 backdrop-blur-xl relative overflow-hidden group hover:border-[#ff9f0a]/50 shadow-sm dark:shadow-apple-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-mono uppercase text-[#86868b] whitespace-nowrap">Deal Velocity</span>
            <div className="w-9 h-9 rounded-xl bg-[#ff9f0a]/10 dark:bg-[#ff9f0a]/15 flex items-center justify-center text-[#ff9f0a]">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-3">Stalled Deals</h3>
          <div className="flex items-baseline gap-1.5 mt-1 font-mono">
            <span className="text-[24px] font-bold text-[#9e5200] dark:text-[#ff9f0a]">5</span>
            <span className="text-[13.5px] text-[#86868b] font-normal font-sans">quotes idle 7+ days</span>
          </div>
          <p className="text-[13px] text-[#86868b] mt-2 leading-relaxed">
            Average deal stall latency: 8.4 days vs 2.1 day target SLA.
          </p>
        </div>

        {/* Card 2: Discount Anomalies */}
        <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 sm:p-7 backdrop-blur-xl relative overflow-hidden group hover:border-[#ff453a]/50 shadow-sm dark:shadow-apple-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-mono uppercase text-[#86868b] whitespace-nowrap">Margin Integrity</span>
            <div className="w-9 h-9 rounded-xl bg-[#ff453a]/10 dark:bg-[#ff453a]/15 flex items-center justify-center text-[#ff453a]">
              <TrendingDown className="w-4.5 h-4.5" />
            </div>
          </div>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-3">Discount Anomalies</h3>
          <div className="flex items-baseline gap-1.5 mt-1 font-mono">
            <span className="text-[24px] font-bold text-[#c9342c] dark:text-[#ff453a]">2</span>
            <span className="text-[13.5px] text-[#86868b] font-normal font-sans">above rep average</span>
          </div>
          <p className="text-[13px] text-[#86868b] mt-2 leading-relaxed">
            Proposals exceeding maximum peer group discount band by +14pt.
          </p>
        </div>

        {/* Card 3: Delivery Slippage */}
        <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 sm:p-7 backdrop-blur-xl relative overflow-hidden group hover:border-[#0071e3]/50 dark:hover:border-[#2997ff]/50 shadow-sm dark:shadow-apple-card transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-mono uppercase text-[#86868b] whitespace-nowrap">Fulfillment Risk</span>
            <div className="w-9 h-9 rounded-xl bg-[#0071e3]/10 dark:bg-[#2997ff]/10 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff]">
              <Truck className="w-4.5 h-4.5" />
            </div>
          </div>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-3">Delivery Slippage</h3>
          <div className="flex items-baseline gap-1.5 mt-1 font-mono">
            <span className="text-[24px] font-bold text-[#0071e3] dark:text-[#2997ff]">3</span>
            <span className="text-[13.5px] text-[#86868b] font-normal font-sans">promise dates at risk</span>
          </div>
          <p className="text-[13px] text-[#86868b] mt-2 leading-relaxed">
            Warehouse split buffer deficit may delay contractual arrival.
          </p>
        </div>
      </div>

      {/* Anomaly Records Table */}
      <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] overflow-hidden backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#ff9f0a]/10 dark:bg-[#ff9f0a]/15 flex items-center justify-center text-[#ff9f0a]">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Active Anomaly Flags & Automated Actions</h3>
          </div>
          <span className="text-[13px] text-[#86868b] font-mono whitespace-nowrap">Real-time telemetry stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Deal</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Account Rep</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Deal Value</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Detected Anomaly / Issue</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Flagged Date</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Current Status</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">{deal.deal}</div>
                    <div className="text-[13px] font-mono text-[#86868b] whitespace-nowrap">{deal.id}</div>
                  </td>
                  <td className="py-4 px-4 text-[#86868b] whitespace-nowrap">{deal.rep}</td>
                  <td className="py-4 px-4 font-mono font-medium text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">{deal.value}</td>
                  <td className="py-4 px-5">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          deal.issueType === 'discount'
                            ? 'bg-[#ff453a]'
                            : deal.issueType === 'stalled'
                            ? 'bg-[#ff9f0a]'
                            : 'bg-[#0071e3] dark:bg-[#2997ff]'
                        }`}
                      />
                      <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{deal.issue}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-[#86868b] whitespace-nowrap">{deal.flagged}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <Badge
                      variant={deal.actionStatus === 'done' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {deal.action}
                    </Badge>
                  </td>
                  <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => triggerAction(deal.id, 'Nudge Sent via Slack')}
                      className="h-8 px-3.5 rounded-full text-[13px] font-medium bg-[#0071e3]/10 dark:bg-[#2997ff]/15 hover:bg-[#0071e3]/20 dark:hover:bg-[#2997ff]/25 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/30 dark:border-[#2997ff]/30 transition-colors shadow-sm whitespace-nowrap"
                    >
                      Nudge
                    </button>
                    <button
                      onClick={() => triggerAction(deal.id, 'Escalated to VP')}
                      className="h-8 px-3.5 rounded-full text-[13px] font-medium bg-[#ff453a]/10 hover:bg-[#ff453a]/20 text-[#c9342c] dark:text-[#ff453a] border border-[#ff453a]/30 transition-colors shadow-sm whitespace-nowrap"
                    >
                      Escalate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DealHealthPage;
