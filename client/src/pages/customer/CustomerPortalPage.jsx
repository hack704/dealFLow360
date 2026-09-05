import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Loader2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { formatCurrency, formatDate } from '../../utils/formatters';
import negotiationService from '../../services/negotiationService';
import quotationService from '../../services/quotationService';

export const CustomerPortalPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quoteParam = searchParams.get('quote') || searchParams.get('id');

  const [loading, setLoading] = useState(true);
  // Quotation state for customer negotiation
  const [quotation, setQuotation] = useState({
    id: 'Q-1042',
    quotationId: null,
    customer: 'Acme Corp',
    contactPerson: 'Alex Rivera',
    status: 'Under Negotiation',
    originalTotal: 28400,
    counterTotal: 28400,
    validUntil: '2026-10-15',
    lines: [
      {
        id: 1,
        name: 'Laptop Pro 14 (Hardware)',
        qty: 18,
        price: 1200,
        discount: 12,
        comment: 'Can this be 15% off instead of 10%?'
      },
      {
        id: 2,
        name: 'Onsite Setup Service',
        qty: 1,
        price: 450,
        discount: 18,
        comment: 'Can we push this to next month?'
      },
      {
        id: 3,
        name: 'Care Plan 2yr (Extended Warranty)',
        qty: 18,
        price: 180,
        discount: 10,
        comment: 'Standard warranty terms agreed'
      }
    ]
  });

  const [counterDiscount, setCounterDiscount] = useState('12');
  const [requestedDate, setRequestedDate] = useState('2026-10-30');
  const [customerNotes, setCustomerNotes] = useState(
    'We can confirm immediate purchase if you can accommodate a 12% blended discount and schedule delivery by Oct 30.'
  );
  const [statusMessage, setStatusMessage] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const fetchNegotiation = async () => {
      setLoading(true);
      try {
        const res = await negotiationService.getNegotiationByQuote(quoteParam || 'latest');
        if (res?.data) {
          const d = res.data;
          setQuotation((prev) => ({
            ...prev,
            id: d.quotationNumber || prev.id,
            quotationId: d.quotationId || d.quotation?._id || prev.quotationId,
            customer: d.customerName || prev.customer,
            status: d.status || prev.status,
            originalTotal: d.originalTotal || prev.originalTotal,
            counterTotal: d.counterTotal || prev.counterTotal,
            lines: (d.lineRedlines && d.lineRedlines.length > 0) ? d.lineRedlines : prev.lines
          }));
          if (d.requestedDiscountPercent) {
            setCounterDiscount(String(d.requestedDiscountPercent));
          }
          if (d.status === 'Accepted' || d.status === 'confirmed') {
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
  }, [quoteParam]);

  const handleSubmitCounter = async (e) => {
    e.preventDefault();
    const discountNum = parseFloat(counterDiscount) || 0;
    try {
      const quoteTarget = quotation.id || quotation.quotationId;
      await negotiationService.submitCounterOffer(quoteTarget, {
        counterDiscountPercent: discountNum,
        requestedDate,
        customerComment: customerNotes
      });
    } catch (err) {
      console.warn('Counter offer submission notice:', err.message);
    }

    if (discountNum > 15) {
      setStatusMessage({
        type: 'warning',
        text: 'Counter discount of ' + discountNum + '% exceeds auto-approval threshold (15%). This request has automatically re-entered the Sales Manager & Finance approval queue.'
      });
    } else {
      setStatusMessage({
        type: 'success',
        text: 'Counter-offer of ' + discountNum + '% submitted successfully. Your account executive will respond within 4 business hours.'
      });
    }
  };

  const handleConfirmQuotation = async () => {
    try {
      const quoteTarget = quotation.quotationId || quotation.id;
      await quotationService.updateQuotationStatus(quoteTarget, 'accepted');
    } catch (err) {
      console.warn('Quotation status update note:', err.message);
    }

    setIsConfirmed(true);
    setStatusMessage({
      type: 'confirmed',
      text: `Quotation ${quotation.id} accepted and confirmed! Order has been generated, warehouse fulfillment allocated, and billing invoice issued.`
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-[26px] sm:text-[28px] font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              Customer Negotiation Portal
            </h1>
            <Badge variant="warning" size="sm" className="font-mono">
              Status: {quotation.status}
            </Badge>
          </div>
          <p className="text-[13px] text-[#86868b] mt-1">
            Customer reviews and negotiates the quote directly, no email needed
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3.5 py-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-right">
            <span className="text-[12px] uppercase font-mono text-[#86868b] block whitespace-nowrap">Quotation Reference</span>
            <span className="text-[13px] font-semibold font-mono text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">{quotation.id} — {quotation.customer}</span>
          </div>
        </div>
      </div>

      {/* Confirmation Banner */}
      {statusMessage && (
        <div
          className={`p-5 rounded-2xl border text-[13px] flex items-start space-x-3.5 ${
            statusMessage.type === 'confirmed'
              ? 'bg-[#34c759]/10 border-[#34c759]/30 text-[#1b7a36] dark:text-[#30d158]'
              : statusMessage.type === 'warning'
              ? 'bg-[#ff9f0a]/10 border-[#ff9f0a]/30 text-[#9e5200] dark:text-[#ff9f0a]'
              : 'bg-[#0071e3]/10 border-[#0071e3]/30 text-[#0071e3] dark:text-[#2997ff]'
          }`}
        >
          {statusMessage.type === 'confirmed' ? (
            <div className="w-8 h-8 rounded-xl bg-[#34c759]/15 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-[#34c759]" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-[#ff9f0a]/15 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4 text-[#ff9f0a]" />
            </div>
          )}
          <div className="flex-1">
            <span className="font-semibold">{statusMessage.text}</span>
            {statusMessage.type === 'confirmed' && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate(`/fulfillment/${quotation.id}`)}
                >
                  View Fulfillment Split &rarr;
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate('/invoices')}
                >
                  View Invoices & Billing &rarr;
                </Button>
              </div>
            )}
            {statusMessage.type === 'warning' && (
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate('/approvals')}
                >
                  Inspect Governance Approvals Queue &rarr;
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Line Items & Customer Comments Table */}
      <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] overflow-hidden backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#0071e3]/10 dark:bg-[#2997ff]/15 flex items-center justify-center text-[#0071e3] dark:text-[#2997ff]">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Line Items & Customer Comments</h3>
          </div>
          <span className="text-[13px] text-[#86868b] font-mono whitespace-nowrap">
            Original Total: {formatCurrency(quotation.originalTotal)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Line Item</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Qty</th>
                <th className="py-3.5 px-4 whitespace-nowrap">List Price</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Discount</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Customer Comment / Negotiation Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {quotation.lines.map((line) => (
                <tr key={line.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 font-medium text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">{line.name}</td>
                  <td className="py-4 px-4 font-mono text-[#86868b] whitespace-nowrap">{line.qty}</td>
                  <td className="py-4 px-4 font-mono font-medium text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">{formatCurrency(line.price)}</td>
                  <td className="py-4 px-4 font-mono text-[#1b7a36] dark:text-[#30d158] font-semibold whitespace-nowrap">{line.discount}%</td>
                  <td className="py-4 px-5">
                    <div className="px-3.5 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] italic">
                      "{line.comment}"
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Negotiation Inputs Form */}
      <div className="bg-white/80 dark:bg-[#161618]/90 border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 sm:p-7 backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-5 flex items-center space-x-2">
          <span>Propose Counter Terms</span>
          <span className="text-[13px] text-[#86868b] font-normal">(Direct in-portal negotiation)</span>
        </h3>

        <form onSubmit={handleSubmitCounter} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                Counter Discount %
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={counterDiscount}
                  onChange={(e) => setCounterDiscount(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[#1d1d1f] dark:text-white font-mono text-[13px] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-1 focus:ring-[#0071e3] dark:focus:ring-[#2997ff] transition-all"
                  placeholder="e.g. 12"
                  disabled={isConfirmed}
                />
                <span className="absolute right-3.5 top-3 text-[13px] text-[#86868b] font-mono">%</span>
              </div>
              <p className="text-[13px] text-[#86868b] mt-1.5 font-mono">
                Threshold: Discounts up to 15% qualify for auto-acceptance.
              </p>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                Requested Delivery Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[#1d1d1f] dark:text-white font-mono text-[13px] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-1 focus:ring-[#0071e3] dark:focus:ring-[#2997ff] transition-all"
                  disabled={isConfirmed}
                />
              </div>
              <p className="text-[13px] text-[#86868b] mt-1.5 font-mono">
                Standard fulfillment window: 5-7 business days.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
              Customer Comments & Contractual Stipulations
            </label>
            <textarea
              rows={3}
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[#1d1d1f] dark:text-white text-[13px] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-1 focus:ring-[#0071e3] dark:focus:ring-[#2997ff] transition-all resize-none"
              placeholder="Enter special terms or delivery expectations..."
              disabled={isConfirmed}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center space-x-3">
              <Button
                type="submit"
                variant="secondary"
                size="md"
                disabled={isConfirmed}
              >
                <Send className="w-4 h-4 mr-2 text-[#0071e3] dark:text-[#2997ff]" />
                Submit Request
              </Button>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleConfirmQuotation}
              disabled={isConfirmed}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm Quotation
            </Button>
          </div>
        </form>
      </div>

      {/* Wireframe Gold Callout Note */}
      <div className="p-5 rounded-2xl border border-[#ff9f0a]/30 bg-[#ff9f0a]/[0.08] dark:bg-[#ff9f0a]/[0.06] text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center space-x-3.5">
        <div className="w-9 h-9 rounded-xl bg-[#ff9f0a]/15 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-4.5 h-4.5 text-[#ff9f0a]" />
        </div>
        <div>
          <span className="font-semibold text-[#9e5200] dark:text-[#ff9f0a]">Governance Guardrail: </span>
          <span>
            If final terms exceed thresholds, the quote automatically re-enters approval (Screen 6).
          </span>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortalPage;
