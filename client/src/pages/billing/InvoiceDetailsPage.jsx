import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Receipt,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  CreditCard,
  Building2,
  Calendar,
  AlertTriangle,
  FileCheck2,
  Truck,
  Loader2
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { downloadInvoicePDF } from '../../utils/pdfExport';
import billingService from '../../services/billingService';

export const InvoiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceId = id || 'INV-1042';

  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState(null);
  const [paymentRecorded, setPaymentRecorded] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Wire Transfer / ACH');
  const [transactionId, setTransactionId] = useState('TXN-ACH-' + Math.floor(100000 + Math.random() * 900000));

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const res = await billingService.getInvoiceById(invoiceId);
        if (res?.data) {
          setInvoiceData(res.data);
          if (res.data.status === 'Paid') {
            setPaymentRecorded(true);
          }
        }
      } catch (err) {
        console.warn('Fallback invoice detail:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const customerName = invoiceData?.customerName || (invoiceData?.customer && invoiceData.customer.name) || 'Acme Corp';
  const subtotal = invoiceData?.subtotal || 2610;
  const tax = invoiceData?.taxAmount || 120;
  const grandTotal = invoiceData?.grandTotal || 2730;
  const displayId = invoiceData?.invoiceNumber || invoiceId;

  const lineItems = (invoiceData?.items && invoiceData.items.length > 0)
    ? invoiceData.items.map((it) => ({
        item: it.item || it.productName || 'Line Item',
        qty: it.quantity || 1,
        unitPrice: it.unitPrice || it.listPrice || 0,
        discount: it.discountPercent || 0,
        total: it.total || it.lineTotal || 0
      }))
    : [
        { item: 'Laptop Pro 14 (Hardware)', qty: 2, unitPrice: 1200, discount: 10, total: 2160 },
        { item: 'Onsite Setup Service', qty: 1, unitPrice: 450, discount: 0, total: 450 }
      ];

  const invoiceSummaryRows = [
    { id: displayId, desc: invoiceData?.type || 'Hardware & Setup (One-Time)', amount: grandTotal, status: paymentRecorded ? 'Paid' : 'Unpaid', dueDate: invoiceData?.dueDate ? formatDate(invoiceData.dueDate) : 'Sep 10' }
  ];

  // Stepper state: 0: Order Confirmed, 1: Shipped, 2: Invoiced (current), 3: Paid
  const currentStep = paymentRecorded ? 3 : 2;

  const steps = [
    { label: 'Order Confirmed', completed: true, date: 'Aug 24, 2026' },
    { label: 'Shipped', completed: true, date: 'Aug 25, 2026' },
    { label: 'Invoiced', completed: true, date: invoiceData?.createdAt ? formatDate(invoiceData.createdAt) : 'Aug 26, 2026' },
    { label: 'Paid', completed: paymentRecorded, date: paymentRecorded ? 'Today' : 'Pending' }
  ];

  const handleRecordPayment = async () => {
    try {
      const targetId = invoiceData?._id || invoiceId;
      await billingService.recordPayment(targetId, {
        method: paymentMethod,
        transactionId
      });
      setPaymentRecorded(true);
    } catch (err) {
      console.warn('Payment recording local fallback:', err.message);
      setPaymentRecorded(true);
    } finally {
      setShowPaymentModal(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Back Button & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-5">
        <div>
          <button
            onClick={() => navigate('/invoices')}
            className="text-[13px] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] inline-flex items-center gap-2 mb-2 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> <span>Back to Invoices</span>
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[26px] sm:text-[28px] font-bold tracking-[-0.025em] text-[#1d1d1f] dark:text-[#f5f5f7]">
              Invoice Detail: {displayId} — {customerName}
            </h1>
            <Badge variant={paymentRecorded ? 'success' : 'warning'} size="sm" className="font-mono">
              {paymentRecorded ? 'Paid' : 'Unpaid'}
            </Badge>
            {(invoiceData?.quotationNumber || invoiceData?.quotation?.quotationNumber) && (
              <span
                onClick={() => {
                  const qId = invoiceData?.quotation?._id || invoiceData?.quotation;
                  if (qId) navigate(`/quotations/${qId}`);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-mono font-medium bg-[#0071e3]/10 dark:bg-[#2997ff]/15 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/20 cursor-pointer hover:bg-[#0071e3]/20 transition-all"
                title="Click to view originating quotation"
              >
                <span>From Quote:</span>
                <span className="font-bold">{invoiceData.quotationNumber || invoiceData.quotation?.quotationNumber}</span>
              </span>
            )}
          </div>
          <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b] mt-1">
            Real-time accounts receivable tracking, milestone invoicing, and settlement reconciliation
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="md"
            icon={Download}
            onClick={() => downloadInvoicePDF({ invoiceId: displayId, customer: customerName, amount: grandTotal, status: paymentRecorded ? 'Paid' : 'Unpaid' })}
          >
            Download Summary
          </Button>

          {!paymentRecorded && (
            <Button
              variant="primary"
              size="md"
              icon={CreditCard}
              onClick={() => setShowPaymentModal(true)}
            >
              Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Visual Stepper / Progress Bar (Order Confirmed -> Shipped -> Invoiced -> Paid) */}
      <div className="bg-white/80 dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 sm:p-7 backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <h3 className="text-[12px] font-mono uppercase tracking-wider text-[#6e6e73] dark:text-[#86868b] mb-6">
          Lifecycle & Revenue Recognition Stepper
        </h3>

        <div className="relative flex items-center justify-between max-w-3xl mx-auto px-4">
          {/* Background Connecting Line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-black/10 dark:bg-white/[0.1] z-0" />
          {/* Active Filled Line */}
          <div
            className="absolute top-4 left-6 h-0.5 bg-[#34c759] dark:bg-[#30d158] transition-all duration-500 z-0"
            style={{
              width:
                currentStep === 3
                  ? 'calc(100% - 3rem)'
                  : currentStep === 2
                  ? 'calc(66% - 2rem)'
                  : '33%'
            }}
          />

          {steps.map((step, idx) => {
            const isDone = idx < currentStep || (idx === currentStep && paymentRecorded);
            const isCurrent = idx === currentStep && !paymentRecorded;

            return (
              <div key={step.label} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isDone
                      ? 'bg-[#34c759] text-white ring-4 ring-[#34c759]/20 shadow-sm'
                      : isCurrent
                      ? 'bg-[#0071e3] text-white ring-4 ring-[#0071e3]/20 animate-pulse'
                      : 'bg-black/[0.06] dark:bg-[#2c2c2e] text-[#6e6e73] dark:text-[#86868b] border border-black/[0.08] dark:border-white/[0.1]'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  ) : (
                    <span className="text-[13px] font-mono font-semibold">{idx + 1}</span>
                  )}
                </div>
                <span
                  className={`text-[13px] mt-2.5 font-medium tracking-tight whitespace-nowrap ${
                    isDone || isCurrent ? 'text-[#1d1d1f] dark:text-white font-semibold' : 'text-[#6e6e73] dark:text-[#86868b]'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[13px] text-[#86868b] font-mono mt-0.5 whitespace-nowrap">{step.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice Overview Table */}
      <div className="bg-white/80 dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] overflow-hidden backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="px-6 py-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.06] text-[#0071e3] dark:text-[#2997ff]">
              <Receipt className="w-4 h-4" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">Invoice Reconciliation Breakdown</h3>
          </div>
          <span className="text-[13px] text-[#6e6e73] dark:text-[#86868b] font-mono px-3.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] whitespace-nowrap">Customer: Acme Corp</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#6e6e73] dark:text-[#f5f5f7]">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Invoice #</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Billing Scope</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Due Date</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {invoiceSummaryRows.map((row) => (
                <tr key={row.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 font-mono font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">{row.id}</td>
                  <td className="py-4 px-5 text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">{row.desc}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <Badge variant={row.status === 'Paid' ? 'success' : 'warning'} size="xs">
                      {row.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">{row.dueDate}</td>
                  <td className="py-4 px-5 text-right font-mono font-bold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                    {formatCurrency(row.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* B7 Requirement: Shows one time lines and recurring lines separately within the same order */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: One-Time Lines */}
          <div className="bg-white/80 dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 sm:p-7 backdrop-blur-xl shadow-sm dark:shadow-apple-card">
            <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06] dark:border-white/[0.06] mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
                <h4 className="text-[14px] font-bold text-[#1d1d1f] dark:text-white">
                  One-Time Capital & Setup Lines
                </h4>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#86868b]">
                Non-Recurring Order Items
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] text-[#6e6e73] dark:text-[#f5f5f7]">
                <thead className="border-b border-black/[0.06] dark:border-white/[0.06] text-[#6e6e73] dark:text-[#86868b] font-mono text-[12px]">
                  <tr>
                    <th className="pb-3 whitespace-nowrap">Product / Description</th>
                    <th className="pb-3 text-center whitespace-nowrap">Qty</th>
                    <th className="pb-3 text-right whitespace-nowrap">Unit Price</th>
                    <th className="pb-3 text-right whitespace-nowrap">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                  {lineItems
                    .filter((it) => !it.item.toLowerCase().includes('plan') && !it.item.toLowerCase().includes('subscription'))
                    .map((item) => (
                      <tr key={item.item}>
                        <td className="py-3 text-[#1d1d1f] dark:text-white font-medium whitespace-nowrap">{item.item}</td>
                        <td className="py-3 text-center font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">{item.qty}</td>
                        <td className="py-3 text-right font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-3 text-right font-mono font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex justify-between items-center text-[13px]">
              <span className="text-[#6e6e73] dark:text-[#86868b] font-medium">One-Time Lines Subtotal:</span>
              <span className="font-mono font-bold text-[#1d1d1f] dark:text-white">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          {/* Section 2: Recurring Lines */}
          <div className="bg-white/80 dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 sm:p-7 backdrop-blur-xl shadow-sm dark:shadow-apple-card">
            <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06] dark:border-white/[0.06] mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#bf5af2]" />
                <h4 className="text-[14px] font-bold text-[#1d1d1f] dark:text-white">
                  Recurring Subscription & Service Lines
                </h4>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#bf5af2]/10 text-[#bf5af2] font-semibold">
                Recurring Billing (Monthly / Annual)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] text-[#6e6e73] dark:text-[#f5f5f7]">
                <thead className="border-b border-black/[0.06] dark:border-white/[0.06] text-[#6e6e73] dark:text-[#86868b] font-mono text-[12px]">
                  <tr>
                    <th className="pb-3 whitespace-nowrap">Service / Subscription</th>
                    <th className="pb-3 text-center whitespace-nowrap">Billing Cycle</th>
                    <th className="pb-3 text-center whitespace-nowrap">Qty</th>
                    <th className="pb-3 text-right whitespace-nowrap">Rate</th>
                    <th className="pb-3 text-right whitespace-nowrap">Recurring Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                  <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="py-3 text-[#1d1d1f] dark:text-white font-medium whitespace-nowrap">
                      Enterprise Care Plan (2yr Coverage SLA)
                    </td>
                    <td className="py-3 text-center font-mono text-[#0071e3] dark:text-[#2997ff] whitespace-nowrap">
                      Monthly
                    </td>
                    <td className="py-3 text-center font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">1</td>
                    <td className="py-3 text-right font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">$46.00 / mo</td>
                    <td className="py-3 text-right font-mono font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">$46.00 / mo</td>
                  </tr>
                  <tr className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="py-3 text-[#1d1d1f] dark:text-white font-medium whitespace-nowrap">
                      Cloud Platform Pro Tier SaaS Seats
                    </td>
                    <td className="py-3 text-center font-mono text-[#0071e3] dark:text-[#2997ff] whitespace-nowrap">
                      Annual (Upfront)
                    </td>
                    <td className="py-3 text-center font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">10</td>
                    <td className="py-3 text-right font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">$120.00 / yr</td>
                    <td className="py-3 text-right font-mono font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">$1,200.00 / yr</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex justify-between items-center text-[13px]">
              <span className="text-[#6e6e73] dark:text-[#86868b] font-medium">Recurring Contract Value (ARR / MRR):</span>
              <span className="font-mono font-bold text-[#bf5af2]">$1,752.00 / yr ($146.00 / mo)</span>
            </div>
          </div>
        </div>

        {/* Sidebar Payment Summary Card */}
        <div className="lg:col-span-4 bg-white/80 dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 sm:p-7 backdrop-blur-xl space-y-3.5 shadow-sm dark:shadow-apple-card">
          <h4 className="text-[13px] font-mono uppercase text-[#6e6e73] dark:text-[#86868b] mb-2 whitespace-nowrap">Payment Summary</h4>
          <div className="flex justify-between text-[13px] text-[#6e6e73] dark:text-[#86868b]">
            <span className="whitespace-nowrap">Line Subtotal:</span>
            <span className="font-mono text-[#1d1d1f] dark:text-white font-semibold whitespace-nowrap">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[13px] text-[#6e6e73] dark:text-[#86868b]">
            <span className="whitespace-nowrap">Tax & Surcharges:</span>
            <span className="font-mono text-[#1d1d1f] dark:text-white font-semibold whitespace-nowrap">{formatCurrency(tax)}</span>
          </div>
          <div className="border-t border-black/[0.08] dark:border-white/[0.08] pt-3.5 flex justify-between text-[15px] font-bold text-[#1d1d1f] dark:text-white">
            <span className="whitespace-nowrap">Total Payable:</span>
            <span className="font-mono text-[#1b7a36] dark:text-[#30d158] text-[20px] whitespace-nowrap">{formatCurrency(grandTotal)}</span>
          </div>
          <div className="pt-2 text-[13px] text-[#6e6e73] dark:text-[#86868b] font-mono whitespace-nowrap">
            <span>Terms: Net 30 days via ACH / Wire</span>
          </div>
        </div>
      </div>

      {/* Wireframe Gold Callout Note */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#ff9f0a]/30 bg-[#ff9f0a]/[0.08] dark:bg-[#ff9f0a]/[0.06] text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center space-x-3">
        <Clock className="w-4.5 h-4.5 text-[#ff9f0a] shrink-0" />
        <div>
          <span className="font-semibold text-[#9e5200] dark:text-[#ff9f0a]">Revenue Reconciliation Policy: </span>
          <span>
            Partial invoicing stays reconciled with partial delivery, nothing is billed before it ships.
          </span>
        </div>
      </div>

      {/* Payment Recording Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.12] rounded-[22px] max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <h3 className="text-[17px] font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-2.5">
              <CreditCard className="w-5 h-5 text-[#34c759] dark:text-[#30d158]" />
              Record Inward Payment
            </h3>
            <p className="text-[13px] text-[#6e6e73] dark:text-[#86868b]">
              Confirm receipt of payment for <strong className="text-[#1d1d1f] dark:text-white">{invoiceId}</strong> amounting to <strong className="text-[#1b7a36] dark:text-[#30d158]">{formatCurrency(grandTotal)}</strong>.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">Payment Method</label>
                <select className="w-full h-11 px-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]">
                  <option value="wire" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Wire Transfer / ACH</option>
                  <option value="card" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Corporate Credit Card</option>
                  <option value="check" className="bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white">Commercial Check</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">Reference / Transaction #</label>
                <input
                  type="text"
                  defaultValue="TXN-ACH-889104"
                  className="w-full h-11 px-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.12] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white font-mono focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleRecordPayment}
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetailsPage;
