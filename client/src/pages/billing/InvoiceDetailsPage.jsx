import React, { useState } from 'react';
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
  Truck
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';

export const InvoiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceId = id || 'INV-1042';

  const [paymentRecorded, setPaymentRecorded] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Stepper state: 0: Order Confirmed, 1: Shipped, 2: Invoiced (current), 3: Paid
  const currentStep = paymentRecorded ? 3 : 2;

  const steps = [
    { label: 'Order Confirmed', completed: true, date: 'Aug 24, 2026' },
    { label: 'Shipped', completed: true, date: 'Aug 25, 2026' },
    { label: 'Invoiced', completed: true, date: 'Aug 26, 2026' },
    { label: 'Paid', completed: paymentRecorded, date: paymentRecorded ? 'Today' : 'Pending' }
  ];

  const invoiceSummaryRows = [
    { id: 'INV-1042', desc: 'Hardware & Setup (One-Time)', amount: 2730, status: paymentRecorded ? 'Paid' : 'Unpaid', dueDate: 'Sep 10' },
    { id: 'INV-1043 (Recurring)', desc: 'Care Plan 2yr (Cycle 1 of 24)', amount: 46, status: 'Paid', dueDate: 'Sep 15' }
  ];

  const lineItems = [
    { item: 'Laptop Pro 14 (Hardware)', qty: 2, unitPrice: 1200, discount: 10, total: 2160 },
    { item: 'Onsite Setup Service', qty: 1, unitPrice: 450, discount: 0, total: 450 }
  ];

  const subtotal = 2610;
  const tax = 120;
  const grandTotal = 2730;

  const handleRecordPayment = () => {
    setPaymentRecorded(true);
    setShowPaymentModal(false);
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
              Invoice Detail: {invoiceId} — Acme Corp
            </h1>
            <Badge variant={paymentRecorded ? 'success' : 'warning'} size="sm" className="font-mono">
              {paymentRecorded ? 'Paid' : 'Unpaid'}
            </Badge>
          </div>
          <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b] mt-1">
            Opened by clicking a row on the Invoices list
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="md"
            icon={Download}
            onClick={() => downloadInvoicePDF({ invoiceId, customer: 'Acme Corp', amount: grandTotal, status: paymentRecorded ? 'Paid' : 'Unpaid' })}
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

      {/* Itemized Line Items & Financials Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white/80 dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 sm:p-7 backdrop-blur-xl shadow-sm dark:shadow-apple-card">
          <h4 className="text-[13px] font-mono uppercase text-[#6e6e73] dark:text-[#86868b] mb-4 whitespace-nowrap">Itemized Products & Services</h4>
          <table className="w-full text-left text-[13px] text-[#6e6e73] dark:text-[#f5f5f7]">
            <thead className="border-b border-black/[0.06] dark:border-white/[0.06] text-[#6e6e73] dark:text-[#86868b] font-mono text-[13px]">
              <tr>
                <th className="pb-3 whitespace-nowrap">Description</th>
                <th className="pb-3 text-center whitespace-nowrap">Qty</th>
                <th className="pb-3 text-right whitespace-nowrap">Unit Price</th>
                <th className="pb-3 text-right whitespace-nowrap">Net Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {lineItems.map((item) => (
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

        <div className="bg-white/80 dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] rounded-[22px] p-6 sm:p-7 backdrop-blur-xl space-y-3.5 shadow-sm dark:shadow-apple-card">
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
