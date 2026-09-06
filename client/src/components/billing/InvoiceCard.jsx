import React from 'react';
import { FileText, Calendar, DollarSign, CheckCircle2, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

/**
 * InvoiceCard — Compact card for an invoice line in a list.
 * Props: invoice = { invoiceNumber, type, customerName, grandTotal, status, dueDate, createdAt }
 *        onClick (fn)
 */
const InvoiceCard = ({ invoice = {}, onClick }) => {
  const { invoiceNumber, type, customerName, grandTotal, status, dueDate, createdAt } = invoice;

  const statusStyle =
    status === 'Paid'     ? 'border-[#30d158]/30 bg-[#30d158]/10 text-[#30d158]' :
    status === 'Overdue'  ? 'border-[#ff453a]/30 bg-[#ff453a]/10 text-[#ff453a]' :
    status === 'Cancelled'? 'border-[#555]/30 bg-[#555]/10 text-[#555]' :
                            'border-[#ff9f0a]/30 bg-[#ff9f0a]/10 text-[#ff9f0a]';

  const StatusIcon = status === 'Paid' ? CheckCircle2 : Clock;

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 transition-all hover:bg-white/[0.06] ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2997ff]/15">
          <FileText size={14} className="text-[#2997ff]" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#f5f5f7] truncate">{invoiceNumber}</p>
          <p className="text-[12px] text-[#86868b] truncate">{customerName} — {type}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        {dueDate && (
          <div className="hidden sm:flex items-center gap-1 text-[12px] text-[#555]">
            <Calendar size={11} />
            Due {formatDate ? formatDate(dueDate) : new Date(dueDate).toLocaleDateString()}
          </div>
        )}
        <div className="flex items-center gap-1 text-[13px] font-bold text-[#f5f5f7]">
          <DollarSign size={12} className="text-[#555]" />
          {formatCurrency ? formatCurrency(grandTotal) : grandTotal?.toLocaleString()}
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusStyle}`}>
          <StatusIcon size={10} />
          {status}
        </span>
      </div>
    </div>
  );
};

export default InvoiceCard;
