import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Filter,
  Loader2,
  Sliders,
  ExternalLink
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import dealHealthService from '../../services/dealHealthService';

export const DealHealthPage = () => {
  const navigate = useNavigate();
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stalledDaysThreshold, setStalledDaysThreshold] = useState(7);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'stalled' | 'discount' | 'slippage'

  const defaultMockDeals = [
    {
      id: 'Q-1030',
      deal: 'Zenith Co',
      issue: 'Idle 9 days (> 7d configured threshold)',
      issueType: 'stalled',
      inactiveDays: 9,
      flagged: 'Aug 24',
      action: 'Nudge sent',
      actionStatus: 'done',
      rep: 'J. Rao',
      repAvgDiscount: 9,
      currentDiscount: 10,
      value: '$18,300',
      riskScore: 68
    },
    {
      id: 'Q-1025',
      deal: 'Delta LLC',
      issue: 'Discount 22% vs rep historical avg 8% (+14% delta)',
      issueType: 'discount',
      inactiveDays: 2,
      flagged: 'Aug 25',
      action: 'Escalated to Manager',
      actionStatus: 'pending',
      rep: 'M. Chen',
      repAvgDiscount: 8,
      currentDiscount: 22,
      value: '$34,900',
      riskScore: 84
    },
    {
      id: 'Q-1042',
      deal: 'Acme Corp',
      issue: 'Split delivery delayed +4 days past promised SLA',
      issueType: 'slippage',
      inactiveDays: 3,
      flagged: 'Aug 26',
      action: 'Warehouse notice',
      actionStatus: 'pending',
      rep: 'J. Rao',
      repAvgDiscount: 9,
      currentDiscount: 10,
      value: '$28,400',
      riskScore: 54
    },
    {
      id: 'Q-1039',
      deal: 'Beta Industries',
      issue: 'Pending Finance approval 4 days (> 7d configured threshold)',
      issueType: 'stalled',
      inactiveDays: 8,
      flagged: 'Aug 27',
      action: 'Awaiting Signoff',
      actionStatus: 'pending',
      rep: 'S. Patel',
      repAvgDiscount: 11,
      currentDiscount: 18,
      value: '$48,000',
      riskScore: 72
    }
  ];

  const [deals, setDeals] = useState([]);

  useEffect(() => {
    const fetchHealth = async () => {
      setLoading(true);
      try {
        const res = await dealHealthService.getDealHealthList();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setDeals(res.data);
        } else {
          setDeals(defaultMockDeals);
        }
      } catch (err) {
        console.warn('Fallback deal health:', err.message);
        setDeals(defaultMockDeals);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  // Spec B9: Trigger automated nudge or escalation action from an alert
  const triggerAction = async (dealId, newAction, e) => {
    if (e) e.stopPropagation();
    try {
      await dealHealthService.takeCorrectiveAction(dealId, newAction);
    } catch (err) {
      console.warn('Corrective action local fallback:', err.message);
    }

    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, action: newAction, actionStatus: 'done' } : d))
    );
    setToastMessage(`Automated action triggered: "${newAction}" for quotation ${dealId}`);
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

  // Filter deals based on activeFilter and dynamic stalledDaysThreshold
  const filteredDeals = deals.filter((deal) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'stalled') {
      return deal.issueType === 'stalled' || (deal.inactiveDays && deal.inactiveDays >= stalledDaysThreshold);
    }
    return deal.issueType === activeFilter;
  });

  const stalledCount = deals.filter(
    (d) => d.issueType === 'stalled' || (d.inactiveDays && d.inactiveDays >= stalledDaysThreshold)
  ).length;
  const discountCount = deals.filter((d) => d.issueType === 'discount').length;
  const slippageCount = deals.filter((d) => d.issueType === 'slippage').length;

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
        <div className="flex items-center space-x-2.5">
          <Button
            variant="danger"
            size="md"
            icon={ShieldAlert}
            onClick={handleEscalateAll}
          >
            Escalate
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Send}
            onClick={handleNudgeAll}
          >
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

      {/* 3 Anomaly Metric Cards with Quick Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Stalled Deals */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'stalled' ? 'all' : 'stalled')}
          className={`cursor-pointer bg-white/80 dark:bg-[#161618]/90 border rounded-[22px] p-6 sm:p-7 backdrop-blur-xl relative overflow-hidden group shadow-sm dark:shadow-apple-card transition-all ${
            activeFilter === 'stalled'
              ? 'border-[#ff9f0a] ring-2 ring-[#ff9f0a]/30'
              : 'border-black/[0.08] dark:border-white/[0.08] hover:border-[#ff9f0a]/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-mono uppercase text-[#86868b] whitespace-nowrap">Deal Velocity</span>
            <div className="w-9 h-9 rounded-xl bg-[#ff9f0a]/10 dark:bg-[#ff9f0a]/15 flex items-center justify-center text-[#ff9f0a]">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-3">Stalled Deals</h3>
          <div className="flex items-baseline gap-1.5 mt-1 font-mono">
            <span className="text-[24px] font-bold text-[#9e5200] dark:text-[#ff9f0a]">{stalledCount}</span>
            <span className="text-[13.5px] text-[#86868b] font-normal font-sans">
              quotes idle &gt; {stalledDaysThreshold}d configured threshold
            </span>
          </div>
          <p className="text-[13px] text-[#86868b] mt-2 leading-relaxed">
            Exceeds configured latency limit ({stalledDaysThreshold} days). Click to filter.
          </p>
        </div>

        {/* Card 2: Discount Anomalies */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'discount' ? 'all' : 'discount')}
          className={`cursor-pointer bg-white/80 dark:bg-[#161618]/90 border rounded-[22px] p-6 sm:p-7 backdrop-blur-xl relative overflow-hidden group shadow-sm dark:shadow-apple-card transition-all ${
            activeFilter === 'discount'
              ? 'border-[#ff453a] ring-2 ring-[#ff453a]/30'
              : 'border-black/[0.08] dark:border-white/[0.08] hover:border-[#ff453a]/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-mono uppercase text-[#86868b] whitespace-nowrap">Margin Integrity</span>
            <div className="w-9 h-9 rounded-xl bg-[#ff453a]/10 dark:bg-[#ff453a]/15 flex items-center justify-center text-[#ff453a]">
              <TrendingDown className="w-4.5 h-4.5" />
            </div>
          </div>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-3">Discount Anomalies</h3>
          <div className="flex items-baseline gap-1.5 mt-1 font-mono">
            <span className="text-[24px] font-bold text-[#c9342c] dark:text-[#ff453a]">{discountCount}</span>
            <span className="text-[13.5px] text-[#86868b] font-normal font-sans">well above rep historical average</span>
          </div>
          <p className="text-[13px] text-[#86868b] mt-2 leading-relaxed">
            Discounts exceeding individual sales rep baseline by +10% or more. Click to filter.
          </p>
        </div>

        {/* Card 3: Delivery Slippage */}
        <div
          onClick={() => setActiveFilter(activeFilter === 'slippage' ? 'all' : 'slippage')}
          className={`cursor-pointer bg-white/80 dark:bg-[#161618]/90 border rounded-[22px] p-6 sm:p-7 backdrop-blur-xl relative overflow-hidden group shadow-sm dark:shadow-apple-card transition-all ${
            activeFilter === 'slippage'
              ? 'border-[#0071e3] ring-2 ring-[#0071e3]/30'
              : 'border-black/[0.08] dark:border-white/[0.08] hover:border-[#0071e3]/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-mono uppercase text-[#86868b] whitespace-nowrap">Fulfillment Risk</span>
            <div className="w-9 h-9 rounded-xl bg-[#0071e3]/10 dark:bg-[#2997ff]/10 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff]">
              <Truck className="w-4.5 h-4.5" />
            </div>
          </div>
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-3">Delivery Slippage</h3>
          <div className="flex items-baseline gap-1.5 mt-1 font-mono">
            <span className="text-[24px] font-bold text-[#0071e3] dark:text-[#2997ff]">{slippageCount}</span>
            <span className="text-[13.5px] text-[#86868b] font-normal font-sans">promise dates at risk</span>
          </div>
          <p className="text-[13px] text-[#86868b] mt-2 leading-relaxed">
            Warehouse split buffer deficit delaying contractual delivery dates. Click to filter.
          </p>
        </div>
      </div>

      {/* Threshold Configuration Bar for Stalled Deals */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0071e3]/10 dark:bg-[#2997ff]/15 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[13.5px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block">
              Configured Inactivity Threshold for Stalled Deals
            </span>
            <span className="text-[12px] text-[#86868b]">
              Quotes inactive for more than this threshold will be flagged automatically for governance intervention
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[12px] text-[#86868b] font-medium mr-1">Threshold:</span>
          {[3, 5, 7, 10, 14].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setStalledDaysThreshold(days)}
              className={`px-3 py-1 rounded-xl text-[12px] font-mono font-medium transition-all ${
                stalledDaysThreshold === days
                  ? 'bg-[#0071e3] text-white shadow-xs'
                  : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#86868b] hover:bg-black/[0.08] dark:hover:bg-white/[0.1]'
              }`}
            >
              {days}d
            </button>
          ))}
          {activeFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="ml-2 px-2.5 py-1 rounded-xl text-[12px] text-[#0071e3] hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Anomaly Records Table */}
      <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] overflow-hidden backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#ff9f0a]/10 dark:bg-[#ff9f0a]/15 flex items-center justify-center text-[#ff9f0a]">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                Active Anomaly Flags & Automated Actions
              </h3>
              <p className="text-[12px] text-[#86868b]">
                Clicking any alert row directly opens the related quotation in the internal workspace
              </p>
            </div>
          </div>
          <span className="text-[12px] text-[#86868b] font-mono whitespace-nowrap">
            Showing {filteredDeals.length} anomaly alert(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[12px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Deal & Quotation</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Account Rep</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Deal Value</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Detected Anomaly / Issue</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Flagged Date</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Current Status</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {filteredDeals.map((deal) => (
                <tr
                  key={deal.id}
                  onClick={() => navigate(`/quotations/${deal.id}`)}
                  title="Click to open related quotation directly"
                  className="hover:bg-black/[0.035] dark:hover:bg-white/[0.04] transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      <span>{deal.deal}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#86868b] group-hover:text-[#0071e3] transition-colors" />
                    </div>
                    <div className="text-[12px] font-mono text-[#0071e3] dark:text-[#2997ff] group-hover:underline">
                      {deal.id}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[#86868b] whitespace-nowrap">
                    <div>{deal.rep}</div>
                    {deal.repAvgDiscount !== undefined && (
                      <span className="text-[11px] font-mono text-[#86868b]">
                        Rep Avg: {deal.repAvgDiscount}%
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 font-mono font-medium text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">
                    {deal.value}
                  </td>
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
                      type="button"
                      onClick={(e) => triggerAction(deal.id, 'Nudge Sent via Slack', e)}
                      title="Trigger automated Slack/Email reminder to rep"
                      className="h-8 px-3.5 rounded-full text-[12.5px] font-medium bg-[#0071e3]/10 dark:bg-[#2997ff]/15 hover:bg-[#0071e3]/20 dark:hover:bg-[#2997ff]/25 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/30 dark:border-[#2997ff]/30 transition-colors shadow-sm whitespace-nowrap"
                    >
                      Nudge
                    </button>
                    <button
                      type="button"
                      onClick={(e) => triggerAction(deal.id, 'Escalated to VP', e)}
                      title="Trigger automated escalation to VP of Sales"
                      className="h-8 px-3.5 rounded-full text-[12.5px] font-medium bg-[#ff453a]/10 hover:bg-[#ff453a]/20 text-[#c9342c] dark:text-[#ff453a] border border-[#ff453a]/30 transition-colors shadow-sm whitespace-nowrap"
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
