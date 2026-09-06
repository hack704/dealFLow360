import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Calendar,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Loader2,
  ChevronDown,
  Download,
  User,
  Building2,
  CreditCard,
  Truck,
  ShieldCheck,
  FileText,
  Sparkles,
  RefreshCw,
  Sliders,
  Tag,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Percent,
  Check
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { formatCurrency, formatDate, formatPercent } from '../../utils/formatters';
import negotiationService from '../../services/negotiationService';
import quotationService from '../../services/quotationService';

export const CustomerPortalPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const quoteParam = searchParams.get('quote') || searchParams.get('id');

  // Determine active view tab based on URL or internal navigation
  const getInitialTab = () => {
    if (location.pathname.includes('/messages')) return 'messages';
    if (location.pathname.includes('/profile')) return 'profile';
    return 'quote';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quotationsList, setQuotationsList] = useState([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState(quoteParam || '');

  // Keep active tab in sync with URL
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'messages') {
      navigate('/portal/messages', { replace: true });
    } else if (tabId === 'profile') {
      navigate('/portal/profile', { replace: true });
    } else {
      navigate('/portal' + (selectedQuoteId ? `?quote=${selectedQuoteId}` : ''), { replace: true });
    }
  };

  // Dynamic Quotation state for customer negotiation
  const [quotation, setQuotation] = useState({
    id: 'QT-DEMO-5366',
    quotationId: null,
    customer: 'Acme Global Enterprises',
    contactPerson: 'Jordan Rivera',
    status: 'Counter-Offered',
    originalTotal: 300000,
    counterTotal: 240000,
    validUntil: '2026-10-30',
    requestedDiscountPercent: 20,
    lines: [
      {
        id: 1,
        name: 'Enterprise Core Platform',
        qty: 1,
        price: 300000,
        discount: 20,
        comment: 'Commercial licensing terms accepted'
      }
    ],
    comments: [
      {
        _id: 'c1',
        author: 'Alex Rivera',
        role: 'sales_rep',
        text: 'Initial enterprise quote submitted with standard 10% volume incentive.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        _id: 'c2',
        author: 'Jordan Rivera (Customer)',
        role: 'customer',
        text: 'We are prepared to confirm immediate purchase if you can accommodate a 20% blended discount and guarantee delivery by Oct 30.',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        _id: 'c3',
        author: 'Sarah Vance (Sales Manager)',
        role: 'sales_manager',
        text: 'Reviewed requested counter-terms. We are evaluating inventory availability across Main Warehouse to accommodate your dispatch window.',
        createdAt: new Date().toISOString()
      }
    ]
  });

  const [counterDiscount, setCounterDiscount] = useState('20');
  const [requestedDate, setRequestedDate] = useState('2026-10-30');
  const [customerNotes, setCustomerNotes] = useState(
    'We can confirm immediate purchase if you can accommodate a 20% blended discount and schedule delivery by Oct 30.'
  );
  const [statusMessage, setStatusMessage] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // New message state for Direct Chat tab
  const [newMessageText, setNewMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Fetch all quotations list on mount
  useEffect(() => {
    const loadAllQuotes = async () => {
      try {
        const res = await quotationService.getQuotations();
        if (res?.data && res.data.length > 0) {
          setQuotationsList(res.data);
          if (!quoteParam && !selectedQuoteId) {
            setSelectedQuoteId(res.data[0].quotationNumber || res.data[0]._id);
          }
        }
      } catch (err) {
        console.warn('Could not load quotes list:', err.message);
      }
    };
    loadAllQuotes();
  }, []);

  // Fetch negotiation and quote data dynamically
  useEffect(() => {
    const fetchNegotiation = async () => {
      setLoading(true);
      const target = selectedQuoteId || quoteParam || 'latest';
      try {
        const res = await negotiationService.getNegotiationByQuote(target);
        if (res?.data) {
          const d = res.data;
          const original = d.originalTotal || d.quotation?.grandTotal || 300000;
          const disc = d.requestedDiscountPercent !== undefined ? d.requestedDiscountPercent : 20;
          const calculatedCounter = Math.round(original * (1 - disc / 100));

          setQuotation((prev) => ({
            ...prev,
            id: d.quotationNumber || d.quotation?.quotationNumber || target,
            quotationId: d.quotationId || d.quotation?._id || d._id,
            customer: d.customerName || d.customer?.name || 'Acme Global Enterprises',
            status: d.status || 'Counter-Offered',
            originalTotal: original,
            counterTotal: d.counterTotal || calculatedCounter,
            requestedDiscountPercent: disc,
            lines: d.lineRedlines && d.lineRedlines.length > 0
              ? d.lineRedlines
              : [
                  {
                    id: 1,
                    name: 'Enterprise Core Platform',
                    qty: 1,
                    price: original,
                    discount: disc,
                    comment: 'Commercial licensing terms accepted'
                  }
                ],
            comments: d.comments && d.comments.length > 0 ? d.comments : prev.comments
          }));

          setCounterDiscount(String(disc));
          if (d.status === 'Accepted' || d.status === 'accepted' || d.status === 'Accepted by Customer') {
            setIsConfirmed(true);
          }
        }
      } catch (err) {
        console.warn('Fallback negotiation portal:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNegotiation();
  }, [selectedQuoteId, quoteParam]);

  const handleSwitchQuotation = (newQuoteNo) => {
    setSelectedQuoteId(newQuoteNo);
    setSearchParams({ quote: newQuoteNo });
    setStatusMessage(null);
    setIsConfirmed(false);
  };

  // Real-time dynamic financial calculations
  const originalTotal = Number(quotation.originalTotal) || 300000;
  const parsedDiscount = Math.max(0, Math.min(50, parseFloat(counterDiscount) || 0));
  const customerSavings = Math.round(originalTotal * (parsedDiscount / 100));
  const dynamicCounterTotal = Math.max(0, originalTotal - customerSavings);
  const isAutoApproval = parsedDiscount <= 15;

  const handleQuickDiscount = (pct) => {
    setCounterDiscount(String(pct));
  };

  // Line-level comment and change request tool state
  const [editingLineIndex, setEditingLineIndex] = useState(null);
  const [lineCommentDraft, setLineCommentDraft] = useState('');
  const [lineRequestNotice, setLineRequestNotice] = useState(null);

  // Canonical status mapping strictly to (Sent, Under Negotiation, Confirmed) per B8 requirement
  const getCanonicalStatus = () => {
    if (isConfirmed) return 'Confirmed';
    const s = (quotation.status || '').toLowerCase();
    if (s === 'accepted' || s === 'confirmed') return 'Confirmed';
    if (
      s === 'under negotiation' ||
      s === 'under_negotiation' ||
      s === 'counter-offered' ||
      s === 'pending_approval' ||
      s === 'pre-approved' ||
      s === 'escalated'
    ) {
      return 'Under Negotiation';
    }
    return 'Sent';
  };
  const canonicalStatus = getCanonicalStatus();

  const handleOpenLineEdit = (index, currentComment) => {
    setEditingLineIndex(index);
    setLineCommentDraft(currentComment || '');
  };

  const handleSaveLineComment = (index) => {
    setQuotation((prev) => {
      const updatedLines = [...prev.lines];
      if (updatedLines[index]) {
        updatedLines[index] = {
          ...updatedLines[index],
          comment: lineCommentDraft.trim() || 'Commercial licensing terms accepted'
        };
      }
      return { ...prev, lines: updatedLines };
    });
    setEditingLineIndex(null);
    setLineRequestNotice(`Line-level change request saved for line item #${index + 1}.`);
    setTimeout(() => setLineRequestNotice(null), 4000);
  };

  const handleQuickDelivery = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setRequestedDate(d.toISOString().split('T')[0]);
  };

  // Spec B8: Submit Request Button Handler
  const handleSubmitRequest = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    const discountNum = parsedDiscount;
    try {
      const quoteTarget = quotation.id || quotation.quotationId;
      await negotiationService.submitCounterOffer(quoteTarget, {
        counterDiscountPercent: discountNum,
        requestedDate,
        customerComment: customerNotes,
        lineRedlines: quotation.lines
      });
    } catch (err) {
      console.warn('Counter offer submission notice:', err.message);
    } finally {
      setSubmitting(false);
    }

    setQuotation((prev) => ({
      ...prev,
      status: 'Under Negotiation',
      counterTotal: dynamicCounterTotal
    }));

    if (discountNum > 15) {
      setStatusMessage({
        type: 'warning',
        text: `Negotiation request submitted with ${discountNum}% proposed discount (${formatCurrency(dynamicCounterTotal)}) and line-level change requests. Status is now "Under Negotiation". Requires Sales Manager & Finance approval.`
      });
    } else {
      setStatusMessage({
        type: 'success',
        text: `Negotiation request submitted with ${discountNum}% proposed discount (${formatCurrency(dynamicCounterTotal)}) and line-level change requests. Status is now "Under Negotiation".`
      });
    }
  };

  // Spec B8: Confirm Quotation Button Handler
  const handleConfirmQuotation = async () => {
    setSubmitting(true);
    const discountNum = parsedDiscount;
    const quoteTarget = quotation.quotationId || quotation.id;

    // Spec B8 rule: If final terms exceed approval thresholds, quotation automatically re-enters the approval flow from B4; otherwise, order moves directly to fulfillment.
    if (discountNum > 15) {
      try {
        await quotationService.updateQuotationStatus(quoteTarget, 'pending_approval');
      } catch (err) {
        console.warn('Quotation status update note:', err.message);
      }
      setIsConfirmed(false);
      setQuotation((prev) => ({ ...prev, status: 'Under Negotiation' }));
      setStatusMessage({
        type: 'warning',
        text: `Confirmation terms exceed standard approval threshold (${discountNum}% > 15% limit). Quotation ${quotation.id} has automatically re-entered the internal approval flow from B4. Internal governance sign-off is required before order release.`
      });
    } else {
      try {
        await quotationService.updateQuotationStatus(quoteTarget, 'accepted');
      } catch (err) {
        console.warn('Quotation status update note:', err.message);
      }
      setIsConfirmed(true);
      setQuotation((prev) => ({ ...prev, status: 'Confirmed' }));
      setStatusMessage({
        type: 'confirmed',
        text: `Quotation ${quotation.id} confirmed! Approved within commercial thresholds. Order moves directly to warehouse fulfillment dispatch and automated invoicing.`
      });
    }
    setSubmitting(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    setIsSendingMessage(true);
    const newMsg = {
      _id: 'c_' + Date.now(),
      author: 'Jordan Rivera (Customer)',
      role: 'customer',
      text: newMessageText.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      if (quotation.id) {
        await negotiationService.addComment(quotation.id, {
          text: newMessageText.trim(),
          role: 'customer'
        });
      }
    } catch (err) {
      console.warn('Comment posted locally:', err.message);
    }

    setQuotation((prev) => ({
      ...prev,
      comments: [...(prev.comments || []), newMsg]
    }));
    setNewMessageText('');
    setIsSendingMessage(false);
  };

  return (
    <div className="max-w-[1560px] mx-auto space-y-6 pb-20 px-2 sm:px-4">
      {/* 1. Header Bar with Dynamic Quotation Switcher & Portal Mode Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-black/[0.08] dark:border-white/[0.08] pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[26px] sm:text-[30px] font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              Customer Negotiation Portal
            </h1>
            <span
              className={`inline-flex items-center px-3.5 py-1 rounded-full text-[12px] font-semibold font-mono tracking-wide ${
                canonicalStatus === 'Confirmed'
                  ? 'bg-[#30d158]/15 text-[#1b7e36] dark:text-[#30d158] border border-[#30d158]/30'
                  : canonicalStatus === 'Under Negotiation'
                  ? 'bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a] border border-[#ff9f0a]/30'
                  : 'bg-[#0071e3]/10 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse" />
              Status: {canonicalStatus}
            </span>
          </div>
          <p className="text-[13.5px] text-[#6e6e73] dark:text-[#86868b] mt-1.5 leading-relaxed">
            Review commercial proposals, negotiate real-time terms, and finalize contracts directly with your dedicated sales team.
          </p>
        </div>

        {/* Dynamic Reference Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.1] shadow-sm hover:border-[#0071e3]/40 transition-all">
            <span className="text-[11px] uppercase font-mono tracking-wider text-[#86868b] block mb-0.5 font-semibold">
              Quotation Reference
            </span>
            <div className="relative flex items-center">
              <select
                aria-label="Select Quotation Reference"
                value={selectedQuoteId || quotation.id}
                onChange={(e) => handleSwitchQuotation(e.target.value)}
                className="w-full text-[13.5px] font-semibold font-mono text-[#1d1d1f] dark:text-[#f5f5f7] bg-transparent border-none outline-none cursor-pointer pr-6 appearance-none focus:ring-0"
              >
                {quotationsList && quotationsList.length > 0 ? (
                  quotationsList.map((q) => (
                    <option
                      key={q._id || q.quotationNumber}
                      value={q.quotationNumber || q._id}
                      className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white font-mono"
                    >
                      {q.quotationNumber || q._id} — {q.customerName || q.customer?.name || 'Customer'}
                    </option>
                  ))
                ) : (
                  <option value={quotation.id} className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white font-mono">
                    {quotation.id} — {quotation.customer}
                  </option>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-[#86868b] pointer-events-none absolute right-0" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Apple-Style Segmented Navigation Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1">
        <div className="inline-flex p-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-lg max-w-full overflow-x-auto whitespace-nowrap no-scrollbar">
          <button
            type="button"
            onClick={() => handleTabChange('quote')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap shrink-0 transition-all ${
              activeTab === 'quote'
                ? 'bg-white dark:bg-[#252528] text-[#0071e3] dark:text-[#2997ff] shadow-sm'
                : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Quotation & Redlines</span>
            <span className="px-1.5 py-0.2 rounded-full text-[11px] font-mono bg-[#0071e3]/10 dark:bg-[#2997ff]/20">
              {quotation.lines.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('messages')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap shrink-0 transition-all ${
              activeTab === 'messages'
                ? 'bg-white dark:bg-[#252528] text-[#0071e3] dark:text-[#2997ff] shadow-sm'
                : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Negotiation Messages</span>
            <span className="px-1.5 py-0.2 rounded-full text-[11px] font-mono bg-black/[0.06] dark:bg-white/[0.1]">
              {(quotation.comments || []).length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap shrink-0 transition-all ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-[#252528] text-[#0071e3] dark:text-[#2997ff] shadow-sm'
                : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Enterprise Profile & Terms</span>
          </button>
        </div>

        {/* Quick Help & Term Sheet Link */}
        <div className="flex items-center gap-2 text-[12.5px] font-medium text-[#86868b]">
          <span className="hidden sm:inline">Assigned Sales Executive:</span>
          <span className="font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#30d158]" />
            Alex Rivera (Online)
          </span>
        </div>
      </div>

      {/* Confirmation & Alert Banner */}
      {statusMessage && (
        <div
          className={`p-5 rounded-3xl border text-[13.5px] flex items-start gap-4 animate-fadeIn transition-all ${
            statusMessage.type === 'confirmed'
              ? 'bg-[#30d158]/10 border-[#30d158]/30 text-[#1b7e36] dark:text-[#30d158]'
              : statusMessage.type === 'warning'
              ? 'bg-[#ff9f0a]/10 border-[#ff9f0a]/30 text-[#9e5200] dark:text-[#ff9f0a]'
              : 'bg-[#0071e3]/10 border-[#0071e3]/30 text-[#0071e3] dark:text-[#2997ff]'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
              statusMessage.type === 'confirmed'
                ? 'bg-[#30d158]/20'
                : statusMessage.type === 'warning'
                ? 'bg-[#ff9f0a]/20'
                : 'bg-[#0071e3]/20'
            }`}
          >
            {statusMessage.type === 'confirmed' ? (
              <CheckCircle2 className="w-5 h-5 text-[#30d158]" />
            ) : statusMessage.type === 'warning' ? (
              <ShieldAlert className="w-5 h-5 text-[#ff9f0a]" />
            ) : (
              <Sparkles className="w-5 h-5 text-[#0071e3] dark:text-[#2997ff]" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <p className="font-semibold leading-relaxed">{statusMessage.text}</p>
            {statusMessage.type === 'confirmed' && (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate(`/fulfillment/${quotation.id}`)}
                >
                  Inspect Warehouse Fulfillment &rarr;
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate('/invoices')}
                >
                  Review Ledger Invoice &rarr;
                </Button>
              </div>
            )}
            {statusMessage.type === 'warning' && (
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleTabChange('messages')}
                >
                  Open Dedicated Message Thread &rarr;
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: MY QUOTATION & REDLINE NEGOTIATION                                  */}
      {/* ========================================================================= */}
      {activeTab === 'quote' && (
        <div className="space-y-6">
          {/* 4 Dynamic Live Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white/90 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] shadow-sm backdrop-blur-xl">
              <span className="text-[12px] font-mono uppercase tracking-wider text-[#86868b] block mb-1">
                Original List Price
              </span>
              <div className="text-[24px] sm:text-[26px] font-bold font-mono text-[#1d1d1f] dark:text-white tracking-tight">
                {formatCurrency(originalTotal)}
              </div>
              <div className="text-[12px] text-[#86868b] mt-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Base commercial catalog total</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white/90 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] shadow-sm backdrop-blur-xl">
              <span className="text-[12px] font-mono uppercase tracking-wider text-[#86868b] block mb-1">
                Proposed Counter Discount
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[24px] sm:text-[26px] font-bold font-mono text-[#0071e3] dark:text-[#2997ff] tracking-tight">
                  {parsedDiscount}%
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#0071e3]/10 dark:bg-[#2997ff]/20 text-[#0071e3] dark:text-[#2997ff] font-bold">
                  {isAutoApproval ? '≤ 15% Pre-Approved' : '> 15% Escalation'}
                </span>
              </div>
              <div className="text-[12px] text-[#86868b] mt-1">
                Threshold: up to 15% auto-approves
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white/90 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] shadow-sm backdrop-blur-xl">
              <span className="text-[12px] font-mono uppercase tracking-wider text-[#86868b] block mb-1">
                Customer Savings
              </span>
              <div className="text-[24px] sm:text-[26px] font-bold font-mono text-[#1b7e36] dark:text-[#30d158] tracking-tight">
                -{formatCurrency(customerSavings)}
              </div>
              <div className="text-[12px] text-[#1b7e36] dark:text-[#30d158] mt-1 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Immediate commercial concession</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0071e3]/10 via-white/80 to-[#2997ff]/[0.05] dark:from-[#0071e3]/20 dark:via-[#161618] dark:to-[#2997ff]/10 border border-[#0071e3]/30 dark:border-[#2997ff]/30 shadow-sm backdrop-blur-xl">
              <span className="text-[12px] font-mono uppercase tracking-wider text-[#0071e3] dark:text-[#2997ff] font-bold block mb-1">
                Revised Net Total
              </span>
              <div className="text-[24px] sm:text-[26px] font-bold font-mono text-[#0071e3] dark:text-[#2997ff] tracking-tight">
                {formatCurrency(dynamicCounterTotal)}
              </div>
              <div className="text-[12px] text-[#6e6e73] dark:text-[#86868b] mt-1">
                Effective contract value
              </div>
            </div>
          </div>

          {/* Interactive Line Items & Real-time Redlines Card */}
          <div className="bg-white/90 dark:bg-[#161618]/95 border border-black/[0.08] dark:border-white/[0.08] rounded-[28px] overflow-hidden backdrop-blur-2xl shadow-sm dark:shadow-apple-card">
            <div className="px-6 py-4.5 border-b border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/[0.01] dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/10 dark:bg-[#2997ff]/15 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff]">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Line Items & Contractual Redlines
                  </h3>
                  <p className="text-[12.5px] text-[#86868b]">
                    Breakdown of hardware, software licenses, and SLA commitments
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-[#86868b] font-mono bg-black/[0.03] dark:bg-white/[0.05] px-3 py-1.5 rounded-xl">
                  Original Total: <strong className="text-[#1d1d1f] dark:text-white">{formatCurrency(originalTotal)}</strong>
                </span>
              </div>
            </div>

            {/* Line Request Notice */}
            {lineRequestNotice && (
              <div className="mx-6 my-3 p-3 rounded-xl bg-[#30d158]/10 border border-[#30d158]/20 text-[#1b7e36] dark:text-[#30d158] text-[12.5px] font-medium flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{lineRequestNotice}</span>
              </div>
            )}

            {/* Responsive Table for Tablet/Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-[13.5px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[12px] font-semibold border-b border-black/[0.06] dark:border-white/[0.08]">
                  <tr>
                    <th className="py-3.5 px-6">Line Item</th>
                    <th className="py-3.5 px-4 text-center">Qty</th>
                    <th className="py-3.5 px-4 text-right">List Price</th>
                    <th className="py-3.5 px-4 text-center">Discount</th>
                    <th className="py-3.5 px-4 text-right">Net Subtotal</th>
                    <th className="py-3.5 px-6">Line-Level Comment & Change Request Tool</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                  {quotation.lines.map((line, idx) => {
                    const lineName = line.name || line.productName || 'Enterprise Platform Solution';
                    const lineQty = line.qty || line.quantity || 1;
                    const linePrice = line.price || line.unitPrice || originalTotal;
                    const lineDisc = parsedDiscount;
                    const netLine = Math.round(linePrice * lineQty * (1 - lineDisc / 100));
                    const lineComment = line.comment || line.customerComment || 'Commercial licensing terms accepted';

                    return (
                      <tr key={line.id || idx} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-4.5 px-6 font-semibold text-[#1d1d1f] dark:text-white">
                          <div>{lineName}</div>
                          <span className="text-[11.5px] font-mono text-[#86868b]">SKU: EP-CORE-360</span>
                        </td>
                        <td className="py-4.5 px-4 text-center font-mono text-[#6e6e73] dark:text-[#86868b]">
                          {lineQty}
                        </td>
                        <td className="py-4.5 px-4 text-right font-mono font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {formatCurrency(linePrice)}
                        </td>
                        <td className="py-4.5 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-mono text-[12px] font-bold bg-[#30d158]/15 text-[#1b7e36] dark:text-[#30d158]">
                            {lineDisc}%
                          </span>
                        </td>
                        <td className="py-4.5 px-4 text-right font-mono font-bold text-[#0071e3] dark:text-[#2997ff]">
                          {formatCurrency(netLine)}
                        </td>
                        <td className="py-4.5 px-6 min-w-[320px]">
                          {editingLineIndex === idx ? (
                            <div className="space-y-2 p-3 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-[#0071e3]/40 shadow-sm animate-fadeIn">
                              <div className="flex items-center justify-between">
                                <span className="text-[11.5px] font-semibold text-[#0071e3] dark:text-[#2997ff] flex items-center gap-1">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  Line Change Request / Note:
                                </span>
                                <div className="flex items-center gap-1">
                                  {['Request 5% rebate', 'Split delivery', '24/7 SLA'].map((preset) => (
                                    <button
                                      key={preset}
                                      type="button"
                                      onClick={() => setLineCommentDraft(preset)}
                                      className="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.08] hover:bg-[#0071e3] hover:text-white transition-colors"
                                    >
                                      {preset}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <input
                                type="text"
                                value={lineCommentDraft}
                                onChange={(e) => setLineCommentDraft(e.target.value)}
                                placeholder="Enter specific change request or stipulation..."
                                className="w-full px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#1c1c1e] text-[12.5px] text-[#1d1d1f] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0071e3]"
                                autoFocus
                              />
                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingLineIndex(null)}
                                  className="text-[11.5px] px-2.5 py-1 rounded-lg text-[#6e6e73] hover:text-[#1d1d1f] dark:hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveLineComment(idx)}
                                  className="text-[11.5px] px-3 py-1 rounded-lg bg-[#0071e3] text-white font-semibold hover:bg-[#0077ed] transition-colors"
                                >
                                  Save Request
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="group flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] hover:border-[#0071e3]/40 transition-all">
                              <div className="text-[12.5px] text-[#4b6358] dark:text-[#9bb8ad] italic truncate max-w-[220px]">
                                "{lineComment}"
                              </div>
                              <button
                                type="button"
                                onClick={() => handleOpenLineEdit(idx, lineComment)}
                                className="text-[11px] font-semibold text-[#0071e3] dark:text-[#2997ff] hover:underline flex items-center gap-1 whitespace-nowrap opacity-85 group-hover:opacity-100"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>Request Change</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Responsive Card Layout for Mobile (< 768px) */}
            <div className="md:hidden divide-y divide-black/[0.06] dark:divide-white/[0.08] p-4 space-y-4">
              {quotation.lines.map((line, idx) => {
                const lineName = line.name || line.productName || 'Enterprise Platform Solution';
                const lineQty = line.qty || line.quantity || 1;
                const linePrice = line.price || line.unitPrice || originalTotal;
                const lineDisc = parsedDiscount;
                const netLine = Math.round(linePrice * lineQty * (1 - lineDisc / 100));
                const lineComment = line.comment || line.customerComment || 'Commercial licensing terms accepted';

                return (
                  <div key={line.id || idx} className="pt-3 first:pt-0 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-[14px] text-[#1d1d1f] dark:text-white">{lineName}</h4>
                        <span className="text-[11px] font-mono text-[#86868b]">Qty: {lineQty} • SKU: EP-CORE-360</span>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-[14px] font-bold text-[#0071e3] dark:text-[#2997ff]">
                          {formatCurrency(netLine)}
                        </div>
                        <span className="text-[11px] text-[#86868b] line-through">
                          {formatCurrency(linePrice * lineQty)}
                        </span>
                      </div>
                    </div>
                    {editingLineIndex === idx ? (
                      <div className="space-y-2 p-3 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-[#0071e3]/40 text-[12px]">
                        <input
                          type="text"
                          value={lineCommentDraft}
                          onChange={(e) => setLineCommentDraft(e.target.value)}
                          placeholder="Change request for this line..."
                          className="w-full px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#1c1c1e] text-[12.5px] text-[#1d1d1f] dark:text-white"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingLineIndex(null)}
                            className="text-[11px] px-2 py-1 text-[#6e6e73]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveLineComment(idx)}
                            className="text-[11px] px-2.5 py-1 bg-[#0071e3] text-white rounded font-semibold"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] text-[12px]">
                        <span className="italic text-[#4b6358] dark:text-[#9bb8ad] truncate">"{lineComment}"</span>
                        <button
                          type="button"
                          onClick={() => handleOpenLineEdit(idx, lineComment)}
                          className="text-[11px] font-semibold text-[#0071e3] dark:text-[#2997ff] ml-2 shrink-0"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Negotiation Controls Form */}
          <div className="bg-white/90 dark:bg-[#161618]/95 border border-black/[0.08] dark:border-white/[0.08] rounded-[28px] p-6 sm:p-8 backdrop-blur-2xl shadow-sm dark:shadow-apple-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
              <div>
                <h3 className="text-[17px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-2">
                  <span>Propose Counter Terms</span>
                  <span className="text-[12.5px] font-normal text-[#86868b]">(Direct In-Portal Submission)</span>
                </h3>
                <p className="text-[13px] text-[#86868b] mt-0.5">
                  Adjust discount percentage or requested fulfillment timeline to test governance thresholds
                </p>
              </div>

              {/* Quick Auto-Approval Badge */}
              <div
                className={`inline-flex items-center px-3 py-1.5 rounded-2xl text-[12px] font-semibold border ${
                  isAutoApproval
                    ? 'bg-[#30d158]/10 text-[#1b7e36] dark:text-[#30d158] border-[#30d158]/30'
                    : 'bg-[#ff9f0a]/10 text-[#9e5200] dark:text-[#ff9f0a] border-[#ff9f0a]/30'
                }`}
              >
                {isAutoApproval ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    <span>Auto-Acceptance Eligible (≤ 15%)</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                    <span>Manager Sign-Off Required (&gt; 15%)</span>
                  </>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-6">
              {/* Counter Discount Proposal Field & Quick Presets */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[13.5px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Counter Discount Proposal Field
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#86868b]">Quick Presets:</span>
                    <div className="flex items-center gap-1.5">
                      {[5, 10, 12, 15, 20, 25].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleQuickDiscount(pct)}
                          className={`px-2.5 py-1 rounded-lg text-[12px] font-mono font-medium transition-all ${
                            parsedDiscount === pct
                              ? 'bg-[#0071e3] text-white shadow-xs'
                              : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#86868b] hover:bg-black/[0.08] dark:hover:bg-white/[0.1]'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-8 space-y-1.5">
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="0.5"
                      value={counterDiscount}
                      onChange={(e) => setCounterDiscount(e.target.value)}
                      disabled={isConfirmed}
                      className="w-full h-2 bg-black/[0.08] dark:bg-white/[0.12] rounded-lg appearance-none cursor-pointer accent-[#0071e3]"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-[#86868b]">
                      <span>0% (List)</span>
                      <span className="text-[#30d158] font-bold">15% Threshold</span>
                      <span>40% Max</span>
                    </div>
                  </div>

                  <div className="sm:col-span-4 relative">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        value={counterDiscount}
                        onChange={(e) => setCounterDiscount(e.target.value)}
                        disabled={isConfirmed}
                        className="w-full h-11 px-4 pr-9 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.15] text-[14px] font-mono font-bold text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3] transition-all"
                      />
                      <Percent className="w-4 h-4 text-[#86868b] absolute right-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Schedule & Quick Buttons */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[13.5px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Requested Delivery & Dispatch Date
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickDelivery(7)}
                      className="px-2.5 py-1 rounded-lg text-[12px] font-mono bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] text-[#6e6e73] dark:text-[#86868b]"
                    >
                      +7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDelivery(14)}
                      className="px-2.5 py-1 rounded-lg text-[12px] font-mono bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] text-[#6e6e73] dark:text-[#86868b]"
                    >
                      +14 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDelivery(30)}
                      className="px-2.5 py-1 rounded-lg text-[12px] font-mono bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] text-[#6e6e73] dark:text-[#86868b]"
                    >
                      +30 Days
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="date"
                    value={requestedDate}
                    onChange={(e) => setRequestedDate(e.target.value)}
                    disabled={isConfirmed}
                    className="w-full h-11 px-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.15] text-[13.5px] font-mono text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3] transition-all"
                  />
                </div>
                <p className="text-[12px] font-mono text-[#86868b]">
                  Standard fulfillment window: 5-7 business days from Main Warehouse hub.
                </p>
              </div>

              {/* Customer Comments & Contract Stipulations */}
              <div className="space-y-2">
                <label className="text-[13.5px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block">
                  Customer Comments & Contractual Stipulations
                </label>
                <textarea
                  rows={3}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  disabled={isConfirmed}
                  placeholder="Enter commercial terms, payment milestone requests, or deployment constraints..."
                  className="w-full p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.15] text-[13.5px] text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3] transition-all resize-none"
                />
              </div>

              {/* Action Bar (Completely Unsquished, Responsive, High-Contrast) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <span className="text-[11.5px] uppercase font-mono tracking-wider text-[#86868b] block">
                    Final Proposed Total
                  </span>
                  <div className="text-[20px] sm:text-[22px] font-bold font-mono text-[#1d1d1f] dark:text-white">
                    {formatCurrency(dynamicCounterTotal)}{' '}
                    <span className="text-[13px] font-medium text-[#1b7e36] dark:text-[#30d158]">
                      (Save {formatCurrency(customerSavings)})
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
                  <button
                    type="submit"
                    disabled={isConfirmed || submitting}
                    className="h-11 px-5 rounded-xl bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-[#1d1d1f] dark:text-white text-[13px] font-semibold transition-all flex items-center justify-center gap-2 border border-black/[0.08] dark:border-white/[0.1] disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#0071e3]" />
                    ) : (
                      <Send className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
                    )}
                    <span>Submit Request</span>
                  </button>

                  <button
                    type="button"
                    disabled={isConfirmed || submitting}
                    onClick={handleConfirmQuotation}
                    className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#1b7e36] to-[#30d158] hover:from-[#16672c] hover:to-[#28b84d] text-white text-[13px] font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isConfirmed ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Quotation Confirmed</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Quotation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Wireframe Gold Callout Note */}
          <div className="p-5 rounded-3xl border border-[#ff9f0a]/30 bg-[#ff9f0a]/[0.08] dark:bg-[#ff9f0a]/[0.06] text-[13.5px] text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#ff9f0a]/15 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-[#ff9f0a]" />
            </div>
            <div>
              <span className="font-bold text-[#9e5200] dark:text-[#ff9f0a]">Governance Guardrail: </span>
              <span>
                If final counter-offer terms exceed pre-authorized discount thresholds (15%), the quote automatically re-enters governance sign-off with your dedicated account manager and VP of Finance.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INTERACTIVE NEGOTIATION MESSAGES CHAT THREAD                       */}
      {/* ========================================================================= */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          <div className="bg-white/90 dark:bg-[#161618]/95 border border-black/[0.08] dark:border-white/[0.08] rounded-[28px] overflow-hidden backdrop-blur-2xl shadow-sm dark:shadow-apple-card flex flex-col h-[640px]">
            {/* Thread Header */}
            <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between bg-black/[0.01] dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/10 dark:bg-[#2997ff]/15 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Quotation Discussion & Live Stipulation Log
                  </h3>
                  <p className="text-[12px] text-[#86868b]">
                    Direct conversation between Acme Global Enterprises and DealFlow360 Account Team
                  </p>
                </div>
              </div>
              <span className="text-[12px] font-mono text-[#86868b]">
                Reference: <strong className="text-[#1d1d1f] dark:text-white">{quotation.id}</strong>
              </span>
            </div>

            {/* Scrollable Messages Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {(quotation.comments || []).map((msg, index) => {
                const isCustomer = msg.role === 'customer';
                const isManager = msg.role === 'sales_manager';

                return (
                  <div
                    key={msg._id || index}
                    className={`flex items-start gap-3 ${isCustomer ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[12px] font-bold ${
                        isCustomer
                          ? 'bg-[#0071e3] text-white'
                          : isManager
                          ? 'bg-[#ff9f0a] text-white'
                          : 'bg-black/[0.06] dark:bg-white/[0.1] text-[#1d1d1f] dark:text-white'
                      }`}
                    >
                      {isCustomer ? 'AC' : isManager ? 'SV' : 'AR'}
                    </div>

                    <div
                      className={`max-w-[80%] sm:max-w-[70%] p-4 rounded-2xl text-[13.5px] space-y-1.5 leading-relaxed shadow-xs ${
                        isCustomer
                          ? 'bg-[#0071e3] text-white rounded-tr-none'
                          : 'bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] rounded-tl-none'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[11px] opacity-80 font-mono">
                        <span className="font-semibold">{msg.author}</span>
                        <span>{formatDate(msg.createdAt)}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-6 py-2 border-t border-black/[0.04] dark:border-white/[0.04] flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] font-mono text-[#86868b] whitespace-nowrap">Suggested:</span>
              {[
                'Can we expedite delivery by 5 business days?',
                'Can we structure billing into milestone payments?',
                'Please attach the SOC2 Type II compliance audit.'
              ].map((chip, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setNewMessageText(chip)}
                  className="px-3 py-1 rounded-full text-[11.5px] bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white whitespace-nowrap transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-black/[0.01] dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Type a message or negotiation note to your sales representative..."
                  className="flex-1 h-11 px-4 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.1] dark:border-white/[0.12] text-[13.5px] text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3] transition-all"
                />
                <button
                  type="submit"
                  disabled={isSendingMessage || !newMessageText.trim()}
                  className="h-11 px-5 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold flex items-center gap-2 disabled:opacity-40 transition-all shrink-0"
                >
                  {isSendingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ENTERPRISE PROFILE & COMMERCIAL TERMS                              */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Account Card */}
            <div className="p-6 sm:p-7 rounded-[28px] bg-white/90 dark:bg-[#161618]/95 border border-black/[0.08] dark:border-white/[0.08] shadow-sm backdrop-blur-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0071e3]/10 dark:bg-[#2997ff]/15 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1d1d1f] dark:text-white">
                    Acme Global Enterprises
                  </h3>
                  <span className="text-[12px] font-mono text-[#86868b]">ID: CUST-ENT-9421</span>
                </div>
              </div>

              <div className="space-y-2.5 text-[13px] divide-y divide-black/[0.04] dark:divide-white/[0.06] pt-1">
                <div className="flex justify-between py-1.5">
                  <span className="text-[#86868b]">Authorized Signatory:</span>
                  <span className="font-semibold text-[#1d1d1f] dark:text-white">Jordan Rivera (VP Procurement)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#86868b]">Tax / VAT ID:</span>
                  <span className="font-mono text-[#1d1d1f] dark:text-white">US-EIN-94-3829102</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#86868b]">Billing Address:</span>
                  <span className="text-right text-[#1d1d1f] dark:text-white">100 Enterprise Way, SF, CA</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#86868b]">Account Tier:</span>
                  <span className="font-bold text-[#0071e3] dark:text-[#2997ff]">Platinum Tier 1</span>
                </div>
              </div>
            </div>

            {/* Commercial Terms & Credit Line */}
            <div className="p-6 sm:p-7 rounded-[28px] bg-white/90 dark:bg-[#161618]/95 border border-black/[0.08] dark:border-white/[0.08] shadow-sm backdrop-blur-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#30d158]/10 dark:bg-[#30d158]/15 flex items-center justify-center text-[#30d158]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1d1d1f] dark:text-white">
                    Credit & Payment Terms
                  </h3>
                  <span className="text-[12px] font-mono text-[#86868b]">Pre-Approved Corporate Line</span>
                </div>
              </div>

              <div className="space-y-2.5 text-[13px] divide-y divide-black/[0.04] dark:divide-white/[0.06] pt-1">
                <div className="flex justify-between py-1.5">
                  <span className="text-[#86868b]">Standard Invoicing:</span>
                  <span className="font-semibold text-[#1d1d1f] dark:text-white">Net 30 Days</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#86868b]">Early Payment Discount:</span>
                  <span className="font-semibold text-[#1b7e36] dark:text-[#30d158]">2% 10 Net 30</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#86868b]">Credit Facility:</span>
                  <span className="font-mono font-bold text-[#1d1d1f] dark:text-white">$1,000,000 USD</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#86868b]">Available Credit:</span>
                  <span className="font-mono text-[#30d158] font-bold">$667,900 USD</span>
                </div>
              </div>
            </div>

            {/* Warehouse Dispatch & Security */}
            <div className="p-6 sm:p-7 rounded-[28px] bg-white/90 dark:bg-[#161618]/95 border border-black/[0.08] dark:border-white/[0.08] shadow-sm backdrop-blur-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#ff9f0a]/10 dark:bg-[#ff9f0a]/15 flex items-center justify-center text-[#ff9f0a]">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1d1d1f] dark:text-white">
                    Fulfillment & Warehousing
                  </h3>
                  <span className="text-[12px] font-mono text-[#86868b]">Standard Logistics Hub</span>
                </div>
              </div>

              <div className="space-y-2.5 text-[13px] divide-y divide-black/[0.04] dark:divide-white/[0.06] pt-1">
                <div className="flex justify-between py-1.5">
                  <span className="text-[#86868b]">Primary Warehouse:</span>
                  <span className="font-semibold text-[#1d1d1f] dark:text-white">Main Warehouse (East)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#86868b]">Secondary Depot:</span>
                  <span className="text-[#1d1d1f] dark:text-white">West Depot (California)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#86868b]">Dedicated Support SLA:</span>
                  <span className="font-bold text-[#0071e3] dark:text-[#2997ff]">24/7 Priority Engineer</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#86868b]">Security Audit:</span>
                  <span className="inline-flex items-center text-[#30d158] font-semibold gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    SOC2 Type II Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortalPage;
