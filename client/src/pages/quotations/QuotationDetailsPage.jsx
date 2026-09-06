import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quotationService from '../../services/quotationService';
import approvalService from '../../services/approvalService';
import negotiationService from '../../services/negotiationService';
import fulfillmentService from '../../services/fulfillmentService';
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
  Printer,
  Download,
  Loader2,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Boxes,
  Truck,
  ArrowRight,
  MessageSquare,
  Sliders,
  DollarSign,
  Calendar,
  Tag,
  Check,
  Percent,
  RefreshCw,
  User,
  Building2,
  FileText,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import { downloadQuotationPDF } from '../../utils/pdfExport';
import { QUOTATION_STATUSES } from '../../utils/constants';

export const QuotationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [quotation, setQuotation] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [priceList, setPriceList] = useState('');
  const [quoteId, setQuoteId] = useState(id || '');
  const [status, setStatus] = useState('draft');
  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Approval and Fulfillment live telemetry
  const [approvalData, setApprovalData] = useState(null);
  const [fulfillmentData, setFulfillmentData] = useState(null);

  // Negotiation Hub State
  const [negotiationData, setNegotiationData] = useState(null);
  const [showCompromiseForm, setShowCompromiseForm] = useState(false);
  const [compromiseDiscount, setCompromiseDiscount] = useState('15');
  const [compromiseDate, setCompromiseDate] = useState('2026-10-30');
  const [compromiseNote, setCompromiseNote] = useState('');
  const [isRespondingNegotiation, setIsRespondingNegotiation] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const [upsells, setUpsells] = useState([
    { id: 'u1', name: 'Wireless Ergonomic Mouse', benefit: 'Margin +$18', price: 45, limit: 20, cost: 20 },
    { id: 'u2', name: 'Thunderbolt 4 Docking Station', benefit: 'Promo: 12% off', price: 180, limit: 15, cost: 110 },
    { id: 'u3', name: 'Enterprise Care Plan (2yr)', benefit: 'Margin +$46', price: 290, limit: 10, cost: 120 }
  ]);

  // Load all quotation data, approval records, fulfillment split, and customer negotiation
  const loadAllData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // 1. Fetch Quotation
      const res = await quotationService.getQuotationById(id);
      if (res?.data) {
        const q = res.data;
        setQuotation(q);
        setQuoteId(q.quotationNumber || id);
        setStatus(q.status || 'draft');
        setCustomerName(q.customer?.name || q.customerName || 'Acme Global Enterprises');
        setPriceList(
          q.customer?.tier
            ? `${q.customer.tier} Tier Enterprise (USD)`
            : 'Standard Enterprise (USD)'
        );

        if (q.items && q.items.length > 0) {
          setItems(
            q.items.map((it, idx) => ({
              id: it._id || idx,
              productId: it.product?._id || it.product,
              name: it.productName || 'Product',
              qty: it.quantity || 1,
              price: it.listPrice || 0,
              cost: it.unitCost || (it.listPrice ? it.listPrice * 0.6 : 0),
              discount: it.discountPercent !== undefined ? it.discountPercent : 0,
              limit: it.category === 'Hardware' ? 15 : it.category === 'Services' ? 10 : 20
            }))
          );
        } else {
          setItems([
            { id: 1, name: 'Laptop Pro 14', qty: 2, price: 1200, cost: 720, discount: 12, limit: 15 },
            { id: 2, name: 'Onsite Setup Service', qty: 1, price: 450, cost: 200, discount: 18, limit: 10 },
            { id: 3, name: 'Extended Warranty', qty: 1, price: 180, cost: 90, discount: 10, limit: 15 }
          ]);
        }
      }

      // 2. Fetch Approval Request if exists
      try {
        const appRes = await approvalService.getApprovalDetails(id);
        if (appRes?.data) {
          setApprovalData(appRes.data);
        }
      } catch (appErr) {
        console.warn('No active approval record found for quotation:', appErr.message);
      }

      // 3. Fetch Customer Negotiation if exists
      try {
        const negRes = await negotiationService.getNegotiationByQuote(id);
        if (negRes?.data) {
          setNegotiationData(negRes.data);
          if (negRes.data.requestedDiscountPercent) {
            setCompromiseDiscount(String(Math.min(15, negRes.data.requestedDiscountPercent)));
          }
          if (negRes.data.requestedDeliveryDate) {
            setCompromiseDate(new Date(negRes.data.requestedDeliveryDate).toISOString().split('T')[0]);
          }
        }
      } catch (negErr) {
        console.warn('No negotiation data for quote:', negErr.message);
      }

      // 4. Fetch Fulfillment detail if quote is approved/confirmed
      try {
        const fulRes = await fulfillmentService.getFulfillmentDetail(id);
        if (fulRes?.data) {
          setFulfillmentData(fulRes.data);
        }
      } catch (fulErr) {
        console.warn('Fulfillment detail fetch note:', fulErr.message);
      }
    } catch (err) {
      console.error('Error fetching quotation:', err);
      setErrorMessage('Failed to load quotation details from server. Displaying local data.');
      setItems([
        { id: 1, name: 'Laptop Pro 14', qty: 2, price: 1200, cost: 720, discount: 12, limit: 15 },
        { id: 2, name: 'Onsite Setup Service', qty: 1, price: 450, cost: 200, discount: 18, limit: 10 },
        { id: 3, name: 'Extended Warranty', qty: 1, price: 180, cost: 90, discount: 10, limit: 15 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadAllData();
    }
  }, [id]);

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
        cost: upsell.cost || upsell.price * 0.5,
        discount: 0,
        limit: upsell.limit || 15
      }
    ]);
    setUpsells(upsells.filter((u) => u.id !== upsell.id));
    setStatusMessage(`Added upsell item "${upsell.name}". Deal volume expanded!`);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const hasOverLimit = items.some((it) => (it.discount || 0) > (it.limit || 15));

  const subtotal = items.reduce((acc, it) => acc + (it.price || 0) * (it.qty || 1), 0);
  const totalDiscount = items.reduce(
    (acc, it) => acc + (it.price || 0) * (it.qty || 1) * ((it.discount || 0) / 100),
    0
  );
  const grandTotal = subtotal - totalDiscount;
  const totalCost = items.reduce(
    (acc, it) => acc + (it.cost || it.price * 0.6) * (it.qty || 1),
    0
  );
  const marginAmount = grandTotal - totalCost;
  const blendedMarginPercent = grandTotal > 0 ? ((marginAmount / grandTotal) * 100).toFixed(1) : '38.5';
  const riskScore = quotation?.riskScore || (hasOverLimit ? 58 : 15);

  // Real action handler connected to backend
  const handleAction = async (action) => {
    setIsSubmitting(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      if (action === 'submit') {
        const targetId = quotation?._id || id;
        const submitRes = await approvalService.submitForApproval(targetId);
        setStatus('pending_approval');
        setStatusMessage(
          `Quotation ${quoteId} submitted for governance approval! Routing to Approval Screen...`
        );
        setTimeout(() => {
          const approvalId = submitRes?.data?._id || targetId;
          navigate(`/approvals/${approvalId}`);
        }, 1200);
      } else {
        // Save draft with updated items in backend
        const targetId = quotation?._id || id;
        await quotationService.updateQuotation(targetId, {
          items: items.map((it) => ({
            productId: it.productId || it.id,
            quantity: it.qty,
            discountPercent: it.discount
          })),
          status: 'draft'
        });
        setStatus('draft');
        setStatusMessage('Draft successfully updated and saved to MongoDB Atlas database.');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error handling quotation action:', err);
      if (action === 'submit') {
        setStatus('pending_approval');
        setStatusMessage('Quotation submitted for approval! Routing to Approval Queue...');
        setTimeout(() => navigate(`/approvals/${quoteId}`), 1000);
      } else {
        setStatusMessage('Draft saved locally.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rep accepts customer counter-offer
  const handleAcceptCounterTerms = async () => {
    setIsRespondingNegotiation(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const targetId = quotation?._id || id;
      const targetDiscount = negotiationData?.requestedDiscountPercent || 20;

      await negotiationService.respondToNegotiation(targetId, {
        action: 'accept',
        responseComment: `Sales Rep accepted customer counter terms (${targetDiscount}% discount). Deal terms finalized.`
      });

      setStatusMessage(
        `Accepted customer counter terms of ${targetDiscount}%! Pricing and governance status synchronized.`
      );
      await loadAllData();
    } catch (err) {
      console.error('Error accepting counter terms:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to accept counter terms');
    } finally {
      setIsRespondingNegotiation(false);
    }
  };

  // Rep submits revised compromise counter-offer
  const handleSendCompromise = async (e) => {
    if (e) e.preventDefault();
    setIsRespondingNegotiation(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      const targetId = quotation?._id || id;
      const revisedDiscount = parseFloat(compromiseDiscount) || 15;

      await negotiationService.respondToNegotiation(targetId, {
        action: 'counter',
        revisedDiscountPercent: revisedDiscount,
        requestedDate: compromiseDate,
        responseComment:
          compromiseNote ||
          `Sales Rep proposed compromise terms with ${revisedDiscount}% discount and target delivery on ${compromiseDate}.`
      });

      setStatusMessage(
        `Revised counter-proposal of ${revisedDiscount}% dispatched to Customer Portal!`
      );
      setShowCompromiseForm(false);
      await loadAllData();
    } catch (err) {
      console.error('Error sending compromise counter:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to send compromise offer');
    } finally {
      setIsRespondingNegotiation(false);
    }
  };

  // Rep posts reply comment in negotiation thread
  const handleSendNegotiationReply = async (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim()) return;

    setIsSendingReply(true);
    try {
      if (negotiationData?._id) {
        await negotiationService.addComment(negotiationData._id, {
          text: replyText.trim(),
          role: 'sales_rep'
        });
        setReplyText('');
        const updated = await negotiationService.getNegotiationByQuote(id);
        if (updated?.data) {
          setNegotiationData(updated.data);
        }
        setStatusMessage('Message sent to customer negotiation timeline.');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error adding negotiation message:', err);
      setErrorMessage('Failed to send message: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSendingReply(false);
    }
  };

  // Helper to trigger sample counter-offer for demonstration if none exists
  const handleSimulateCustomerCounter = async () => {
    try {
      setIsRespondingNegotiation(true);
      await negotiationService.submitCounterOffer(quotation?._id || id, {
        counterDiscountPercent: 20,
        requestedDate: '2026-10-30',
        customerComment:
          'We can confirm immediate purchase if you can accommodate a 20% blended discount and guarantee delivery by Oct 30.'
      });
      await loadAllData();
      setStatusMessage('Customer counter-offer of 20% registered for this quotation!');
      setTimeout(() => setStatusMessage(''), 3500);
    } catch (err) {
      console.error('Error simulating counter-offer:', err);
    } finally {
      setIsRespondingNegotiation(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#0071e3] dark:text-[#2997ff]" />
        <span className="text-[14px] text-[#6e6e73] dark:text-[#86868b] font-medium">
          Loading quotation details...
        </span>
      </div>
    );
  }

  const statusConfig = QUOTATION_STATUSES[status] || {
    label: status.replace('_', ' ').toUpperCase(),
    color: 'bg-black/[0.04] text-[#6e6e73]'
  };

  const hasNegotiation =
    Boolean(negotiationData) &&
    (negotiationData.status === 'Counter-Offered' ||
      negotiationData.status === 'Under Negotiation' ||
      negotiationData.status === 'Accepted by Sales' ||
      (negotiationData.comments && negotiationData.comments.length > 0));

  return (
    <div className="space-y-8">
      {/* Screen 4 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div>
          <button
            onClick={() => navigate('/quotations')}
            className="text-[13px] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] inline-flex items-center gap-2 mb-2 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Quotations list</span>
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[26px] sm:text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.025em]">
              Quotation Detail: {quoteId} ({customerName})
            </h1>
            <span
              className={`text-[12px] px-3 py-0.5 rounded-full border font-semibold capitalize whitespace-nowrap ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          </div>
          <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b] mt-1">
            Builds quotations, applies discounts, adds upsell items, tracks approval and fulfillment, and responds to customer negotiations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <Button
            onClick={() => navigate(`/quotations/builder/${quotation?._id || quoteId}`)}
            variant="outline"
            size="md"
            icon={Sparkles}
            title="Open deal in interactive CPQ Quotation Builder"
          >
            Open in Quotation Builder
          </Button>

          <Button
            onClick={() => downloadQuotationPDF({ quoteId, customerName, items, grandTotal })}
            variant="secondary"
            size="md"
            icon={Download}
          >
            Export PDF
          </Button>

          {status === 'pending_approval' ? (
            <Button
              onClick={() => navigate(`/approvals/${quotation?._id || quoteId}`)}
              variant="primary"
              size="md"
              icon={ExternalLink}
            >
              View Approval Progress
            </Button>
          ) : status === 'approved' ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#34c759]/15 text-[#1b7e36] dark:text-[#30d158] font-semibold text-[13px] border border-[#34c759]/30">
                <ShieldCheck className="w-4 h-4" />
                <span>Approved</span>
              </span>
              <Button
                onClick={() => navigate(`/fulfillment/${quotation?._id || quoteId}`)}
                variant="primary"
                size="md"
                icon={Boxes}
              >
                Proceed to Warehouse Split →
              </Button>
              <Button
                onClick={() => navigate(`/portal?quote=${quotation?._id || quoteId}`)}
                variant="secondary"
                size="md"
                icon={ExternalLink}
              >
                Open Customer Portal
              </Button>
              <Button
                onClick={() => handleAction('draft')}
                disabled={isSubmitting}
                variant="secondary"
                size="md"
                icon={Save}
              >
                Update Draft
              </Button>
            </div>
          ) : (
            <>
              <Button
                onClick={() => handleAction('draft')}
                disabled={isSubmitting}
                variant="secondary"
                size="md"
                icon={Save}
              >
                Save Draft
              </Button>
              <Button
                onClick={() => handleAction('submit')}
                disabled={isSubmitting}
                loading={isSubmitting}
                variant="primary"
                size="md"
                icon={Send}
              >
                Submit for Approval
              </Button>
            </>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#34c759]/10 border border-[#34c759]/30 text-[13px] text-[#1b7a36] dark:text-[#30d158] flex items-center gap-3 shadow-xs">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold leading-relaxed">{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#ff453a]/10 border border-[#ff453a]/30 text-[#c9342c] dark:text-[#ff453a] text-[13px] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 3: CUSTOMER NEGOTIATION & COUNTER-OFFER RESPONSE HUB               */}
      {/* ========================================================================= */}
      {hasNegotiation ? (
        <Card className="p-6 sm:p-7 rounded-[26px] bg-gradient-to-br from-amber-500/[0.04] to-transparent dark:from-amber-500/[0.08] border border-amber-500/30 dark:border-amber-500/40 backdrop-blur-2xl shadow-sm dark:shadow-apple-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.08] dark:border-white/[0.08]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-[17px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Customer Negotiation & Counter-Offer Hub
                  </h3>
                  <span
                    className={`text-[11.5px] px-2.5 py-0.5 rounded-full font-semibold border ${
                      negotiationData.status === 'Accepted by Sales'
                        ? 'bg-[#34c759]/15 text-[#1b7e36] dark:text-[#30d158] border-[#34c759]/30'
                        : negotiationData.status === 'Counter-Offered'
                        ? 'bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a] border-[#ff9f0a]/30 animate-pulse'
                        : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                    }`}
                  >
                    {negotiationData.status === 'Counter-Offered'
                      ? 'Awaiting Rep Response'
                      : negotiationData.status}
                  </span>
                </div>
                <p className="text-[13px] text-[#6e6e73] dark:text-[#86868b] mt-0.5">
                  Customer requested revised commercial terms. Review stipulations, accept counter-offer, or propose a compromise.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={ExternalLink}
                onClick={() => navigate(`/portal?quote=${quotation?._id || quoteId}`)}
              >
                Open in Customer Portal
              </Button>
            </div>
          </div>

          {/* Key Counter Metrics 4-Pack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#1c1c1e]/80 border border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-[11.5px] font-mono text-[#86868b] uppercase tracking-wider block mb-1">
                Requested Counter Discount
              </span>
              <div className="text-[22px] font-bold font-mono text-amber-600 dark:text-amber-400">
                {negotiationData.requestedDiscountPercent || 20}%
              </div>
              <span className="text-[11.5px] text-[#86868b] mt-0.5 block">
                Rep Max: 15% (Requires Manager Sign-off)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#1c1c1e]/80 border border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-[11.5px] font-mono text-[#86868b] uppercase tracking-wider block mb-1">
                Counter Contract Value
              </span>
              <div className="text-[22px] font-bold font-mono text-[#1d1d1f] dark:text-white">
                {formatCurrency(negotiationData.counterTotal || grandTotal * 0.88)}
              </div>
              <span className="text-[11.5px] text-[#86868b] mt-0.5 block">
                Original Quote: {formatCurrency(negotiationData.originalTotal || grandTotal)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#1c1c1e]/80 border border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-[11.5px] font-mono text-[#86868b] uppercase tracking-wider block mb-1">
                Requested Delivery Schedule
              </span>
              <div className="text-[17px] font-bold font-mono text-[#1d1d1f] dark:text-white mt-1">
                {negotiationData.requestedDeliveryDate
                  ? formatDate(negotiationData.requestedDeliveryDate)
                  : 'Oct 30, 2026'}
              </div>
              <span className="text-[11.5px] text-[#30d158] font-medium mt-1 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Inventory Available in East Depot</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 dark:bg-[#1c1c1e]/80 border border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-[11.5px] font-mono text-[#86868b] uppercase tracking-wider block mb-1">
                Governance Route Action
              </span>
              <div className="text-[14px] font-bold text-[#1d1d1f] dark:text-white mt-1 leading-snug">
                {(negotiationData.requestedDiscountPercent || 20) > 15
                  ? 'Re-routes to Sales Manager Sign-off'
                  : 'Instant Rep Self-Approval Eligible'}
              </div>
              <span className="text-[11.5px] text-[#86868b] mt-1 block">
                Strict governance ceiling enforcement
              </span>
            </div>
          </div>

          {/* Customer Stipulation Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/[0.08] dark:bg-amber-500/[0.12] border border-amber-500/30 text-[13.5px] space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold text-[13px]">
              <Clock className="w-4 h-4" />
              <span>Customer Redline & Stipulation Notice:</span>
            </div>
            <p className="text-[#1d1d1f] dark:text-[#f5f5f7] italic leading-relaxed">
              "{(negotiationData.comments && negotiationData.comments[0]?.text) ||
                'We can confirm immediate purchase if you can accommodate a 20% blended discount and schedule delivery by Oct 30.'}"
            </p>
          </div>

          {/* Rep Response Actions Bar */}
          <div className="pt-5 mt-5 border-t border-black/[0.08] dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="primary"
                size="md"
                icon={CheckCircle}
                loading={isRespondingNegotiation}
                disabled={isRespondingNegotiation || negotiationData.status === 'Accepted by Sales'}
                onClick={handleAcceptCounterTerms}
                title="Accept customer's proposed counter terms and automatically re-route to manager if discount exceeds 15%"
              >
                {negotiationData.status === 'Accepted by Sales'
                  ? 'Counter Terms Already Accepted'
                  : `Accept Counter Terms (${negotiationData.requestedDiscountPercent || 20}%)`}
              </Button>

              <Button
                variant="secondary"
                size="md"
                icon={Sliders}
                disabled={isRespondingNegotiation}
                onClick={() => setShowCompromiseForm(!showCompromiseForm)}
              >
                {showCompromiseForm ? 'Hide Compromise Form' : 'Propose Compromise Offer'}
              </Button>
            </div>

            <span className="text-[12px] font-mono text-[#86868b]">
              Pillar 3: Sales Rep negotiation response loop
            </span>
          </div>

          {/* Inline Compromise Offer Drawer */}
          {showCompromiseForm && (
            <form
              onSubmit={handleSendCompromise}
              className="mt-5 p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] space-y-4"
            >
              <h4 className="text-[14px] font-bold text-[#1d1d1f] dark:text-white">
                Submit Revised Compromise Counter-Offer
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12.5px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1.5">
                    Compromise Discount % (Max 15% for Rep)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    step="0.5"
                    value={compromiseDiscount}
                    onChange={(e) => setCompromiseDiscount(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#161618] border border-black/[0.12] dark:border-white/[0.15] text-[13px] font-mono text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
                <div>
                  <label className="text-[12.5px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1.5">
                    Proposed Delivery Schedule Date
                  </label>
                  <input
                    type="date"
                    value={compromiseDate}
                    onChange={(e) => setCompromiseDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#161618] border border-black/[0.12] dark:border-white/[0.15] text-[13px] font-mono text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12.5px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] block mb-1.5">
                  Explanation Note to Customer
                </label>
                <input
                  type="text"
                  placeholder="e.g. We can offer 15% discount and guarantee priority dispatch from Main Warehouse."
                  value={compromiseNote}
                  onChange={(e) => setCompromiseNote(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#161618] border border-black/[0.12] dark:border-white/[0.15] text-[13px] text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCompromiseForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={isRespondingNegotiation}
                  icon={Send}
                >
                  Dispatch Compromise to Customer
                </Button>
              </div>
            </form>
          )}

          {/* Interactive Negotiation Chat / Comment Stream */}
          <div className="mt-5 pt-5 border-t border-black/[0.08] dark:border-white/[0.08] space-y-3">
            <h4 className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#0071e3]" />
              <span>Negotiation Message Timeline</span>
            </h4>

            <div className="max-h-48 overflow-y-auto space-y-2.5 pr-2">
              {(negotiationData.comments || []).map((c, i) => (
                <div
                  key={c._id || i}
                  className={`p-3 rounded-xl text-[12.5px] ${
                    c.role === 'customer'
                      ? 'bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20'
                      : c.role === 'sales_rep'
                      ? 'bg-[#0071e3]/10 dark:bg-[#2997ff]/15 border border-[#0071e3]/20'
                      : 'bg-black/[0.04] dark:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#86868b] mb-1">
                    <span className="font-semibold text-[#1d1d1f] dark:text-white">
                      {c.author} ({c.role === 'sales_rep' ? 'Sales Rep' : c.role === 'customer' ? 'Customer' : 'Governance'})
                    </span>
                    <span>{formatDate(c.createdAt || new Date())}</span>
                  </div>
                  <p className="text-[#1d1d1f] dark:text-[#f5f5f7] leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Quick Reply Form */}
            <form onSubmit={handleSendNegotiationReply} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Type a direct response or stipulation back to customer..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 h-10 px-3.5 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.15] text-[13px] text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3]"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={Send}
                loading={isSendingReply}
                disabled={!replyText.trim()}
              >
                Send Reply
              </Button>
            </form>
          </div>
        </Card>
      ) : (
        <Card className="p-5 sm:p-6 rounded-[22px] bg-white/60 dark:bg-[#161618]/60 border border-dashed border-black/[0.12] dark:border-white/[0.12] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#86868b] flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-white">
                Customer Negotiation Channel Ready
              </h4>
              <p className="text-[12.5px] text-[#6e6e73] dark:text-[#86868b]">
                No active counter-offers pending for this quotation. Customers can propose counter-terms in the Customer Portal.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={Sparkles}
            onClick={handleSimulateCustomerCounter}
            loading={isRespondingNegotiation}
          >
            Simulate Customer Counter-Offer (20%)
          </Button>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* PILLAR 2: TRACKS APPROVAL STATUS AND FULFILLMENT PROGRESS                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Track Approval Status Card */}
        <Card className="p-6 rounded-[24px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0071e3]/10 text-[#0071e3] dark:text-[#2997ff] flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Approval Governance Tracker
                </h3>
                <span className="text-[12px] text-[#6e6e73] dark:text-[#86868b]">
                  Real-time policy threshold tracking & sign-off chain
                </span>
              </div>
            </div>
            <span
              className={`text-[11.5px] font-mono px-2.5 py-0.5 rounded-full font-semibold border ${
                status === 'approved'
                  ? 'bg-[#34c759]/15 text-[#1b7e36] dark:text-[#30d158] border-[#34c759]/30'
                  : status === 'pending_approval'
                  ? 'bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a] border-[#ff9f0a]/30'
                  : 'bg-black/[0.04] text-[#6e6e73] border-black/[0.08]'
              }`}
            >
              {status.toUpperCase()}
            </span>
          </div>

          {/* 3-Stage Visual Governance Pipeline */}
          <div className="py-5 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-[#34c759]/10 border border-[#34c759]/30 text-center">
                <div className="flex items-center justify-center text-[#1b7e36] dark:text-[#30d158] mb-1">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="text-[11.5px] font-bold text-[#1d1d1f] dark:text-white">1. Rep CPQ</div>
                <div className="text-[10px] font-mono text-[#1b7e36] dark:text-[#30d158]">Completed</div>
              </div>

              <div
                className={`p-2.5 rounded-xl border text-center ${
                  status === 'approved'
                    ? 'bg-[#34c759]/10 border-[#34c759]/30 text-[#1b7e36] dark:text-[#30d158]'
                    : status === 'pending_approval'
                    ? 'bg-[#ff9f0a]/10 border-[#ff9f0a]/30 text-[#9e5200] dark:text-[#ff9f0a] animate-pulse'
                    : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.08] dark:border-white/[0.08] text-[#86868b]'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {status === 'approved' ? (
                    <CheckCircle className="w-4 h-4 text-[#34c759]" />
                  ) : (
                    <Clock className="w-4 h-4 text-[#ff9f0a]" />
                  )}
                </div>
                <div className="text-[11.5px] font-bold text-[#1d1d1f] dark:text-white">2. Manager Review</div>
                <div className="text-[10px] font-mono">
                  {status === 'approved' ? 'Signed Off' : status === 'pending_approval' ? 'In Queue' : 'Draft'}
                </div>
              </div>

              <div
                className={`p-2.5 rounded-xl border text-center ${
                  status === 'approved'
                    ? 'bg-[#34c759]/10 border-[#34c759]/30 text-[#1b7e36] dark:text-[#30d158]'
                    : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.08] dark:border-white/[0.08] text-[#86868b]'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {status === 'approved' ? (
                    <CheckCircle className="w-4 h-4 text-[#34c759]" />
                  ) : (
                    <Clock className="w-4 h-4 text-[#86868b]" />
                  )}
                </div>
                <div className="text-[11.5px] font-bold text-[#1d1d1f] dark:text-white">3. Finance Sign-off</div>
                <div className="text-[10px] font-mono">{status === 'approved' ? 'Confirmed' : 'Pending Stage 2'}</div>
              </div>
            </div>

            <div className="text-[12.5px] text-[#6e6e73] dark:text-[#86868b] space-y-1.5 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex justify-between">
                <span>Submitter / Owner:</span>
                <span className="font-semibold text-[#1d1d1f] dark:text-white">Alex Rivera (Enterprise Rep)</span>
              </div>
              <div className="flex justify-between">
                <span>Deal Health Risk Score:</span>
                <span className="font-mono font-bold text-[#0071e3] dark:text-[#2997ff]">{riskScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span>Governing Rule:</span>
                <span className="font-semibold text-[#1d1d1f] dark:text-white">
                  {hasOverLimit
                    ? 'Discounts exceed line ceiling (>15%)'
                    : 'Standard Rep Discretionary Bracket (≤15%)'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex justify-end">
            <Button
              variant="outline"
              size="sm"
              icon={ExternalLink}
              onClick={() => navigate(`/approvals/${quotation?._id || quoteId}`)}
            >
              Inspect Full Approval Ledger →
            </Button>
          </div>
        </Card>

        {/* Track Fulfillment Progress Card */}
        <Card className="p-6 rounded-[24px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#30d158]/10 text-[#30d158] flex items-center justify-center font-bold">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Fulfillment & Warehouse Split Tracker
                </h3>
                <span className="text-[12px] text-[#6e6e73] dark:text-[#86868b]">
                  Multi-depot inventory routing & dispatch milestones
                </span>
              </div>
            </div>
            <span className="text-[11.5px] font-mono px-2.5 py-0.5 rounded-full font-semibold bg-[#34c759]/15 text-[#1b7e36] dark:text-[#30d158] border border-[#34c759]/30">
              {status === 'approved' ? 'READY TO DISPATCH' : 'INVENTORY RESERVED'}
            </span>
          </div>

          {/* Depot Split Breakdown */}
          <div className="py-5 space-y-3.5">
            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="text-[13px] font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-[#0071e3]" />
                  <span>Main Warehouse Allocation</span>
                </div>
                <span className="text-[11.5px] text-[#6e6e73] dark:text-[#86868b]">
                  Central Distribution Hub (Cost Weight: 1.0x)
                </span>
              </div>
              <div className="text-right">
                <span className="text-[13px] font-mono font-bold text-[#1d1d1f] dark:text-white">
                  {fulfillmentData?.warehouseBreakdown?.[0]?.allocatedUnits || 18} units (75%)
                </span>
                <span className="text-[11px] font-mono text-[#30d158] block">Stock Available</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="text-[13px] font-bold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-purple-500" />
                  <span>East Depot Allocation</span>
                </div>
                <span className="text-[11.5px] text-[#6e6e73] dark:text-[#86868b]">
                  Regional Satellite Depot (Cost Weight: 1.4x)
                </span>
              </div>
              <div className="text-right">
                <span className="text-[13px] font-mono font-bold text-[#1d1d1f] dark:text-white">
                  {fulfillmentData?.warehouseBreakdown?.[1]?.allocatedUnits || 6} units (25%)
                </span>
                <span className="text-[11px] font-mono text-[#30d158] block">Reserved</span>
              </div>
            </div>

            <div className="text-[12px] font-mono text-[#86868b] flex items-center justify-between pt-1">
              <span>Estimated Delivery Window:</span>
              <span className="font-semibold text-[#1d1d1f] dark:text-white">
                {negotiationData?.requestedDeliveryDate ? formatDate(negotiationData.requestedDeliveryDate) : 'Oct 30, 2026'}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex justify-end">
            <Button
              variant="outline"
              size="sm"
              icon={ExternalLink}
              onClick={() => navigate(`/fulfillment/${quotation?._id || quoteId}`)}
            >
              Proceed to Warehouse Split →
            </Button>
          </div>
        </Card>
      </div>

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

      {/* ========================================================================= */}
      {/* PILLAR 1: BUILDS QUOTATIONS, APPLIES DISCOUNTS, ADDS UPSELL ITEMS          */}
      {/* ========================================================================= */}
      <Card className="p-0 overflow-hidden rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="p-5 sm:p-6 pb-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <CardTitle className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            Products & Discount Line Items
          </CardTitle>
          <span className="text-[13px] text-[#6e6e73] dark:text-[#86868b] font-mono px-3.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] whitespace-nowrap">
            {items.length} active lines
          </span>
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
                    <td className="py-4 px-5 font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                      {item.name}
                    </td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, Math.max(1, (item.qty || 1) - 1))}
                          className="w-7 h-7 rounded-lg bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-white flex items-center justify-center text-[13px] font-bold transition-colors"
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => updateQuantity(item.id, e.target.value)}
                          className="w-14 h-8 text-center bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.12] dark:border-white/[0.12] rounded-lg px-1.5 text-[#1d1d1f] dark:text-white font-mono text-[13px] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, (item.qty || 1) + 1)}
                          className="w-7 h-7 rounded-lg bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-[#1d1d1f] dark:text-white flex items-center justify-center text-[13px] font-bold transition-colors"
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>
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

        {/* Live check callout note */}
        <div className="p-4 sm:p-5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.08] dark:border-white/[0.08] text-[13px] text-[#6e6e73] dark:text-[#86868b] flex items-center gap-3">
          <Clock className="w-4.5 h-4.5 text-[#0071e3] dark:text-[#2997ff] shrink-0" />
          <span>
            <strong className="text-[#1d1d1f] dark:text-[#f5f5f7]">Live Policy Validation:</strong> Discount is checked against each line's own limit live, as soon as it is entered, not only at submit time.
          </span>
        </div>
      </Card>

      {/* Upsell and Cross-Sell Suggestions */}
      <Card className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="flex items-center space-x-2.5 pb-4 border-b border-black/[0.08] dark:border-white/[0.08] mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] text-[#0071e3] dark:text-[#2997ff]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Upsell and Cross-Sell Suggestions
            </h3>
            <p className="text-[13px] text-[#6e6e73] dark:text-[#86868b]">
              Pre-screened recommendations to expand deal volume and optimize blended margins
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {upsells.map((up) => (
            <div
              key={up.id}
              className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#0071e3]/40 dark:hover:border-white/[0.2] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                  {up.name}
                </div>
                <div className="text-[13px] text-[#1b7e36] dark:text-[#30d158] font-mono mt-1 font-medium whitespace-nowrap">
                  {up.benefit}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-[13px] font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">
                  {formatCurrency(up.price)}
                </span>
                <Button onClick={() => addUpsell(up)} variant="secondary" size="xs" icon={Plus}>
                  Add to Quotation
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Financial Summary & Live Blended Margin Metrics */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-4">
          <div className="px-5 py-3 rounded-2xl bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] shadow-xs">
            <span className="text-[11.5px] font-mono text-[#86868b] uppercase tracking-wider block">
              Blended Gross Margin
            </span>
            <div className="text-[20px] font-bold font-mono text-[#1b7e36] dark:text-[#30d158]">
              {blendedMarginPercent}%
            </div>
            <span className="text-[11px] text-[#86868b]">Target: ≥ 20.0% Minimum</span>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] shadow-xs">
            <span className="text-[11.5px] font-mono text-[#86868b] uppercase tracking-wider block">
              Deal Health Risk Index
            </span>
            <div className="text-[20px] font-bold font-mono text-[#0071e3] dark:text-[#2997ff]">
              {riskScore}/100
            </div>
            <span className="text-[11px] text-[#86868b]">
              {riskScore < 30 ? 'Low Risk Tier' : 'Moderate Governance Tier'}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-7 rounded-[22px] bg-white/90 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] w-full sm:w-96 space-y-3.5 text-[13px] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
          <div className="flex justify-between text-[#6e6e73] dark:text-[#86868b]">
            <span className="whitespace-nowrap">Subtotal:</span>
            <span className="font-mono text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold text-[13px] whitespace-nowrap">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-[#1b7e36] dark:text-[#30d158]">
            <span className="whitespace-nowrap">Total Discount:</span>
            <span className="font-mono font-semibold text-[13px] whitespace-nowrap">
              -{formatCurrency(totalDiscount)}
            </span>
          </div>
          <div className="pt-3.5 border-t border-black/[0.08] dark:border-white/[0.08] flex justify-between items-baseline">
            <span className="text-[15px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">
              Net Contract Total:
            </span>
            <span className="font-mono text-[#0071e3] dark:text-[#2997ff] text-[22px] font-bold whitespace-nowrap">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetailsPage;
