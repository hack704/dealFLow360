import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import quotationService from '../../services/quotationService';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Plus, Search, Filter, FileSpreadsheet, Eye, ArrowUpDown } from 'lucide-react';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import { QUOTATION_STATUSES } from '../../utils/constants';

export const QuotationsListPage = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchQuotations = async () => {
      setLoading(true);
      try {
        const res = await quotationService.getQuotations();
        if (res?.data) {
          setQuotations(res.data);
        }
      } catch (err) {
        console.error('Error loading quotations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, []);

  const filteredQuotes = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? q.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Deal Quotations & Proposals</h2>
          <p className="text-xs text-slate-400 mt-1">
            Repository of all commercial proposals, active versions, and governance stages.
          </p>
        </div>

        <Button
          onClick={() => navigate('/quotations/new')}
          variant="primary"
          icon={Plus}
          className="shadow-lg shadow-indigo-950"
        >
          New CPQ Quotation
        </Button>
      </div>

      <Card className="border-slate-800 bg-slate-900/60 p-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by quote number, title, or customer account..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Lifecycle Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="sent_to_customer">Sent to Customer</option>
              <option value="accepted">Accepted / Won</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse font-mono">
            Loading commercial records...
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No quotations found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Quote # & Title</th>
                  <th className="py-3 px-3">Customer Account</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Contract Total</th>
                  <th className="py-3 px-3 text-right">Discount</th>
                  <th className="py-3 px-3 text-right">Blended Margin</th>
                  <th className="py-3 px-3 text-center">Risk Score</th>
                  <th className="py-3 px-4 text-right">Created</th>
                  <th className="py-3 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredQuotes.map((q) => {
                  const statusConfig = QUOTATION_STATUSES[q.status] || QUOTATION_STATUSES.draft;
                  return (
                    <tr key={q._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-100">
                        <Link
                          to={`/quotations/${q._id}`}
                          className="hover:text-indigo-400 transition-colors block"
                        >
                          {q.title}
                        </Link>
                        <span className="text-[10px] font-mono text-slate-400">{q.quotationNumber}</span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-300">
                        {q.customer?.name || q.customerName}
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-semibold text-white">
                        {formatCurrency(q.grandTotal)}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono text-emerald-400">
                        {formatPercent(q.totalDiscountPercent)}
                      </td>

                      <td className="py-3.5 px-3 text-right font-mono font-medium text-emerald-400">
                        {formatPercent(q.blendedMarginPercent)}
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                            q.riskScore >= 50
                              ? 'bg-rose-950/60 text-rose-300 border border-rose-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {q.riskScore}/100
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        {formatDate(q.createdAt)}
                      </td>

                      <td className="py-3.5 px-2 text-center">
                        <Button
                          onClick={() => navigate(`/quotations/${q._id}`)}
                          variant="ghost"
                          size="xs"
                          icon={Eye}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default QuotationsListPage;
