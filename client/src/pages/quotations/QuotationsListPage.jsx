import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import quotationService from '../../services/quotationService';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Plus, LayoutGrid, Table as TableIcon, Search, ArrowRight } from 'lucide-react';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import { QUOTATION_STATUSES } from '../../utils/constants';

export const QuotationsListPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const defaultMockQuotes = [
    { _id: 'Q-1042', quotationNumber: 'Q-1042', customerName: 'Acme Corp', grandTotal: 12400, blendedMarginPercent: 81.6, riskScore: 15, status: 'draft' },
    { _id: 'Q-1033', quotationNumber: 'Q-1033', customerName: 'Delta LLC', grandTotal: 3200, blendedMarginPercent: 74.0, riskScore: 20, status: 'draft' },
    { _id: 'Q-1039', quotationNumber: 'Q-1039', customerName: 'Beta Industries', grandTotal: 28900, blendedMarginPercent: 62.5, riskScore: 65, status: 'pending_approval' },
    { _id: 'Q-1035', quotationNumber: 'Q-1035', customerName: 'Nova Retail', grandTotal: 9750, blendedMarginPercent: 79.0, riskScore: 10, status: 'approved' },
    { _id: 'Q-1030', quotationNumber: 'Q-1030', customerName: 'Zenith Co', grandTotal: 15300, blendedMarginPercent: 68.0, riskScore: 40, status: 'negotiation' },
    { _id: 'Q-1025', quotationNumber: 'Q-1025', customerName: 'Orion Ltd', grandTotal: 41000, blendedMarginPercent: 84.0, riskScore: 12, status: 'confirmed' }
  ];

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true);
      try {
        const res = await quotationService.getQuotations();
        if (res?.data && res.data.length > 0) {
          setQuotations(res.data);
        } else {
          setQuotations(defaultMockQuotes);
        }
      } catch (err) {
        console.warn('Using fallback quotations:', err.message);
        setQuotations(defaultMockQuotes);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const filteredQuotes = quotations.filter((q) => {
    const name = q.customer?.name || q.customerName || '';
    const num = q.quotationNumber || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      num.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const columns = [
    { key: 'draft', label: 'Draft', color: 'border-white/10' },
    { key: 'pending_approval', label: 'Pending Approval', color: 'border-[#ff9f0a]/30' },
    { key: 'approved', label: 'Approved', color: 'border-[#30d158]/30' },
    { key: 'negotiation', label: 'Negotiation', color: 'border-[#2997ff]/30' },
    { key: 'confirmed', label: 'Confirmed', color: 'border-[#bf5af2]/30' }
  ];

  return (
    <div className="space-y-7">
      {/* Wireframe Header (Screen 3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div>
          <h1 className="text-[26px] sm:text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.025em]">
            3. Quotations (List)
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b] mt-1">
            Every quotation in the system, one row per quotation, click a row to open it
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={() => navigate('/quotations/new')}
            variant="primary"
            size="md"
            icon={Plus}
          >
            New Quotation
          </Button>

          <Button
            onClick={() => setViewMode(viewMode === 'kanban' ? 'table' : 'kanban')}
            variant="secondary"
            size="md"
            icon={viewMode === 'kanban' ? TableIcon : LayoutGrid}
          >
            {viewMode === 'kanban' ? 'Table View' : 'Kanban View'}
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#86868b] dark:text-apple-muted" />
          <input
            type="text"
            placeholder="Search quotation by account or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 bg-white dark:bg-white/[0.06] border border-black/[0.12] dark:border-white/[0.12] rounded-xl pl-10 pr-4 text-[13px] text-[#1d1d1f] dark:text-white placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff] focus:ring-4 focus:ring-[#0071e3]/15 dark:focus:ring-[#2997ff]/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Kanban Board Mode (Screen 3 exact layout) */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {columns.map((col) => {
            const itemsInCol = filteredQuotes.filter(
              (q) => (q.status === col.key) || (col.key === 'confirmed' && q.status === 'accepted')
            );

            return (
              <div
                key={col.key}
                className="bg-black/[0.02] dark:bg-[#161618]/80 border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col min-h-[440px] backdrop-blur-xl"
              >
                <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06] dark:border-white/[0.06] mb-3.5">
                  <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white tracking-tight whitespace-nowrap">{col.label}</span>
                  <span className="text-[13px] font-mono text-[#6e6e73] dark:text-apple-muted px-3 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] whitespace-nowrap">
                    {itemsInCol.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {itemsInCol.map((quote) => (
                    <div
                      key={quote._id}
                      onClick={() => navigate(`/quotations/${quote._id}`)}
                      className="p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.08] hover:border-[#0071e3] dark:hover:border-[#2997ff]/60 hover:shadow-md dark:hover:bg-[#242426] cursor-pointer transition-all group shadow-[0_1px_3px_rgba(0,0,0,0.03)]"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] transition-colors leading-snug">
                          {quote.customer?.name || quote.customerName}
                        </span>
                        <span className="text-[13px] font-mono font-semibold text-[#6e6e73] dark:text-apple-muted group-hover:text-[#1d1d1f] dark:group-hover:text-white whitespace-nowrap shrink-0">
                          {formatCurrency(quote.grandTotal)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06] text-[13px] text-[#6e6e73] dark:text-apple-dim font-mono">
                        <span className="whitespace-nowrap">{quote.quotationNumber}</span>
                        <span className="text-[#6e6e73] dark:text-apple-muted group-hover:text-[#0071e3] dark:group-hover:text-[#2997ff] flex items-center gap-1 font-sans font-medium whitespace-nowrap">
                          <span>Open</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}

                  {itemsInCol.length === 0 && (
                    <div className="h-32 flex items-center justify-center text-[13px] text-[#86868b] dark:text-apple-dim border border-dashed border-black/[0.08] dark:border-white/[0.06] rounded-2xl whitespace-nowrap">
                      Empty stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View Mode */
        <Card className="p-0 overflow-hidden bg-white/80 dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.08] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] text-[#6e6e73] dark:text-apple-muted">
              <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
                <tr>
                  <th className="py-3.5 px-5 whitespace-nowrap">Quote # & Customer</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">Contract Value</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">Blended Margin</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Risk Score</th>
                  <th className="py-3.5 px-3 text-center whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                {filteredQuotes.map((q) => (
                  <tr
                    key={q._id}
                    onClick={() => navigate(`/quotations/${q._id}`)}
                    className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="font-semibold text-[13px] text-[#1d1d1f] dark:text-white whitespace-nowrap">{q.customer?.name || q.customerName}</div>
                      <div className="text-[13px] font-mono text-[#6e6e73] dark:text-apple-dim mt-0.5 whitespace-nowrap">{q.quotationNumber}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <Badge variant={q.status === 'approved' ? 'success' : q.status === 'pending_approval' ? 'warning' : 'default'} size="xs">
                        {q.status?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-semibold text-[13px] text-[#1d1d1f] dark:text-white whitespace-nowrap">
                      {formatCurrency(q.grandTotal)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-[#1b7a36] dark:text-[#30d158] font-semibold text-[13px] whitespace-nowrap">
                      {formatPercent(q.blendedMarginPercent)}
                    </td>
                    <td className="py-4 px-4 text-center font-mono whitespace-nowrap">
                      <span className={`text-[13px] px-3.5 py-1 rounded-full font-medium inline-block whitespace-nowrap ${q.riskScore >= 50 ? 'bg-[#ff453a]/15 text-[#c9342c] dark:text-[#ff453a] border border-[#ff453a]/30' : 'bg-black/[0.05] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-white'}`}>
                        {q.riskScore}/100
                      </span>
                    </td>
                    <td className="py-4 px-3 text-center whitespace-nowrap">
                      <ArrowRight className="w-4 h-4 text-[#86868b] dark:text-apple-muted" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default QuotationsListPage;
