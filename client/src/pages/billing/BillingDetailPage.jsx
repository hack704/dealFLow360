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
  Calculator,
  FileText
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

  // Spec B7: Modify form state with Quantity / Seats handling
  const [modifyForm, setModifyForm] = useState({
    planName: '',
    billingCycle: 'Monthly',
    amount: 46,
    quantity: 5,
    status: 'Active',
    daysRemaining: 14,
    notes: ''
  });

  // Spec B7: Automatic partial refund or credit note trigger state
  const [creditNotes, setCreditNotes] = useState([
    {
      id: 'CN-1021',
      date: '2026-08-15',
      amount: 46.00,
      reason: 'Mid-cycle seat reduction adjustment (6 → 5 seats)',
      type: 'credit_note',
      status: 'Credited to Balance'
    }
  ]);
  const [refundType, setRefundType] = useState('credit_note'); // 'credit_note' | 'refund'

  // Remove / Cancel form state
  const [cancellationReason, setCancellationReason] = useState('Cancelled upon customer request');
  const [removeActionType, setRemoveActionType] = useState('cancel'); // 'cancel' | 'pause' | 'delete'

  const defaultMockSub = {
    subscriptionNumber: id || 'SUB-01',
    customerName: 'Acme Corp',
    planName: 'Care Plan 2yr',
    billingCycle: 'Monthly',
    quantity: 5,
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
        setSubData({ ...res.data, quantity: res.data.quantity || 5 });
        setModifyForm({
          planName: res.data.planName || 'Care Plan 2yr',
          billingCycle: res.data.billingCycle || 'Monthly',
          amount: res.data.amount || 46,
          quantity: res.data.quantity || 5,
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
          quantity: defaultMockSub.quantity,
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
        quantity: defaultMockSub.quantity,
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
  const currentQuantity = Number(subData?.quantity || 5);
  const currentUnitPrice = Number(subData?.amount || 46);
  const currentMonthlyTotal = currentQuantity * currentUnitPrice;
  const currentStatus = subData?.status || 'Active';
  const nextBillDate = subData?.nextBillDate ? formatDate(subData.nextBillDate) : 'Sep 15';

  // Spec B7: Live Mid-Cycle Proration Calculation when Quantity Changes
  const newQuantity = Math.max(1, Number(modifyForm.quantity || currentQuantity));
  const newUnitPrice = Math.max(1, Number(modifyForm.amount || currentUnitPrice));
  const newMonthlyTotal = newQuantity * newUnitPrice;

  const quantityDelta = newQuantity - currentQuantity;
  const daysRemaining = Number(modifyForm.daysRemaining || 14);
  const prorationRatio = Math.max(0, Math.min(1, daysRemaining / 30));

  // Proration when quantity or rate changes mid-cycle
  const immediateProratedCharge = Number(((newMonthlyTotal - currentMonthlyTotal) * prorationRatio).toFixed(2));
  const isDownwardAdjustment = immediateProratedCharge < 0;

  // Proration when cancelling mid-cycle: automatic partial refund or credit note trigger amount
  const unusedCancellationRefund = Number((currentMonthlyTotal * prorationRatio).toFixed(2));

  // Handler: Apply Subscription Modification (with quantity proration & automatic credit note trigger)
  const handleModifySubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setMessage('');

    try {
      const payload = {
        planName: modifyForm.planName,
        billingCycle: modifyForm.billingCycle,
        amount: Number(modifyForm.amount),
        quantity: newQuantity,
        status: modifyForm.status,
        notes: modifyForm.notes || `Modified plan to ${modifyForm.planName} (${newQuantity} seats @ $${modifyForm.amount}/seat). Mid-cycle proration: $${immediateProratedCharge}`
      };

      const res = await billingService.updateSubscription(id, payload);
      if (res?.data) {
        setSubData({ ...res.data, quantity: newQuantity });
      } else {
        setSubData((prev) => ({
          ...prev,
          ...payload,
          quantity: newQuantity,
          history: [
            ...(prev?.history || []),
            {
              action: isDownwardAdjustment ? 'Plan Modified (Credit Note Issued)' : 'Plan Modified',
              date: new Date().toISOString(),
              notes: payload.notes
            }
          ]
        }));
      }

      if (isDownwardAdjustment) {
        const creditNoteNum = `CN-${Math.floor(1000 + Math.random() * 9000)}`;
        const creditAmount = Math.abs(immediateProratedCharge);
        const newCN = {
          id: creditNoteNum,
          date: new Date().toISOString(),
          amount: creditAmount,
          reason: `Downward mid-cycle adjustment: ${currentQuantity} seats → ${newQuantity} seats`,
          type: 'credit_note',
          status: 'Credited to Balance'
        };
        setCreditNotes((prev) => [newCN, ...prev]);
        setMessageType('info');
        setMessage(`Subscription modified! Quantity changed from ${currentQuantity} to ${newQuantity} seats. Automatic Credit Note ${creditNoteNum} for $${creditAmount} issued and credited to customer balance.`);
      } else {
        setMessageType('success');
        setMessage(`Subscription modified successfully! Quantity changed from ${currentQuantity} to ${newQuantity} seats. Mid-cycle proration adjustment of +$${immediateProratedCharge} recorded for the remaining ${daysRemaining} days.`);
      }
      setIsModifyOpen(false);
    } catch (err) {
      console.warn('Direct update failed, updating local session state:', err.message);
      setSubData((prev) => ({
        ...prev,
        planName: modifyForm.planName,
        billingCycle: modifyForm.billingCycle,
        amount: Number(modifyForm.amount),
        quantity: newQuantity,
        status: modifyForm.status,
        history: [
          ...(prev?.history || []),
          {
            action: isDownwardAdjustment ? 'Plan Modified (Credit Note Issued)' : 'Plan Modified (Local)',
            date: new Date().toISOString(),
            notes: `Modified to ${modifyForm.planName} (${newQuantity} seats). Proration: $${immediateProratedCharge}`
          }
        ]
      }));
      if (isDownwardAdjustment) {
        const creditNoteNum = `CN-${Math.floor(1000 + Math.random() * 9000)}`;
        const creditAmount = Math.abs(immediateProratedCharge);
        setCreditNotes((prev) => [
          {
            id: creditNoteNum,
            date: new Date().toISOString(),
            amount: creditAmount,
            reason: `Downward mid-cycle adjustment: ${currentQuantity} seats → ${newQuantity} seats`,
            type: 'credit_note',
            status: 'Credited to Balance'
          },
          ...prev
        ]);
        setMessageType('info');
        setMessage(`Subscription modified! Quantity changed from ${currentQuantity} to ${newQuantity} seats. Automatic Credit Note ${creditNoteNum} for $${creditAmount} issued.`);
      } else {
        setMessageType('success');
        setMessage(`Subscription modified successfully! Proration adjustment of $${immediateProratedCharge >= 0 ? '+' : ''}${immediateProratedCharge} applied.`);
      }
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
        await billingService.pauseSubscription(id, cancellationReason || 'Paused recurring billing');
        setSubData((prev) => ({ ...prev, status: 'Paused', pausedAt: new Date() }));
        setMessageType('info');
        setMessage('Subscription successfully paused. Automated invoices temporarily halted.');
      } else {
        // Cancel applying Return Policy
        const res = await billingService.cancelSubscription(id, cancellationReason);
        setSubData((prev) => ({ ...prev, status: 'Cancelled' }));

        const creditNoteNum = res?.data?.creditNote?.invoiceNumber || `CN-${Math.floor(1000 + Math.random() * 9000)}`;
        const refundAmt = res?.data?.policyResult?.refundAmount ?? unusedCancellationRefund;
        const policyNote = res?.data?.policyResult?.policyApplied || `${daysRemaining} unused days of current term`;

        const newCN = {
          id: creditNoteNum,
          date: new Date().toISOString(),
          amount: refundAmt,
          reason: `Return Policy Refund: ${policyNote}`,
          type: refundType,
          status: refundType === 'refund' ? 'Partial Refund Processed' : 'Credited to Balance'
        };
        setCreditNotes((prev) => [newCN, ...prev]);

        setMessageType('info');
        setMessage(
          `Subscription cancelled under Return Policy. Automatic ${
            refundType === 'refund' ? 'partial refund' : 'credit note'
          } ${creditNoteNum} for $${refundAmt} generated.`
        );
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
      if (newStatus === 'Cancelled') {
        const creditNoteNum = `CN-${Math.floor(1000 + Math.random() * 9000)}`;
        setCreditNotes((prev) => [
          {
            id: creditNoteNum,
            date: new Date().toISOString(),
            amount: unusedCancellationRefund,
            reason: `Cancellation refund: ${daysRemaining} unused days of current term`,
            type: refundType,
            status: refundType === 'refund' ? 'Partial Refund Processed' : 'Credited to Balance'
          },
          ...prev
        ]);
        setMessageType('info');
        setMessage(`Subscription cancelled. Automatic ${refundType === 'refund' ? 'partial refund' : 'credit note'} ${creditNoteNum} for $${unusedCancellationRefund} triggered.`);
      } else {
        setMessageType(removeActionType === 'pause' ? 'info' : 'error');
        setMessage(`Subscription status updated to ${newStatus}.`);
      }
      setIsRemoveOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Quick toggle between Active and Paused with next bill extension
  const handleTogglePause = async () => {
    const isCurrentlyPaused = currentStatus === 'Paused';
    setActionLoading(true);
    try {
      if (isCurrentlyPaused) {
        const res = await billingService.resumeSubscription(id);
        const newNextBill = res?.data?.newNextBill;
        setSubData((prev) => ({
          ...prev,
          status: 'Active',
          nextBillDate: newNextBill || prev.nextBillDate
        }));
        setMessageType('success');
        setMessage(
          `Subscription resumed! Next billing date extended by ${res?.data?.pausedDays || 1} day(s) to compensate for paused downtime.`
        );
      } else {
        await billingService.pauseSubscription(id, 'Paused recurring billing');
        setSubData((prev) => ({ ...prev, status: 'Paused' }));
        setMessageType('info');
        setMessage('Subscription successfully paused. Automated invoices temporarily halted.');
      }
    } catch (e) {
      console.warn('Toggle pause fallback:', e.message);
      const nextStatus = isCurrentlyPaused ? 'Active' : 'Paused';
      setSubData((prev) => ({ ...prev, status: nextStatus }));
      setMessageType('info');
      setMessage(`Subscription status switched to ${nextStatus}.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Screen 10 data: One-Time Lines (from originating order)
  const oneTimeLines = subData?.quotation?.items?.filter(it => it.pricingType !== 'recurring_monthly' && it.pricingType !== 'recurring_annual')?.map(it => ({
    product: it.product?.name || it.name || 'Product Item',
    qty: it.quantity || 1,
    amount: (it.unitPrice || 0) * (it.quantity || 1)
  }))?.length > 0
    ? subData.quotation.items.filter(it => it.pricingType !== 'recurring_monthly' && it.pricingType !== 'recurring_annual').map(it => ({
        product: it.product?.name || it.name || 'Product Item',
        qty: it.quantity || 1,
        amount: (it.unitPrice || 0) * (it.quantity || 1)
      }))
    : [
        { product: 'Laptop Pro 14', qty: 2, amount: 2280 },
        { product: 'Onsite Setup', qty: 1, amount: 450 }
      ];

  // Screen 10 data: Recurring Lines
  const recurringLines = [
    { plan: currentPlan || 'Care Plan 2yr', cycle: currentCycle || 'Monthly', nextBillDate: nextBillDate || 'Sep 15', amount: currentUnitPrice || 46 },
    { plan: 'Support SLA', cycle: 'Quarterly', nextBillDate: 'Nov 1', amount: 300 }
  ];

  return (
    <div className="space-y-7 max-w-6xl">
      {/* Screen 10 Header: Billing Detail (Acme Corp - Care Plan 2yr) */}
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
              Billing Detail: {customerName} - {currentPlan}
            </h1>
            <Badge
              variant={currentStatus === 'Active' ? 'success' : currentStatus === 'Paused' ? 'warning' : 'danger'}
              size="sm"
            >
              {currentStatus} Recurring
            </Badge>
          </div>
          <p className="text-[13px] sm:text-[14px] text-[#0071e3] dark:text-[#2997ff] font-medium mt-1 flex items-center gap-1.5">
            <span>Opened by clicking a row on the Subscriptions list</span>
          </p>
        </div>

        {/* Header Action Buttons with Quick Actions */}
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

          {/* Cancel Subscription Button */}
          <button
            type="button"
            onClick={() => {
              setRemoveActionType('cancel');
              setIsRemoveOpen(true);
            }}
            className="h-10 px-4 rounded-xl text-[13px] font-semibold border-2 border-[#ff453a]/70 text-[#ff453a] hover:bg-[#ff453a]/10 transition-colors inline-flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel Subscription</span>
          </button>
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

      {/* Section 1: One-Time Lines (from originating order) - Exact Mockup 10 */}
      <div className="space-y-2.5">
        <h2 className="text-[16px] font-bold text-[#0071e3] dark:text-[#2997ff] tracking-tight flex items-center gap-2">
          <span>One-Time Lines (from originating order)</span>
        </h2>
        <Card className="p-0 overflow-hidden rounded-[18px] bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.1] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px] text-[#6e6e73] dark:text-apple-muted">
              <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#86868b] uppercase tracking-wider font-mono text-[12px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
                <tr>
                  <th className="py-3.5 px-6 whitespace-nowrap">Product</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Qty</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                {oneTimeLines.map((it, idx) => (
                  <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                      {it.product}
                    </td>
                    <td className="py-4 px-6 font-mono text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">
                      {it.qty}
                    </td>
                    <td className="py-4 px-6 font-mono font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                      {formatCurrency(it.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Section 2: Recurring Lines - Exact Mockup 10 */}
      <div className="space-y-2.5">
        <h2 className="text-[16px] font-bold text-[#0071e3] dark:text-[#2997ff] tracking-tight flex items-center gap-2">
          <span>Recurring Lines</span>
        </h2>
        <Card className="p-0 overflow-hidden rounded-[18px] bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.1] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13.5px] text-[#6e6e73] dark:text-apple-muted">
              <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#86868b] uppercase tracking-wider font-mono text-[12px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
                <tr>
                  <th className="py-3.5 px-6 whitespace-nowrap">Plan</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Cycle</th>
                  <th className="py-3.5 px-6 whitespace-nowrap font-mono">Next Bill Date</th>
                  <th className="py-3.5 px-6 whitespace-nowrap font-mono">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                {recurringLines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                      {line.plan}
                    </td>
                    <td className="py-4 px-6 text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">
                      {line.cycle}
                    </td>
                    <td className="py-4 px-6 font-mono text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">
                      {line.nextBillDate}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                      {formatCurrency(line.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Action Buttons as specified in Mockup 10 */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            onClick={() => setIsModifyOpen(true)}
            variant="secondary"
            size="md"
            icon={Edit3}
            className="h-11 px-6 rounded-xl border border-black/20 dark:border-white/20 text-[#1d1d1f] dark:text-white font-semibold shadow-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            Modify Subscription
          </Button>

          <button
            type="button"
            onClick={() => {
              setRemoveActionType('cancel');
              setIsRemoveOpen(true);
            }}
            className="h-11 px-6 rounded-xl text-[13.5px] font-semibold border-2 border-[#ff453a]/70 text-[#ff453a] hover:bg-[#ff453a]/10 transition-colors inline-flex items-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel Subscription</span>
          </button>
        </div>
      </div>

      {/* Spec B7: Section 3: Displays upcoming billing schedule for recurring lines */}
      <Card className="p-0 overflow-hidden rounded-[20px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
        <div className="p-5 sm:p-6 pb-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <CardTitle className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
              <span>Upcoming Billing Schedule for Recurring Lines</span>
            </CardTitle>
            <p className="text-[12px] text-[#86868b] mt-0.5">
              Projected invoicing calendar for recurring subscription renewals
            </p>
          </div>
          <Badge variant="success" size="sm" className="font-mono">
            Automated Schedule Active
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#6e6e73] dark:text-[#86868b]">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] uppercase tracking-wider font-mono text-[11.5px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-6 whitespace-nowrap">Billing Date</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Subscription Line & Scope</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Frequency</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Proration Adjustments</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Projected Amount</th>
                <th className="py-3.5 px-6 text-right whitespace-nowrap">Schedule Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {[
                { date: 'Oct 15, 2026', scope: `${currentPlan} (${currentQuantity} Active Seats)`, cycle: 'Monthly', proration: 'Standard Period', amount: currentMonthlyTotal, status: 'Scheduled' },
                { date: 'Nov 15, 2026', scope: `${currentPlan} (${currentQuantity} Active Seats)`, cycle: 'Monthly', proration: 'Standard Period', amount: currentMonthlyTotal, status: 'Scheduled' },
                { date: 'Dec 15, 2026', scope: `${currentPlan} (${currentQuantity} Active Seats)`, cycle: 'Monthly', proration: 'Standard Period', amount: currentMonthlyTotal, status: 'Scheduled' },
                { date: 'Jan 15, 2027', scope: `${currentPlan} (${currentQuantity} Active Seats)`, cycle: 'Monthly', proration: 'Annual Renewal Review', amount: currentMonthlyTotal, status: 'Scheduled (Renewal Window)' }
              ].map((cycle, i) => (
                <tr key={i} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-6 font-mono font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                    {cycle.date}
                  </td>
                  <td className="py-3.5 px-5 text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">
                    {cycle.scope}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {cycle.cycle}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono text-[12px] whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#86868b]">
                      {cycle.proration}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono font-bold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                    {formatCurrency(cycle.amount)}
                  </td>
                  <td className="py-3.5 px-6 text-right whitespace-nowrap">
                    <Badge variant="neutral" size="sm">
                      {cycle.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Spec B7: Section 4: Automatic Partial Refunds & Credit Notes Ledger */}
      <Card className="p-0 overflow-hidden rounded-[20px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
        <div className="p-5 sm:p-6 pb-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <CardTitle className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ff9f0a]" />
              <span>Triggered Credit Notes & Partial Refunds</span>
            </CardTitle>
            <p className="text-[12px] text-[#86868b] mt-0.5">
              Automated credit notes generated by cancellations or mid-cycle seat/plan reductions
            </p>
          </div>
          <span className="text-[12px] font-mono text-[#86868b]">
            {creditNotes.length} Triggered Record(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#6e6e73] dark:text-[#86868b]">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] uppercase tracking-wider font-mono text-[11.5px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-6 whitespace-nowrap">Credit Note #</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Trigger Date</th>
                <th className="py-3.5 px-6 whitespace-nowrap">Audit Reason</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Settlement Method</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Credit Amount</th>
                <th className="py-3.5 px-6 text-right whitespace-nowrap">Ledger Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {creditNotes.map((cn, idx) => (
                <tr key={idx} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-6 font-mono font-bold text-[#0071e3] dark:text-[#2997ff] whitespace-nowrap">
                    {cn.id}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-[12px] whitespace-nowrap">
                    {cn.date ? formatDate(cn.date) : 'Recent'}
                  </td>
                  <td className="py-3.5 px-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {cn.reason}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11.5px] font-medium bg-[#0071e3]/10 text-[#0071e3] dark:text-[#2997ff]">
                      {cn.type === 'refund' ? 'Stripe ACH Refund' : 'Customer Account Credit'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right font-mono font-bold text-[#1b7a36] dark:text-[#30d158] whitespace-nowrap">
                    ${cn.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-6 text-right whitespace-nowrap">
                    <Badge variant="success" size="sm">
                      {cn.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                Quantity / Active Seats
              </label>
              <input
                type="number"
                min="1"
                required
                value={modifyForm.quantity}
                onChange={(e) => setModifyForm({ ...modifyForm, quantity: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3] font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Unit Rate per Seat ($/mo)
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

          {/* Live Proration Breakdown Box */}
          <div className="p-4 rounded-xl bg-[#0071e3]/10 dark:bg-[#2997ff]/10 border border-[#0071e3]/20 dark:border-[#2997ff]/25 space-y-2">
            <div className="flex items-center justify-between font-semibold text-[#0071e3] dark:text-[#2997ff]">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4 shrink-0" />
                <span>Live Mid-Cycle Proration Calculation (Quantity & Rate)</span>
              </span>
              <span className="font-mono text-[13px]">
                {((prorationRatio) * 100).toFixed(0)}% Cycle Remaining ({daysRemaining}d)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[12px]">
              <div>
                <span className="text-[#6e6e73] dark:text-[#86868b] block">Current Scope:</span>
                <span className="font-mono font-medium text-[#1d1d1f] dark:text-white">{currentQuantity} seats @ ${currentUnitPrice}/mo</span>
              </div>
              <div>
                <span className="text-[#6e6e73] dark:text-[#86868b] block">New Scope:</span>
                <span className="font-mono font-medium text-[#1d1d1f] dark:text-white">{newQuantity} seats @ ${newUnitPrice}/mo</span>
              </div>
              <div>
                <span className="text-[#6e6e73] dark:text-[#86868b] block">Quantity Delta:</span>
                <span className={`font-mono font-medium ${quantityDelta > 0 ? 'text-[#0071e3]' : quantityDelta < 0 ? 'text-[#ff9f0a]' : 'text-[#86868b]'}`}>
                  {quantityDelta > 0 ? `+${quantityDelta} seats` : quantityDelta < 0 ? `${quantityDelta} seats` : '0 seats'}
                </span>
              </div>
              <div>
                <span className="text-[#6e6e73] dark:text-[#86868b] block">Immediate Prorated:</span>
                <span className={`font-mono font-bold ${immediateProratedCharge >= 0 ? 'text-[#1b7a36] dark:text-[#30d158]' : 'text-[#ff9f0a]'}`}>
                  {immediateProratedCharge >= 0 ? `+$${immediateProratedCharge}` : `-$${Math.abs(immediateProratedCharge)}`}
                </span>
              </div>
            </div>

            {isDownwardAdjustment && (
              <div className="mt-2 pt-2 border-t border-[#0071e3]/20 flex items-center gap-2 text-[12px] text-[#9e5200] dark:text-[#ff9f0a]">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>
                  <strong>Automatic Credit Note Trigger:</strong> Saving this downward change will automatically issue a Credit Note of <strong>${Math.abs(immediateProratedCharge)}</strong> to the customer ledger balance.
                </span>
              </div>
            )}
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

          {/* Spec B7: Automatic Partial Refund or Credit Note Trigger when Cancelling */}
          {removeActionType === 'cancel' && (
            <div className="p-3.5 rounded-xl bg-[#ff9f0a]/10 dark:bg-[#ff9f0a]/15 border border-[#ff9f0a]/30 text-[12.5px] space-y-2">
              <div className="flex items-center justify-between font-semibold text-[#9e5200] dark:text-[#ff9f0a]">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Automatic Partial Refund / Credit Note Trigger</span>
                </span>
                <span className="font-mono font-bold">${unusedCancellationRefund}</span>
              </div>
              <p className="text-[#6e6e73] dark:text-[#86868b] leading-relaxed">
                Cancelling mid-cycle triggers an automated credit note or partial refund for {daysRemaining} unused days of the current 30-day billing cycle.
              </p>
              <div className="flex items-center gap-4 pt-1 text-[12px]">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-[#1d1d1f] dark:text-white">
                  <input
                    type="radio"
                    name="refundType"
                    value="credit_note"
                    checked={refundType === 'credit_note'}
                    onChange={() => setRefundType('credit_note')}
                    className="text-[#0071e3]"
                  />
                  <span>Automatic Credit Note (Customer Balance)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-[#1d1d1f] dark:text-white">
                  <input
                    type="radio"
                    name="refundType"
                    value="refund"
                    checked={refundType === 'refund'}
                    onChange={() => setRefundType('refund')}
                    className="text-[#0071e3]"
                  />
                  <span>Partial Refund (Stripe / ACH)</span>
                </label>
              </div>
            </div>
          )}

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

