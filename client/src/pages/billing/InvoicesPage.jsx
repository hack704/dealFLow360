import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  Calendar,
  ArrowUpRight,
  Search,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  PlusCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  PackageCheck
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import billingService from '../../services/billingService';
import quotationService from '../../services/quotationService';

export const InvoicesPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all' | 'unpaid' | 'overdue' | 'paid' | 'credit_note'
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConditionsGuide, setShowConditionsGuide] = useState(false);

  // Generate billing modal state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [quotations, setQuotations] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [generatingForId, setGeneratingForId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const defaultMockInvoices = [
    {
      id: 'INV-1042',
      quotationNumber: 'Q-1042',
      customer: 'Acme Corp',
      amount: 2730,
      status: 'Unpaid',
      dueDate: 'Sep 10',
      type: 'One-Time Order',
      createdDate: 'Aug 26'
    },
    {
      id: 'INV-1043',
      quotationNumber: 'QT-DEMO-2026',
      customer: 'Acme Corp',
      amount: 46,
      status: 'Paid',
      dueDate: 'Sep 15',
      type: 'Recurring Monthly',
      createdDate: 'Aug 26'
    },
    {
      id: 'INV-1038',
      quotationNumber: 'QT-NOVA-8821',
      customer: 'Nova Retail',
      amount: 9750,
      status: 'Paid',
      dueDate: 'Aug 30',
      type: 'One-Time Order',
      createdDate: 'Aug 10'
    },
    {
      id: 'INV-1035',
      quotationNumber: 'QT-BETA-4412',
      customer: 'Beta Industries',
      amount: 14200,
      status: 'Unpaid',
      dueDate: 'Sep 28',
      type: 'Enterprise Milestone',
      createdDate: 'Aug 22'
    },
    {
      id: 'INV-1031',
      quotationNumber: 'QT-STARK-9021',
      customer: 'Stark Dynamics',
      amount: 48000,
      status: 'Paid',
      dueDate: 'Aug 15',
      type: 'One-Time Order',
      createdDate: 'Jul 28'
    },
    {
      id: 'INV-1029',
      quotationNumber: 'QT-ZENITH-1192',
      customer: 'Zenith Co',
      amount: 8350,
      status: 'Overdue',
      dueDate: 'Aug 02',
      type: 'Recurring SLA',
      createdDate: 'Jul 10'
    },
    {
      id: 'CN-8841',
      quotationNumber: 'Q-1042',
      customer: 'Acme Corp',
      amount: -125,
      status: 'Paid',
      dueDate: 'Aug 28',
      type: 'Credit Note',
      createdDate: 'Aug 28'
    }
  ];

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await billingService.getInvoices();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setInvoices(
          res.data.map((inv) => ({
            id: inv.invoiceNumber || inv._id,
            _id: inv._id,
            quotationNumber: inv.quotationNumber || inv.quotation?.quotationNumber || '',
            quotationId: inv.quotation?._id || (typeof inv.quotation === 'string' ? inv.quotation : null),
            customer: inv.customerName || (inv.customer && inv.customer.name) || 'Customer',
            amount: inv.grandTotal || inv.subtotal || 0,
            status: inv.status || 'Unpaid',
            dueDate: inv.dueDate ? formatDate(inv.dueDate) : 'Net 30',
            type: inv.type || 'One-Time Order',
            createdDate: inv.createdAt ? formatDate(inv.createdAt) : 'Today'
          }))
        );
      } else {
        setInvoices(defaultMockInvoices);
      }
    } catch (err) {
      console.warn('Fallback invoices:', err.message);
      setInvoices(defaultMockInvoices);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const openGenerateModal = async () => {
    setIsGenerateModalOpen(true);
    setLoadingQuotes(true);
    setActionNotice(null);
    try {
      const res = await quotationService.getQuotations();
      if (res?.data && Array.isArray(res.data)) {
        setQuotations(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch quotations for billing:', err.message);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const handleGenerateBilling = async (quote) => {
    if (quote.status !== 'approved' && quote.status !== 'confirmed' && quote.status !== 'accepted') {
      setActionNotice({
        type: 'error',
        text: `Condition Unmet: Quotation ${quote.quotationNumber} is in '${quote.status}' state. Only approved or confirmed quotations can generate billing documents.`
      });
      return;
    }

    setGeneratingForId(quote._id);
    setActionNotice(null);
    try {
      const res = await billingService.generateBilling(quote._id);
      const generatedInvoice = res?.data?.invoice;
      const generatedSub = res?.data?.subscription;
      const invNum = generatedInvoice?.invoiceNumber || (generatedInvoice?._id ? `INV-${generatedInvoice._id.slice(-4)}` : 'Created');
      const subNum = generatedSub?.subscriptionNumber;

      setActionNotice({
        type: 'success',
        text: `Billing generated successfully for ${quote.quotationNumber}! Created Invoice ${invNum}${subNum ? ` and Subscription ${subNum}` : ''}. Now visible in the ledger.`,
        invoiceId: generatedInvoice?.invoiceNumber || (generatedInvoice?._id ? generatedInvoice._id : null),
        subId: subNum
      });
      await fetchInvoices();
    } catch (err) {
      setActionNotice({
        type: 'error',
        text: `Billing generation notice: ${err.response?.data?.message || err.message}`
      });
    } finally {
      setGeneratingForId(null);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const sLower = (inv.status || '').toLowerCase();
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'unpaid'
        ? (sLower === 'unpaid' || sLower === 'due')
        : filter === 'overdue'
        ? sLower === 'overdue'
        : filter === 'paid'
        ? sLower === 'paid'
        : filter === 'credit_note'
        ? (inv.type === 'Credit Note' || sLower === 'refunded')
        : true;

    const qLower = (inv.quotationNumber || '').toLowerCase();
    const matchesSearch =
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qLower.includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unpaidCount = invoices.filter((i) => {
    const s = (i.status || '').toLowerCase();
    return s === 'unpaid' || s === 'due';
  }).length;
  const overdueCount = invoices.filter((i) => (i.status || '').toLowerCase() === 'overdue').length;
  const paidCount = invoices.filter((i) => (i.status || '').toLowerCase() === 'paid').length;
  const creditCount = invoices.filter((i) => i.type === 'Credit Note' || (i.status || '').toLowerCase() === 'refunded').length;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] sm:text-[28px] font-bold tracking-[-0.025em] text-[#1d1d1f] dark:text-[#f5f5f7]">Invoices & Billing</h1>
            <button
              onClick={() => setShowConditionsGuide(!showConditionsGuide)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#0071e3]/10 dark:bg-[#2997ff]/15 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/25 hover:bg-[#0071e3]/20 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Billing Conditions Guide</span>
              {showConditionsGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
          <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b] mt-1">
            Reconcile one-time orders, recurring billing schedules, credit notes, and customer payments
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchInvoices}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={openGenerateModal}
          >
            Generate from Quote
          </Button>
        </div>
      </div>

      {/* Conditions Guide Callout Accordion */}
      {showConditionsGuide && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0071e3]/5 to-[#2997ff]/10 dark:from-[#2997ff]/10 dark:to-transparent border border-[#0071e3]/20 dark:border-[#2997ff]/25 space-y-3">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-[#0071e3] dark:text-[#2997ff]">
            <Sparkles className="w-4 h-4" />
            <span>Why isn't a deal showing in Invoices? (4 System Conditions)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
            <div className="p-3 rounded-xl bg-white/70 dark:bg-[#1c1c1e]/80 border border-black/[0.06] dark:border-white/[0.08]">
              <div className="font-semibold flex items-center gap-1.5 text-[#1d1d1f] dark:text-white">
                <span className="w-5 h-5 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-[11px] font-bold">1</span>
                Quotation Approval Gate
              </div>
              <p className="text-[#6e6e73] dark:text-[#86868b] mt-1 text-[12px] leading-relaxed">
                Quotations in <strong>draft</strong> or <strong>pending_approval</strong> cannot generate invoices. The quotation must first be approved by governance or confirmed by the customer.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/70 dark:bg-[#1c1c1e]/80 border border-black/[0.06] dark:border-white/[0.08]">
              <div className="font-semibold flex items-center gap-1.5 text-[#1d1d1f] dark:text-white">
                <span className="w-5 h-5 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-[11px] font-bold">2</span>
                Order Bifurcation (One-Time vs Recurring)
              </div>
              <p className="text-[#6e6e73] dark:text-[#86868b] mt-1 text-[12px] leading-relaxed">
                Software licenses & recurring services go to <strong>Subscriptions</strong> (<code>/subscriptions</code>), while one-time hardware & setup go to <strong>Invoices</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/70 dark:bg-[#1c1c1e]/80 border border-black/[0.06] dark:border-white/[0.08]">
              <div className="font-semibold flex items-center gap-1.5 text-[#1d1d1f] dark:text-white">
                <span className="w-5 h-5 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-[11px] font-bold">3</span>
                Fulfillment Split Confirmation
              </div>
              <p className="text-[#6e6e73] dark:text-[#86868b] mt-1 text-[12px] leading-relaxed">
                For physical products requiring delivery, confirm depot allocation in <strong>Fulfillment</strong> (<code>/fulfillment</code>). Confirming dispatch auto-creates the final invoice.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/70 dark:bg-[#1c1c1e]/80 border border-black/[0.06] dark:border-white/[0.08]">
              <div className="font-semibold flex items-center gap-1.5 text-[#1d1d1f] dark:text-white">
                <span className="w-5 h-5 rounded-full bg-[#0071e3] text-white flex items-center justify-center text-[11px] font-bold">4</span>
                Status Filter Checks
              </div>
              <p className="text-[#6e6e73] dark:text-[#86868b] mt-1 text-[12px] leading-relaxed">
                Check your active filter tab. An invoice marked <strong>Overdue</strong> or a <strong>Credit Note</strong> will not show up under "Paid". Click <strong>All</strong> to see everything.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Pills & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#86868b] absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoice number, customer account..."
            className="w-full h-11 pl-11 pr-4 rounded-full bg-white dark:bg-[#1c1c1e] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-2 focus:ring-[#0071e3]/20 transition-all shadow-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/[0.04] dark:bg-white/[0.04] p-1 rounded-full border border-black/[0.06] dark:border-white/[0.08]">
          <button
            onClick={() => setFilter('all')}
            className={`h-8 px-3.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-[#0071e3]/15 dark:bg-[#2997ff]/20 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/30 dark:border-[#2997ff]/30 font-semibold shadow-sm'
                : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white border border-transparent'
            }`}
          >
            All · {invoices.length}
          </button>
          <button
            onClick={() => setFilter('unpaid')}
            className={`h-8 px-3.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap ${
              filter === 'unpaid'
                ? 'bg-[#ff9f0a]/20 text-[#9e5200] dark:text-[#ff9f0a] border border-[#ff9f0a]/30 font-semibold shadow-sm'
                : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white border border-transparent'
            }`}
          >
            {unpaidCount} Due / Unpaid
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`h-8 px-3.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap ${
              filter === 'overdue'
                ? 'bg-[#ff453a]/20 text-[#c91d12] dark:text-[#ff453a] border border-[#ff453a]/30 font-semibold shadow-sm'
                : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white border border-transparent'
            }`}
          >
            {overdueCount} Overdue
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`h-8 px-3.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap ${
              filter === 'paid'
                ? 'bg-[#34c759]/20 text-[#1b7a36] dark:text-[#30d158] border border-[#34c759]/30 font-semibold shadow-sm'
                : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white border border-transparent'
            }`}
          >
            {paidCount} Paid
          </button>
          {creditCount > 0 && (
            <button
              onClick={() => setFilter('credit_note')}
              className={`h-8 px-3.5 rounded-full text-[12px] font-medium transition-all whitespace-nowrap ${
                filter === 'credit_note'
                  ? 'bg-[#5e5ce6]/20 text-[#5e5ce6] border border-[#5e5ce6]/30 font-semibold shadow-sm'
                  : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white border border-transparent'
              }`}
            >
              {creditCount} Credit Notes
            </button>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white/80 dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] overflow-hidden backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#6e6e73] dark:text-[#f5f5f7]">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Invoice #</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Customer</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Billing Category</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Due Date</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Amount</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                  className="hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-5 font-mono font-semibold text-[#1d1d1f] dark:text-white group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Receipt className="w-4 h-4 text-[#86868b] group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] shrink-0" />
                      <span>{inv.id}</span>
                    </div>
                    {inv.quotationNumber && (
                      <div className="text-[11px] font-mono text-[#86868b] mt-1 flex items-center gap-1.5 pl-6">
                        <span className="px-1.5 py-0.5 rounded bg-black/[0.04] dark:bg-white/[0.08] text-[#0071e3] dark:text-[#2997ff] font-semibold text-[10px]">
                          QUOTE
                        </span>
                        <span>{inv.quotationNumber}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-5 font-medium text-[#1d1d1f] dark:text-white whitespace-nowrap">{inv.customer}</td>
                  <td className="py-4 px-4 text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">{inv.type}</td>
                  <td className="py-4 px-4 font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5 text-[#86868b] shrink-0" />
                      <span>{inv.dueDate}</span>
                    </span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <Badge
                      variant={inv.status === 'Paid' ? 'success' : 'warning'}
                      size="xs"
                    >
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-5 text-right font-mono font-bold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                    {formatCurrency(inv.amount)}
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span className="text-[13px] text-[#0071e3] dark:text-[#2997ff] group-hover:underline flex items-center justify-center gap-1 font-medium whitespace-nowrap">
                      Reconcile <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wireframe Gold Callout Note */}
      <div className="p-4 sm:p-5 rounded-2xl border border-black/[0.08] dark:border-white/[0.12] bg-black/[0.02] dark:bg-white/[0.02] text-[13px] text-[#6e6e73] dark:text-[#86868b] flex items-center space-x-2.5">
        <span className="w-2 h-2 rounded-full bg-[#0071e3] dark:bg-[#2997ff]"></span>
        <span>
          Click an invoice row to open its full payment, proration, and reconciliation ledger detail.
        </span>
      </div>

      {/* Modal: Generate Billing from Quotations */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Invoices from Quotation"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-[13px]">
          <p className="text-[#6e6e73] dark:text-[#86868b]">
            Select an approved quotation to trigger automatic billing bifurcation (one-time hardware/service invoices and recurring subscriptions).
          </p>

          {actionNotice && (
            <div
              className={`p-3.5 rounded-xl text-[13px] flex items-start gap-2.5 ${
                actionNotice.type === 'success'
                  ? 'bg-[#34c759]/15 text-[#1b7a36] dark:text-[#30d158] border border-[#34c759]/30'
                  : 'bg-[#ff453a]/15 text-[#c91d12] dark:text-[#ff453a] border border-[#ff453a]/30'
              }`}
            >
              {actionNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <span className="block font-medium">{actionNotice.text}</span>
                {actionNotice.invoiceId && (
                  <div>
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => {
                        setIsGenerateModalOpen(false);
                        navigate(`/invoices/${actionNotice.invoiceId}`);
                      }}
                      className="inline-flex items-center gap-1.5"
                    >
                      <span>Open {actionNotice.invoiceId} in Ledger</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {loadingQuotes ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#0071e3] dark:text-[#2997ff]" />
              <span className="text-[#86868b]">Loading quotations...</span>
            </div>
          ) : quotations.length === 0 ? (
            <div className="py-6 text-center text-[#86868b]">
              No quotations available. Create a quotation in CPQ Builder first.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-black/[0.06] dark:divide-white/[0.08] border border-black/[0.08] dark:border-white/[0.08] rounded-xl">
              {quotations.map((q) => {
                const isReady =
                  q.status === 'approved' || q.status === 'confirmed' || q.status === 'accepted';
                const isGenerating = generatingForId === q._id;

                const existingInv = invoices.find(
                  (inv) =>
                    (inv.quotationNumber && inv.quotationNumber === q.quotationNumber) ||
                    (inv.quotationId && (inv.quotationId === q._id || inv.quotationId === q.quotationNumber))
                );

                return (
                  <div
                    key={q._id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2">
                        <span>{q.quotationNumber}</span>
                        <span className="text-[12px] font-normal text-[#86868b]">· {q.customerName || 'Customer'}</span>
                      </div>
                      <div className="text-[12px] text-[#6e6e73] dark:text-[#86868b] flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {formatCurrency(q.grandTotal)}
                        </span>
                        <span>•</span>
                        <Badge
                          variant={
                            isReady
                              ? 'success'
                              : q.status === 'pending_approval'
                              ? 'warning'
                              : 'secondary'
                          }
                          size="xs"
                        >
                          {q.status}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      {existingInv ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#34c759]/15 text-[#1b7a36] dark:text-[#30d158] border border-[#34c759]/30 whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3" />
                            Invoiced: {existingInv.id}
                          </span>
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => {
                              setIsGenerateModalOpen(false);
                              navigate(`/invoices/${existingInv.id}`);
                            }}
                          >
                            Open
                          </Button>
                        </div>
                      ) : isReady ? (
                        <Button
                          variant="primary"
                          size="xs"
                          disabled={isGenerating}
                          onClick={() => handleGenerateBilling(q)}
                        >
                          {isGenerating ? (
                            <span className="flex items-center gap-1.5">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Generating...
                            </span>
                          ) : (
                            'Generate Invoices'
                          )}
                        </Button>
                      ) : (
                        <span className="text-[11px] text-[#86868b] italic">
                          Approval required
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setIsGenerateModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InvoicesPage;
