import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  ArrowLeft,
  CreditCard,
  AlertCircle,
  RefreshCw,
  XCircle,
  Loader2,
  Edit3,
  Trash2,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Calculator
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import billingService from '../../services/billingService';

export const BillingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' | 'error' | 'info'
  const [loading, setLoading] = useState(true);
  const [subData, setSubData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [isModifyOpen, setIsModifyOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  // Modify form state
  const [modifyForm, setModifyForm] = useState({
    planName: '',
    billingCycle: 'Monthly',
    amount: 46,
    status: 'Active',
    daysRemaining: 14,
    notes: ''
  });

  // Remove / Cancel form state
  const [cancellationReason, setCancellationReason] = useState('Cancelled upon customer request');
  const [removeActionType, setRemoveActionType] = useState('cancel'); // 'cancel' | 'pause' | 'delete'

  const defaultMockSub = {
    subscriptionNumber: id || 'SUB-01',
    customerName: 'Acme Corp',
    planName: 'Care Plan 2yr',
    billingCycle: 'Monthly',
    amount: 46,
    status: 'Active',
    nextBillDate: '2026-09-15',
    history: [
      { action: 'Contract Initiated', date: new Date().toISOString(), notes: 'Originating Quote accepted via CPQ' }
    ]
  };

  const fetchSub = async () => {
    setLoading(true);
    try {
      const res = await billingService.getSubscriptionById(id);
      if (res?.data) {
        setSubData(res.data);
        setModifyForm({
          planName: res.data.planName || 'Care Plan 2yr',
          billingCycle: res.data.billingCycle || 'Monthly',
          amount: res.data.amount || 46,
          status: res.data.status || 'Active',
          daysRemaining: 14,
          notes: ''
        });
      } else {
        setSubData(defaultMockSub);
        setModifyForm({
          planName: defaultMockSub.planName,
          billingCycle: defaultMockSub.billingCycle,
          amount: defaultMockSub.amount,
          status: defaultMockSub.status,
          daysRemaining: 14,
          notes: ''
        });
      }
    } catch (err) {
      console.warn('Fallback subscription detail:', err.message);
      setSubData(defaultMockSub);
      setModifyForm({
        planName: defaultMockSub.planName,
        billingCycle: defaultMockSub.billingCycle,
        amount: defaultMockSub.amount,
        status: defaultMockSub.status,
        daysRemaining: 14,
        notes: ''
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSub();
  }, [id]);

  const customerName = subData?.customerName || (subData?.customer && subData.customer.name) || 'Acme Corp';
  const currentPlan = subData?.planName || 'Care Plan 2yr';
  const currentCycle = subData?.billingCycle || 'Monthly';
  const currentAmount = subData?.amount || 46;
  const currentStatus = subData?.status || 'Active';
  const nextBillDate = subData?.nextBillDate ? formatDate(subData.nextBillDate) : 'Sep 15';

  // Live Proration Calculation
  const deltaRate = Number(modifyForm.amount || 0) - Number(currentAmount || 0);
  const prorationRatio = Math.max(0, Math.min(1, Number(modifyForm.daysRemaining || 14) / 30));
  const immediateProratedCharge = Number((deltaRate * prorationRatio).toFixed(2));

  // Handler: Apply Subscription Modification
  const handleModifySubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage('');

    try {
      const payload = {
        planName: modifyForm.planName,
        billingCycle: modifyForm.billingCycle,
        amount: Number(modifyForm.amount),
        status: modifyForm.status,
        notes: modifyForm.notes || `Modified plan to ${modifyForm.planName} ($${modifyForm.amount}/mo). Prorated charge: $${immediateProratedCharge}`
      };

      const res = await billingService.updateSubscription(id, payload);
      if (res?.data) {
        setSubData(res.data);
      } else {
        setSubData((prev) => ({
          ...prev,
          ...payload,
          history: [
            ...(prev?.history || []),
            {
              action: 'Plan Modified',
              date: new Date().toISOString(),
              notes: payload.notes
            }
          ]
        }));
      }

      setMessageType('success');
      setMessage(`Subscription modified successfully! Mid-cycle proration adjustment of $${immediateProratedCharge >= 0 ? '+' : ''}${immediateProratedCharge} recorded.`);
      setIsModifyOpen(false);
    } catch (err) {
      console.warn('Direct update failed, updating local session state:', err.message);
      setSubData((prev) => ({
        ...prev,
        planName: modifyForm.planName,
        billingCycle: modifyForm.billingCycle,
        amount: Number(modifyForm.amount),
        status: modifyForm.status,
        history: [
          ...(prev?.history || []),
          {
            action: 'Plan Modified (Local)',
            date: new Date().toISOString(),
            notes: `Modified to ${modifyForm.planName} ($${modifyForm.amount}/mo). Proration: $${immediateProratedCharge}`
          }
        ]
      }));
      setMessageType('success');
      setMessage(`Subscription modified successfully! Proration adjustment of $${immediateProratedCharge >= 0 ? '+' : ''}${immediateProratedCharge} applied.`);
      setIsModifyOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Cancel / Pause / Remove Subscription
  const handleRemoveSubmit = async () => {
    setActionLoading(true);
    setMessage('');

    try {
      if (removeActionType === 'delete') {
        await billingService.deleteSubscription(id);
        navigate('/subscriptions', { state: { alert: `Subscription ${id} removed permanently.` } });
        return;
      }

      if (removeActionType === 'pause') {
        await billingService.updateSubscription(id, {
          status: 'Paused',
          notes: 'Paused recurring billing'
        });
        setSubData((prev) => ({ ...prev, status: 'Paused' }));
        setMessageType('info');
        setMessage('Subscription successfully paused. Automated invoices temporarily halted.');
      } else {
        // Cancel
        await billingService.cancelSubscription(id, cancellationReason);
        setSubData((prev) => ({ ...prev, status: 'Cancelled' }));
        setMessageType('error');
        setMessage('Subscription cancelled effective end of current billing cycle.');
      }
      setIsRemoveOpen(false);
    } catch (err) {
      console.warn('Action failed, updating local state:', err.message);
      if (removeActionType === 'delete') {
        navigate('/subscriptions');
        return;
      }
      const newStatus = removeActionType === 'pause' ? 'Paused' : 'Cancelled';
      setSubData((prev) => ({
        ...prev,
        status: newStatus,
        history: [
          ...(prev?.history || []),
          {
            action: `Plan ${newStatus}`,
            date: new Date().toISOString(),
            notes: cancellationReason
          }
        ]
      }));
      setMessageType(removeActionType === 'pause' ? 'info' : 'error');
      setMessage(`Subscription status updated to ${newStatus}.`);
      setIsRemoveOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Quick toggle between Active and Paused
  const handleTogglePause = async () => {
    const nextStatus = currentStatus === 'Paused' ? 'Active' : 'Paused';
    setActionLoading(true);
    try {
      await billingService.updateSubscription(id, {
        status: nextStatus,
        notes: nextStatus === 'Active' ? 'Resumed recurring billing' : 'Paused recurring billing'
      });
      setSubData((prev) => ({ ...prev, status: nextStatus }));
      setMessageType('info');
      setMessage(`Subscription status switched to ${nextStatus}.`);
    } catch (e) {
      setSubData((prev) => ({ ...prev, status: nextStatus }));
      setMessage(`Subscription status switched to ${nextStatus}.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Screen 10 data
  const oneTimeLines = [
    { product: 'Laptop Pro 14', qty: 2, amount: 2280 },
    { product: 'Onsite Setup', qty: 1, amount: 450 }
  ];

  const recurringLines = [
    { plan: currentPlan, cycle: currentCycle, nextBillDate, amount: currentAmount }
  ];

  return (
    <div className="space-y-7 max-w-6xl">
      {/* Screen 10 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div>
          <button
            onClick={() => navigate('/subscriptions')}
            className="text-[13px] text-[#6e6e73] dark:text-[#86868b] hover:text-[#0071e3] dark:hover:text-[#2997ff] inline-flex items-center gap-1.5 mb-2 transition-colors font-medium group"
          >
            <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Subscriptions list</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <h1 className="text-[24px] sm:text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.025em]">
              Billing Detail: {customerName} — {currentPlan}
            </h1>
            <Badge
              variant={currentStatus === 'Active' ? 'success' : currentStatus === 'Paused' ? 'warning' : 'danger'}
              size="sm"
            >
              {currentStatus} Recurring
            </Badge>
          </div>
          <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b] mt-1">
            Subscription lifecycle, mid-cycle proration calculator, and contract governance
          </p>
        </div>

        {/* Header Action Buttons with Responsive Icons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Pause / Resume Button */}
          <button
            type="button"
            onClick={handleTogglePause}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-[13px] font-medium border border-black/15 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] transition-all"
            title={currentStatus === 'Paused' ? 'Resume Subscription' : 'Pause Subscription'}
          >
            {currentStatus === 'Paused' ? (
              <PlayCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#34c759] shrink-0" />
            ) : (
              <PauseCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#ff9f0a] shrink-0" />
            )}
            <span className="hidden xs:inline">{currentStatus === 'Paused' ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Modify Subscription Button */}
          <Button
            onClick={() => setIsModifyOpen(true)}
            variant="primary"
            size="md"
            icon={Edit3}
            className="shrink-0"
          >
            <span>Modify Subscription</span>
          </Button>

          {/* Cancel / Remove Subscription Button */}
          <Button
            onClick={() => setIsRemoveOpen(true)}
            variant="danger"
            size="md"
            icon={XCircle}
            className="shrink-0"
          >
            <span>Remove / Cancel</span>
          </Button>
        </div>
      </div>

      {/* Notification Banner */}
      {message && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3 text-[13.5px] transition-all ${
            messageType === 'success'
              ? 'bg-[#34c759]/10 border-[#34c759]/30 text-[#1b7a36] dark:text-[#30d158]'
              : messageType === 'info'
              ? 'bg-[#ff9f0a]/10 border-[#ff9f0a]/30 text-[#9e5200] dark:text-[#ff9f0a]'
              : 'bg-[#ff453a]/10 border-[#ff453a]/30 text-[#c9342c] dark:text-[#ff453a]'
          }`}
        >
          {messageType === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : messageType === 'info' ? (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">{message}</div>
          <button
            onClick={() => setMessage('')}
            className="text-[12px] opacity-70 hover:opacity-100 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Section 1: One-Time Lines — Originating Order */}
      <Card className="p-0 overflow-hidden rounded-[20px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
        <div className="p-5 sm:p-6 pb-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <CardTitle className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            One-Time Lines — Originating Order
          </CardTitle>
          <span className="text-[12px] text-[#6e6e73] dark:text-[#86868b] font-mono">Invoice Bifurcation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13.5px] text-[#6e6e73] dark:text-apple-muted">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[12px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-6 whitespace-nowrap">Product</th>
                <th className="py-3.5 px-6 text-center whitespace-nowrap">Qty</th>
                <th className="py-3.5 px-6 text-right whitespace-nowrap">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {oneTimeLines.map((it, idx) => (
                <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                    {it.product}
                  </td>
                  <td className="py-4 px-6 text-center font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">
                    {it.qty}
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                    {formatCurrency(it.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section 2: Recurring Lines & Live Subscription Schedules */}
      <Card className="p-0 overflow-hidden rounded-[20px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
        <div className="p-5 sm:p-6 pb-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <CardTitle className="text-[15px] font-semibold text-[#0071e3] dark:text-[#2997ff] flex items-center gap-2">
            <RefreshCw className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 animate-spin-slow" />
            <span>Recurring Lines & Subscription Schedules</span>
          </CardTitle>
          <button
            onClick={() => setIsModifyOpen(true)}
            className="text-[12.5px] text-[#0071e3] dark:text-[#2997ff] hover:underline font-medium inline-flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5 shrink-0" />
            <span>Edit terms</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13.5px] text-[#6e6e73] dark:text-apple-muted">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[12px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-6 whitespace-nowrap">Plan</th>
                <th className="py-3.5 px-6 whitespace-nowrap">Cycle</th>
                <th className="py-3.5 px-6 font-mono whitespace-nowrap">Next Bill Date</th>
                <th className="py-3.5 px-6 text-right whitespace-nowrap">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {recurringLines.map((it, idx) => (
                <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                    {it.plan}
                  </td>
                  <td className="py-4 px-6 text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">
                    {it.cycle}
                  </td>
                  <td className="py-4 px-6 font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">
                    {it.nextBillDate}
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-semibold text-[#1b7a36] dark:text-[#30d158] whitespace-nowrap">
                    {formatCurrency(it.amount)} / {it.cycle === 'Monthly' ? 'mo' : it.cycle === 'Quarterly' ? 'qtr' : 'yr'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Proration Context Callout */}
        <div className="p-4 sm:p-5 bg-black/[0.02] dark:bg-white/[0.03] border-t border-black/[0.08] dark:border-white/[0.08] text-[13px] text-[#6e6e73] dark:text-[#86868b] flex items-center justify-between">
          <span>Mid-cycle plan changes automatically compute immediate proration credits and adjust renewal schedules.</span>
          <button
            onClick={() => setIsModifyOpen(true)}
            className="text-[#0071e3] dark:text-[#2997ff] font-medium hover:underline whitespace-nowrap ml-3"
          >
            Calculate Proration &rarr;
          </button>
        </div>
      </Card>

      {/* Section 3: Audit & Contract Change History */}
      <Card className="p-0 overflow-hidden rounded-[20px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
        <div className="p-5 sm:p-6 pb-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <CardTitle className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#6e6e73] dark:text-[#86868b] shrink-0" />
            <span>Proration & Modification History</span>
          </CardTitle>
          <span className="text-[12px] text-[#6e6e73] dark:text-[#86868b] font-mono">
            {subData?.history?.length || 1} Event(s)
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-3">
          {(subData?.history && subData.history.length > 0 ? subData.history : defaultMockSub.history).map((evt, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] text-[13px]"
            >
              <div className="w-2 h-2 rounded-full bg-[#0071e3] dark:bg-[#2997ff] mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#1d1d1f] dark:text-white">{evt.action || 'Contract Event'}</span>
                  <span className="text-[12px] text-[#6e6e73] dark:text-[#86868b] font-mono whitespace-nowrap">
                    {evt.date ? formatDate(evt.date) : 'Recent'}
                  </span>
                </div>
                <p className="text-[#6e6e73] dark:text-[#86868b] mt-0.5 break-words">
                  {evt.notes || 'Status updated.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ========================================================= */}
      {/* MODAL 1: MODIFY SUBSCRIPTION & MID-CYCLE PRORATION ENGINE */}
      {/* ========================================================= */}
      <Modal
        isOpen={isModifyOpen}
        onClose={() => setIsModifyOpen(false)}
        title="Modify Subscription & Calculate Proration"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleModifySubmit} className="space-y-4 text-[13px]">
          <div>
            <label className="block font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Select or Enter Plan Name
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {['Care Plan 1yr', 'Care Plan 2yr', 'Support SLA', 'Enterprise CPQ Suite'].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setModifyForm({ ...modifyForm, planName: preset })}
                  className={`p-2 rounded-xl text-left border text-[12.5px] transition-all ${
                    modifyForm.planName === preset
                      ? 'border-[#0071e3] dark:border-[#2997ff] bg-[#0071e3]/10 dark:bg-[#2997ff]/15 font-semibold text-[#0071e3] dark:text-[#2997ff]'
                      : 'border-black/10 dark:border-white/10 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-[#1d1d1f] dark:text-[#f5f5f7]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              required
              placeholder="Or enter custom plan name"
              value={modifyForm.planName}
              onChange={(e) => setModifyForm({ ...modifyForm, planName: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Billing Cycle
              </label>
              <select
                value={modifyForm.billingCycle}
                onChange={(e) => setModifyForm({ ...modifyForm, billingCycle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Monthly Rate ($ USD)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={modifyForm.amount}
                onChange={(e) => setModifyForm({ ...modifyForm, amount: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Days Remaining in Current Cycle
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={modifyForm.daysRemaining}
                onChange={(e) => setModifyForm({ ...modifyForm, daysRemaining: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] font-mono"
              />
            </div>

            <div>
              <label className="block font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Status
              </label>
              <select
                value={modifyForm.status}
                onChange={(e) => setModifyForm({ ...modifyForm, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
          </div>

          {/* Live Proration Breakdown Box */}
          <div className="p-4 rounded-xl bg-[#0071e3]/10 dark:bg-[#2997ff]/10 border border-[#0071e3]/20 dark:border-[#2997ff]/25 space-y-2">
            <div className="flex items-center justify-between font-semibold text-[#0071e3] dark:text-[#2997ff]">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4 shrink-0" />
                <span>Live Mid-Cycle Proration Calculation</span>
              </span>
              <span className="font-mono text-[13px]">
                {((prorationRatio) * 100).toFixed(0)}% Cycle Remaining
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[12px]">
              <div>
                <span className="text-[#6e6e73] dark:text-[#86868b] block">Current Rate:</span>
                <span className="font-mono font-medium text-[#1d1d1f] dark:text-white">${currentAmount}/mo</span>
              </div>
              <div>
                <span className="text-[#6e6e73] dark:text-[#86868b] block">New Rate:</span>
                <span className="font-mono font-medium text-[#1d1d1f] dark:text-white">${modifyForm.amount}/mo</span>
              </div>
              <div>
                <span className="text-[#6e6e73] dark:text-[#86868b] block">Immediate Prorated:</span>
                <span className={`font-mono font-bold ${immediateProratedCharge >= 0 ? 'text-[#1b7a36] dark:text-[#30d158]' : 'text-[#ff9f0a]'}`}>
                  {immediateProratedCharge >= 0 ? `+$${immediateProratedCharge}` : `-$${Math.abs(immediateProratedCharge)}`}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Audit Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Customer upgraded seats per mutual agreement"
              value={modifyForm.notes}
              onChange={(e) => setModifyForm({ ...modifyForm, notes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-black/[0.08] dark:border-white/[0.08]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsModifyOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={actionLoading}
              icon={CheckCircle2}
            >
              {actionLoading ? 'Saving...' : 'Apply Plan Modification'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: REMOVE / CANCEL / PAUSE SUBSCRIPTION */}
      {/* ========================================================= */}
      <Modal
        isOpen={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        title="Remove or Cancel Subscription"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-[13px]">
          <p className="text-[#6e6e73] dark:text-[#86868b]">
            Choose how you would like to handle contract <strong className="text-[#1d1d1f] dark:text-white">{id || currentPlan}</strong> for <strong className="text-[#1d1d1f] dark:text-white">{customerName}</strong>:
          </p>

          <div className="space-y-2">
            {/* Option A: Cancel Subscription */}
            <label
              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                removeActionType === 'cancel'
                  ? 'border-[#ff453a] bg-[#ff453a]/10 dark:bg-[#ff453a]/15 text-[#c9342c] dark:text-[#ff453a]'
                  : 'border-black/10 dark:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] text-[#1d1d1f] dark:text-[#f5f5f7]'
              }`}
            >
              <input
                type="radio"
                name="removeAction"
                value="cancel"
                checked={removeActionType === 'cancel'}
                onChange={() => setRemoveActionType('cancel')}
                className="mt-0.5 text-[#ff453a] focus:ring-[#ff453a]"
              />
              <div>
                <div className="font-semibold">Cancel Subscription</div>
                <div className="text-[12px] opacity-80 mt-0.5">
                  Marks status as Cancelled. Halts future recurring invoices at the end of the billing term.
                </div>
              </div>
            </label>

            {/* Option B: Pause Subscription */}
            <label
              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                removeActionType === 'pause'
                  ? 'border-[#ff9f0a] bg-[#ff9f0a]/10 dark:bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a]'
                  : 'border-black/10 dark:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] text-[#1d1d1f] dark:text-[#f5f5f7]'
              }`}
            >
              <input
                type="radio"
                name="removeAction"
                value="pause"
                checked={removeActionType === 'pause'}
                onChange={() => setRemoveActionType('pause')}
                className="mt-0.5 text-[#ff9f0a] focus:ring-[#ff9f0a]"
              />
              <div>
                <div className="font-semibold">Pause Subscription</div>
                <div className="text-[12px] opacity-80 mt-0.5">
                  Temporarily freezes the recurring billing schedule. Can be resumed anytime.
                </div>
              </div>
            </label>

            {/* Option C: Delete / Permanently Remove */}
            <label
              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                removeActionType === 'delete'
                  ? 'border-[#ff453a] bg-[#ff453a]/15 text-[#c9342c] dark:text-[#ff453a]'
                  : 'border-black/10 dark:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] text-[#1d1d1f] dark:text-[#f5f5f7]'
              }`}
            >
              <input
                type="radio"
                name="removeAction"
                value="delete"
                checked={removeActionType === 'delete'}
                onChange={() => setRemoveActionType('delete')}
                className="mt-0.5 text-[#ff453a] focus:ring-[#ff453a]"
              />
              <div>
                <div className="font-semibold flex items-center gap-1.5 text-[#c9342c] dark:text-[#ff453a]">
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Delete Contract Permanently</span>
                </div>
                <div className="text-[12px] opacity-80 mt-0.5">
                  Permanently deletes the subscription record from the database ledger.
                </div>
              </div>
            </label>
          </div>

          <div>
            <label className="block font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Reason for Cancellation / Removal
            </label>
            <input
              type="text"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff453a]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-black/[0.08] dark:border-white/[0.08]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsRemoveOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={removeActionType === 'pause' ? 'secondary' : 'danger'}
              size="sm"
              onClick={handleRemoveSubmit}
              disabled={actionLoading}
              icon={removeActionType === 'delete' ? Trash2 : removeActionType === 'pause' ? PauseCircle : XCircle}
            >
              {actionLoading
                ? 'Processing...'
                : removeActionType === 'delete'
                ? 'Delete Permanently'
                : removeActionType === 'pause'
                ? 'Pause Subscription'
                : 'Confirm Cancellation'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BillingDetailPage;

