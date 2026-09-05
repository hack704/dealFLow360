import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import quotationService from '../../services/quotationService';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  FileSpreadsheet,
  Plus,
  TrendingUp,
  ShieldAlert,
  Clock,
  ArrowRight,
  DollarSign,
  Percent
} from 'lucide-react';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import { QUOTATION_STATUSES } from '../../utils/constants';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const res = await quotationService.getQuotations();
        if (res?.data) {
          setQuotations(res.data);
        }
      } catch (err) {
        console.error('Error loading dashboard quotations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const totalPipelineValue = quotations.reduce((acc, q) => acc + (q.grandTotal || 0), 0);
  const avgMargin =
    quotations.length > 0
      ? quotations.reduce((acc, q) => acc + (q.blendedMarginPercent || 0), 0) / quotations.length
      : 0;
  const pendingApprovalsCount = quotations.filter((q) => q.requiresApproval || q.status === 'pending_approval').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Deal Performance & CPQ Cockpit</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time deal pipeline, margin optimization, and commercial governance overview.
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

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Total Active Pipeline
            </span>
            <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-900/50">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {formatCurrency(totalPipelineValue)}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3" /> Across {quotations.length} live quotations
          </div>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Avg Blended Margin
            </span>
            <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-900/50">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {formatPercent(avgMargin)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            Target floor: 25.0%
          </div>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Approval Queue
            </span>
            <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-900/50">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-2">
            {pendingApprovalsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            Discount & risk exceptions
          </div>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Win Probability Avg
            </span>
            <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-900/50">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300 mt-2">
            78.5%
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            AI-modeled confidence score
          </div>
        </Card>
      </div>

      {/* Recent Quotations Table */}
      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            <CardTitle>Recent Quotations & Proposals</CardTitle>
          </div>
          <Link
            to="/quotations"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 animate-pulse font-mono">
            Loading deal data...
          </div>
        ) : quotations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No quotations created yet. Click "New CPQ Quotation" to create your first deal.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Quote # & Title</th>
                  <th className="py-3 px-3">Customer Account</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Contract Value</th>
                  <th className="py-3 px-3 text-right">Margin %</th>
                  <th className="py-3 px-3 text-center">Risk Score</th>
                  <th className="py-3 px-4 text-right">Created</th>
                  <th className="py-3 px-2 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {quotations.slice(0, 5).map((q) => {
                  const statusConfig = QUOTATION_STATUSES[q.status] || QUOTATION_STATUSES.draft;
                  return (
                    <tr key={q._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-100">
                        <Link
                          to={`/quotations/${q._id}`}
                          className="hover:text-indigo-400 transition-colors block"
                        >
                          {q.title || 'Untitled Proposal'}
                        </Link>
                        <span className="text-[10px] font-mono text-slate-400">{q.quotationNumber}</span>
                      </td>

                      <td className="py-3 px-3 text-slate-300">
                        {q.customer?.name || q.customerName || 'N/A'}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-semibold text-white">
                        {formatCurrency(q.grandTotal)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-medium text-emerald-400">
                        {formatPercent(q.blendedMarginPercent)}
                      </td>

                      <td className="py-3 px-3 text-center font-mono">
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

                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        {formatDate(q.createdAt)}
                      </td>

                      <td className="py-3 px-2 text-center">
                        <Button
                          onClick={() => navigate(`/quotations/${q._id}`)}
                          variant="ghost"
                          size="xs"
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

export default DashboardPage;
