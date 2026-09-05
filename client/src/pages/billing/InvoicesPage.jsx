import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, Calendar, ArrowUpRight, Search, FileText, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import billingService from '../../services/billingService';

export const InvoicesPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all' | 'unpaid' | 'paid'
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultMockInvoices = [
    {
      id: 'INV-1042',
      customer: 'Acme Corp',
      amount: 2730,
      status: 'Unpaid',
      dueDate: 'Sep 10',
      type: 'One-Time Order',
      createdDate: 'Aug 26'
    },
    {
      id: 'INV-1043',
      customer: 'Acme Corp',
      amount: 46,
      status: 'Paid',
      dueDate: 'Sep 15',
      type: 'Recurring Monthly',
      createdDate: 'Aug 26'
    },
    {
      id: 'INV-1038',
      customer: 'Nova Retail',
      amount: 9750,
      status: 'Paid',
      dueDate: 'Aug 30',
      type: 'One-Time Order',
      createdDate: 'Aug 10'
    },
    {
      id: 'INV-1035',
      customer: 'Beta Industries',
      amount: 14200,
      status: 'Unpaid',
      dueDate: 'Sep 28',
      type: 'Enterprise Milestone',
      createdDate: 'Aug 22'
    },
    {
      id: 'INV-1031',
      customer: 'Stark Dynamics',
      amount: 48000,
      status: 'Paid',
      dueDate: 'Aug 15',
      type: 'One-Time Order',
      createdDate: 'Jul 28'
    },
    {
      id: 'INV-1029',
      customer: 'Zenith Co',
      amount: 8350,
      status: 'Unpaid',
      dueDate: 'Oct 02',
      type: 'Recurring SLA',
      createdDate: 'Aug 28'
    },
    {
      id: 'INV-1025',
      customer: 'Delta LLC',
      amount: 19400,
      status: 'Unpaid',
      dueDate: 'Sep 18',
      type: 'Hardware & Setup',
      createdDate: 'Aug 18'
    }
  ];

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const res = await billingService.getInvoices();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setInvoices(
            res.data.map((inv) => ({
              id: inv.invoiceNumber || inv._id,
              _id: inv._id,
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

    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'unpaid'
        ? inv.status.toLowerCase() === 'unpaid'
        : inv.status.toLowerCase() === 'paid';
    const matchesSearch =
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unpaidCount = invoices.filter((i) => i.status.toLowerCase() === 'unpaid').length;
  const paidCount = invoices.filter((i) => i.status.toLowerCase() === 'paid').length;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.08] dark:border-white/[0.08] pb-5">
        <div>
          <h1 className="text-[26px] sm:text-[28px] font-bold tracking-[-0.025em] text-[#1d1d1f] dark:text-[#f5f5f7]">Invoices</h1>
          <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b] mt-1">
            Every invoice generated from one-time and recurring orders
          </p>
        </div>

        {/* Filter Pills: Transparent Gestures */}
        <div className="flex items-center space-x-1.5 bg-black/[0.04] dark:bg-white/[0.04] p-1 rounded-full border border-black/[0.06] dark:border-white/[0.08]">
          <button
            onClick={() => setFilter('unpaid')}
            className={`h-8 px-4 rounded-full text-[13px] font-medium transition-all whitespace-nowrap w-fit shrink-0 ${
              filter === 'unpaid'
                ? 'bg-[#ff9f0a]/20 text-[#9e5200] dark:text-[#ff9f0a] border border-[#ff9f0a]/30 font-semibold shadow-sm'
                : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white border border-transparent'
            }`}
          >
            {unpaidCount} Unpaid
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`h-8 px-4 rounded-full text-[13px] font-medium transition-all whitespace-nowrap w-fit shrink-0 ${
              filter === 'paid'
                ? 'bg-[#34c759]/20 text-[#1b7a36] dark:text-[#30d158] border border-[#34c759]/30 font-semibold shadow-sm'
                : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white border border-transparent'
            }`}
          >
            {paidCount} Paid
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`h-8 px-4 rounded-full text-[13px] font-medium transition-all whitespace-nowrap w-fit shrink-0 ${
              filter === 'all'
                ? 'bg-[#0071e3]/15 dark:bg-[#2997ff]/20 text-[#0071e3] dark:text-[#2997ff] border border-[#0071e3]/30 dark:border-[#2997ff]/30 font-semibold shadow-sm'
                : 'text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white border border-transparent'
            }`}
          >
            All · {invoices.length}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-3">
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
                  <td className="py-4 px-5 font-mono font-semibold text-[#1d1d1f] dark:text-white group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors flex items-center space-x-2 whitespace-nowrap">
                    <Receipt className="w-4 h-4 text-[#86868b] group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] shrink-0" />
                    <span>{inv.id}</span>
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
          Click an invoice row to open its full payment and delivery reconciliation detail.
        </span>
      </div>
    </div>
  );
};

export default InvoicesPage;
