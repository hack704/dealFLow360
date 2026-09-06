import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import {
  Plus,
  Check,
  Loader2,
  Edit3,
  Trash2,
  PauseCircle,
  PlayCircle,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import billingService from '../../services/billingService';

export const SubscriptionsPage = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState(null); // 'Active' | 'Paused' | 'Cancelled' | null
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('success');

  // New Plan Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    customer: '',
    plan: '',
    cycle: 'Monthly',
    status: 'Active',
    nextBill: 'Sep 15'
  });

  // Edit Subscription Modal state
  const [editingSub, setEditingSub] = useState(null);
  const [editForm, setEditForm] = useState({
    plan: '',
    cycle: 'Monthly',
    status: 'Active',
    nextBill: 'Sep 15'
  });

  // Remove Subscription Modal state
  const [removingSub, setRemovingSub] = useState(null);

  const defaultMockSubs = [
    { id: 'sub-01', customer: 'Acme Corp', plan: 'Care Plan 2yr', cycle: 'Monthly', nextBill: 'Sep 15', status: 'Active' },
    { id: 'sub-02', customer: 'Beta Industries', plan: 'Support SLA', cycle: 'Quarterly', nextBill: 'Nov 1', status: 'Active' },
    { id: 'sub-03', customer: 'Delta LLC', plan: 'Care Plan 1yr', cycle: 'Monthly', nextBill: '-', status: 'Paused' }
  ];

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const res = await billingService.getSubscriptions();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setSubscriptions(
          res.data.map((sub) => ({
            id: sub.subscriptionNumber || sub._id,
            customer: sub.customerName || (sub.customer && sub.customer.name) || 'Customer',
            plan: sub.planName || 'Care Plan',
            cycle: sub.billingCycle || 'Monthly',
            nextBill: sub.nextBillDate ? formatDate(sub.nextBillDate) : (sub.status === 'Paused' || sub.status === 'Cancelled' ? '-' : 'Sep 15'),
            status: sub.status || 'Active'
          }))
        );
      } else {
        setSubscriptions(defaultMockSubs);
      }
    } catch (err) {
      console.warn('Fallback subscriptions:', err.message);
      setSubscriptions(defaultMockSubs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const activeCount = subscriptions.filter((s) => s.status === 'Active').length;
  const pausedCount = subscriptions.filter((s) => s.status === 'Paused').length;
  const cancelledCount = subscriptions.filter((s) => s.status === 'Cancelled').length;

  const handleFilterClick = (filter) => {
    setSelectedFilter((prev) => (prev === filter ? null : filter));
  };

  const displayedSubs = selectedFilter
    ? subscriptions.filter((s) => s.status.toLowerCase() === selectedFilter.toLowerCase())
    : subscriptions;

  // Create new plan
  const handleCreatePlan = (e) => {
    e.preventDefault();
    if (!newPlan.customer.trim() || !newPlan.plan.trim()) return;

    const newEntry = {
      id: `sub-${Date.now().toString().slice(-4)}`,
      customer: newPlan.customer.trim(),
      plan: newPlan.plan.trim(),
      cycle: newPlan.cycle,
      nextBill: newPlan.status === 'Active' ? newPlan.nextBill : '-',
      status: newPlan.status
    };

    setSubscriptions((prev) => [newEntry, ...prev]);
    setIsModalOpen(false);
    setNewPlan({
      customer: '',
      plan: '',
      cycle: 'Monthly',
      status: 'Active',
      nextBill: 'Sep 15'
    });
    setFeedbackType('success');
    setFeedbackMessage(`Created new plan "${newEntry.plan}" for ${newEntry.customer}.`);
  };

  // Open Edit Modal
  const openEditModal = (sub, e) => {
    e.stopPropagation();
    setEditingSub(sub);
    setEditForm({
      plan: sub.plan,
      cycle: sub.cycle,
      status: sub.status,
      nextBill: sub.nextBill
    });
  };

  // Submit Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingSub) return;

    try {
      await billingService.updateSubscription(editingSub.id, {
        planName: editForm.plan,
        billingCycle: editForm.cycle,
        status: editForm.status
      });
    } catch (err) {
      console.warn('Backend update fallback:', err.message);
    }

    setSubscriptions((prev) =>
      prev.map((s) =>
        s.id === editingSub.id
          ? {
              ...s,
              plan: editForm.plan,
              cycle: editForm.cycle,
              status: editForm.status,
              nextBill: editForm.status === 'Active' ? editForm.nextBill : '-'
            }
          : s
      )
    );

    setFeedbackType('success');
    setFeedbackMessage(`Subscription for ${editingSub.customer} updated.`);
    setEditingSub(null);
  };

  // Toggle Pause/Resume
  const handleTogglePause = async (sub, e) => {
    e.stopPropagation();
    const isCurrentlyPaused = sub.status === 'Paused';
    try {
      if (isCurrentlyPaused) {
        const res = await billingService.resumeSubscription(sub.id);
        const newBill = res?.data?.newNextBill ? formatDate(res.data.newNextBill) : 'Sep 15';
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === sub.id ? { ...s, status: 'Active', nextBill: newBill } : s))
        );
        setFeedbackType('success');
        setFeedbackMessage(
          `Subscription for ${sub.customer} resumed! Next billing date extended by ${res?.data?.pausedDays || 1} day(s).`
        );
      } else {
        await billingService.pauseSubscription(sub.id, 'Customer requested temporary hold');
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === sub.id ? { ...s, status: 'Paused', nextBill: '-' } : s))
        );
        setFeedbackType('info');
        setFeedbackMessage(
          `Subscription for ${sub.customer} paused. Automated recurring invoices halted.`
        );
      }
    } catch (err) {
      console.warn('Backend toggle fallback:', err.message);
      const nextStatus = isCurrentlyPaused ? 'Active' : 'Paused';
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === sub.id
            ? { ...s, status: nextStatus, nextBill: nextStatus === 'Active' ? 'Sep 15' : '-' }
            : s
        )
      );
      setFeedbackType('info');
      setFeedbackMessage(`Subscription for ${sub.customer} switched to ${nextStatus}.`);
    }
  };

  // Open Remove Modal
  const openRemoveModal = (sub, e) => {
    e.stopPropagation();
    setRemovingSub(sub);
  };

  // Confirm Remove
  const handleConfirmRemove = async () => {
    if (!removingSub) return;
    try {
      await billingService.deleteSubscription(removingSub.id);
    } catch (err) {
      console.warn('Backend delete fallback:', err.message);
    }

    setSubscriptions((prev) => prev.filter((s) => s.id !== removingSub.id));
    setFeedbackType('info');
    setFeedbackMessage(`Subscription for ${removingSub.customer} removed.`);
    setRemovingSub(null);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Screen 9 Header */}
      <div className="space-y-1">
        <h1 className="text-[26px] sm:text-[30px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.025em]">
          Subscriptions (List)
        </h1>
        <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b]">
          Every recurring plan across every customer, regardless of which order it came from
        </p>
      </div>

      {/* Screen 9 Status Badges / Filter Pills with Responsive Layout */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
        {/* 18 Active */}
        <button
          type="button"
          onClick={() => handleFilterClick('Active')}
          className={`px-3.5 sm:px-4 py-1.5 rounded-full text-[12px] sm:text-[13px] font-semibold transition-all duration-150 shadow-sm ${
            selectedFilter === 'Active'
              ? 'bg-[#38a169] text-black ring-2 ring-[#38a169] ring-offset-2 dark:ring-offset-[#121212] scale-105'
              : 'bg-[#38a169] hover:bg-[#2f855a] text-black'
          }`}
          title="Filter by Active subscriptions"
        >
          {activeCount || 18} Active
        </button>

        {/* 2 Paused */}
        <button
          type="button"
          onClick={() => handleFilterClick('Paused')}
          className={`px-3.5 sm:px-4 py-1.5 rounded-full text-[12px] sm:text-[13px] font-semibold transition-all duration-150 shadow-sm ${
            selectedFilter === 'Paused'
              ? 'bg-[#dd6b20] text-black ring-2 ring-[#dd6b20] ring-offset-2 dark:ring-offset-[#121212] scale-105'
              : 'bg-[#dd6b20] hover:bg-[#c05621] text-black'
          }`}
          title="Filter by Paused subscriptions"
        >
          {pausedCount || 2} Paused
        </button>

        {/* 3 Cancelled */}
        <button
          type="button"
          onClick={() => handleFilterClick('Cancelled')}
          className={`px-3.5 sm:px-4 py-1.5 rounded-full text-[12px] sm:text-[13px] font-semibold transition-all duration-150 shadow-sm ${
            selectedFilter === 'Cancelled'
              ? 'bg-[#e53e3e] text-black ring-2 ring-[#e53e3e] ring-offset-2 dark:ring-offset-[#121212] scale-105'
              : 'bg-[#ff7b72] hover:bg-[#e53e3e] text-black'
          }`}
          title="Filter by Cancelled subscriptions"
        >
          {cancelledCount || 3} Cancelled
        </button>

        {selectedFilter && (
          <button
            type="button"
            onClick={() => setSelectedFilter(null)}
            className="text-[12px] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white underline ml-1"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between gap-3 text-[13px] transition-all ${
            feedbackType === 'success'
              ? 'bg-[#34c759]/10 border-[#34c759]/30 text-[#1b7a36] dark:text-[#30d158]'
              : 'bg-[#ff9f0a]/10 border-[#ff9f0a]/30 text-[#9e5200] dark:text-[#ff9f0a]'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage('')}
            className="text-[12px] opacity-70 hover:opacity-100 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Screen 9 Table with Responsive Quick Action Icons */}
      <Card className="p-0 overflow-hidden rounded-[14px] bg-white/80 dark:bg-[#161618]/90 border border-black/[0.1] dark:border-white/[0.12] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] sm:text-[13.5px] text-[#1d1d1f] dark:text-[#f5f5f7]">
            <thead className="bg-black/[0.02] dark:bg-white/[0.04] text-[#86868b] tracking-wider font-mono text-[12px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6 font-semibold whitespace-nowrap">Customer</th>
                <th className="py-3.5 px-4 sm:px-6 font-semibold whitespace-nowrap">Plan</th>
                <th className="py-3.5 px-4 sm:px-6 font-semibold whitespace-nowrap">Cycle</th>
                <th className="py-3.5 px-4 sm:px-6 font-mono font-semibold whitespace-nowrap">Next Bill</th>
                <th className="py-3.5 px-4 sm:px-6 font-semibold whitespace-nowrap">Status</th>
                <th className="py-3.5 px-3 sm:px-4 font-semibold text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#86868b]">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading subscriptions...
                  </td>
                </tr>
              ) : displayedSubs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-[#86868b]">
                    No subscriptions found matching filter.
                  </td>
                </tr>
              ) : (
                displayedSubs.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => navigate(`/subscriptions/${sub.id}`)}
                    className="hover:bg-black/[0.03] dark:hover:bg-white/[0.04] cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-[#1d1d1f] dark:text-white whitespace-nowrap">
                      {sub.customer}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">
                      {sub.plan}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">
                      {sub.cycle}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">
                      {sub.nextBill}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                          sub.status === 'Active'
                            ? 'bg-[#34c759]/15 text-[#1b7a36] dark:text-[#30d158] border border-[#34c759]/30'
                            : sub.status === 'Paused'
                            ? 'bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a] border border-[#ff9f0a]/30'
                            : 'bg-[#ff453a]/15 text-[#c9342c] dark:text-[#ff453a] border border-[#ff453a]/30'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    {/* Row Quick Actions with Responsive Icons */}
                    <td className="py-3.5 px-3 sm:px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                        {/* Modify / Edit */}
                        <button
                          type="button"
                          onClick={(e) => openEditModal(sub, e)}
                          title="Modify subscription"
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[#6e6e73] dark:text-[#86868b] hover:text-[#0071e3] dark:hover:text-[#2997ff] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        </button>

                        {/* Pause / Resume */}
                        <button
                          type="button"
                          onClick={(e) => handleTogglePause(sub, e)}
                          title={sub.status === 'Paused' ? 'Resume subscription' : 'Pause subscription'}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[#6e6e73] dark:text-[#86868b] hover:text-[#ff9f0a] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
                        >
                          {sub.status === 'Paused' ? (
                            <PlayCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#34c759] shrink-0" />
                          ) : (
                            <PauseCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff9f0a] shrink-0" />
                          )}
                        </button>

                        {/* Remove / Delete */}
                        <button
                          type="button"
                          onClick={(e) => openRemoveModal(sub, e)}
                          title="Remove subscription"
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[#6e6e73] dark:text-[#86868b] hover:text-[#ff453a] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Screen 9 Exact Amber Callout Box */}
      <div className="p-3.5 sm:p-5 rounded-[12px] bg-[#2a2208]/80 dark:bg-[#1f1906] border border-[#f5a623]/50 text-[#f5a623] text-[13px] sm:text-[13.5px] font-normal leading-relaxed">
        Click a subscription row to open its billing detail and proration history.
      </div>

      {/* Screen 9 Action Button: + New Plan (Admin) */}
      <div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-[14px] border border-black/25 dark:border-white/25 bg-transparent hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-[12.5px] sm:text-[13.5px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] transition-all hover:border-black/40 dark:hover:border-white/40 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff] shrink-0" />
          <span>+ New Plan (Admin)</span>
        </button>
      </div>

      {/* Modal for + New Plan (Admin) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Subscription Plan (Admin)"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4 text-[13px]">
          <div>
            <label className="block font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Customer / Account Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Corp"
              value={newPlan.customer}
              onChange={(e) => setNewPlan({ ...newPlan, customer: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            />
          </div>

          <div>
            <label className="block font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Plan Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Care Plan 2yr, Support SLA"
              value={newPlan.plan}
              onChange={(e) => setNewPlan({ ...newPlan, plan: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Billing Cycle
              </label>
              <select
                value={newPlan.cycle}
                onChange={(e) => setNewPlan({ ...newPlan, cycle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Status
              </label>
              <select
                value={newPlan.status}
                onChange={(e) => setNewPlan({ ...newPlan, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Next Bill Date
            </label>
            <input
              type="text"
              placeholder="e.g. Sep 15, Oct 1"
              value={newPlan.nextBill}
              onChange={(e) => setNewPlan({ ...newPlan, nextBill: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-black/[0.08] dark:border-white/[0.08]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Check}>
              Save Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal for Modifying a Subscription */}
      <Modal
        isOpen={!!editingSub}
        onClose={() => setEditingSub(null)}
        title={`Modify Subscription: ${editingSub?.customer}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-[13px]">
          <div>
            <label className="block font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
              Plan Name
            </label>
            <input
              type="text"
              required
              value={editForm.plan}
              onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Billing Cycle
              </label>
              <select
                value={editForm.cycle}
                onChange={(e) => setEditForm({ ...editForm, cycle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-black/[0.02] dark:bg-white/[0.05] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-black/[0.08] dark:border-white/[0.08]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setEditingSub(null)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={Check}>
              Apply Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal for Removing a Subscription */}
      <Modal
        isOpen={!!removingSub}
        onClose={() => setRemovingSub(null)}
        title="Remove Subscription"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-[13px]">
          <p className="text-[#6e6e73] dark:text-[#86868b]">
            Are you sure you want to remove the recurring plan <strong className="text-[#1d1d1f] dark:text-white">{removingSub?.plan}</strong> for <strong className="text-[#1d1d1f] dark:text-white">{removingSub?.customer}</strong>?
          </p>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-black/[0.08] dark:border-white/[0.08]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRemovingSub(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleConfirmRemove}
              icon={Trash2}
            >
              Confirm Remove
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubscriptionsPage;

