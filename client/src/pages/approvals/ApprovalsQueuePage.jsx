import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import approvalService from '../../services/approvalService';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { CheckSquare, Filter, ArrowRight, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const ApprovalsQueuePage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'pending' | 'returned' | 'approved'
  const [loading, setLoading] = useState(true);
  const [approvalItems, setApprovalItems] = useState([]);

  const defaultMockItems = [
    {
      id: 'Q-1042',
      quotationNumber: 'Q-1042',
      customer: 'Acme Corp',
      blendedRisk: 'HIGH',
      stage: 'Sales Manager',
      assignedTo: 'M. Shah',
      status: 'pending',
      dealValue: 19377
    },
    {
      id: 'Q-1039',
      quotationNumber: 'Q-1039',
      customer: 'Beta Industries',
      blendedRisk: 'MEDIUM',
      stage: 'Finance',
      assignedTo: 'R. Iyer',
      status: 'pending',
      dealValue: 28900
    },
    {
      id: 'Q-1035',
      quotationNumber: 'Q-1035',
      customer: 'Nova Retail',
      blendedRisk: 'LOW',
      stage: 'Auto-Approved',
      assignedTo: '-',
      status: 'approved',
      dealValue: 9750
    },
    {
      id: 'Q-1031',
      quotationNumber: 'Q-1031',
      customer: 'Zenith Co',
      blendedRisk: 'MEDIUM',
      stage: 'Returned to Rep',
      assignedTo: 'J. Rao',
      status: 'returned',
      dealValue: 15300
    }
  ];

  useEffect(() => {
    const fetchQueue = async () => {
      setLoading(true);
      try {
        const res = await approvalService.getApprovalsQueue();
        if (res?.data && Array.isArray(res.data)) {
          const mapped = res.data.map((it) => ({
            id: it._id,
            quotationNumber: it.quotationNumber || it.quotation?.quotationNumber || it._id,
            customer:
              it.customerName ||
              it.quotation?.customer?.name ||
              it.quotation?.customerName ||
              'Enterprise Account',
            blendedRisk: (
              it.quotation?.riskLevel ||
              (it.riskScore > 50 ? 'HIGH' : it.riskScore > 20 ? 'MEDIUM' : 'LOW')
            ).toUpperCase(),
            stage: it.currentStage || 'Sales Manager',
            assignedTo: it.assignedTo || it.submitterName || it.approverName || 'M. Shah',
            status: it.status || 'pending',
            dealValue: it.dealValue || it.quotation?.grandTotal || 0
          }));
          setApprovalItems(mapped);
        } else {
          setApprovalItems([]);
        }
      } catch (err) {
        console.warn('Failed to load approval queue:', err.message);
        setApprovalItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
  }, []);

  const pendingCount = approvalItems.filter((it) => it.status === 'pending').length;
  const returnedCount = approvalItems.filter((it) => it.status === 'returned').length;
  const approvedCount = approvalItems.filter((it) => it.status === 'approved').length;

  const filteredItems = approvalItems.filter((it) => {
    if (activeFilter === 'pending') return it.status === 'pending';
    if (activeFilter === 'returned') return it.status === 'returned';
    if (activeFilter === 'approved') return it.status === 'approved';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Screen 5 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div>
          <h1 className="text-[26px] sm:text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.025em]">
            5. Approvals (List)
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b] mt-1">
            Every quotation that needed, needs, or is going through discount approval
          </p>
        </div>

        {/* Dynamic Filter Pills */}
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'pending' ? 'all' : 'pending')}
            className={`h-9 px-4 rounded-full text-[13px] font-medium border transition-all whitespace-nowrap w-fit shrink-0 ${
              activeFilter === 'pending'
                ? 'bg-[#ff9f0a]/20 text-[#9e5200] dark:text-[#ff9f0a] border-[#ff9f0a] font-semibold ring-2 ring-[#ff9f0a]/30'
                : 'bg-[#ff9f0a]/10 dark:bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a] border-[#ff9f0a]/30 hover:bg-[#ff9f0a]/20'
            }`}
          >
            {pendingCount} Pending
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'returned' ? 'all' : 'returned')}
            className={`h-9 px-4 rounded-full text-[13px] font-medium border transition-all whitespace-nowrap w-fit shrink-0 ${
              activeFilter === 'returned'
                ? 'bg-[#ff453a]/20 text-[#c9342c] dark:text-[#ff453a] border-[#ff453a] font-semibold ring-2 ring-[#ff453a]/30'
                : 'bg-[#ff453a]/10 dark:bg-[#ff453a]/15 text-[#c9342c] dark:text-[#ff453a] border-[#ff453a]/30 hover:bg-[#ff453a]/20'
            }`}
          >
            {returnedCount} Returned
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter(activeFilter === 'approved' ? 'all' : 'approved')}
            className={`h-9 px-4 rounded-full text-[13px] font-medium border transition-all whitespace-nowrap w-fit shrink-0 ${
              activeFilter === 'approved'
                ? 'bg-[#34c759]/20 text-[#1b7a36] dark:text-[#30d158] border-[#34c759] font-semibold ring-2 ring-[#34c759]/30'
                : 'bg-[#34c759]/10 dark:bg-[#30d158]/15 text-[#1b7a36] dark:text-[#30d158] border-[#34c759]/30 hover:bg-[#34c759]/20'
            }`}
          >
            {approvedCount} Approved
          </button>
        </div>
      </div>

      {/* Screen 5 Table */}
      <Card className="p-0 overflow-hidden rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#6e6e73] dark:text-apple-muted">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Quotation</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Customer</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Deal Value</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Blended Risk</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Stage</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Assigned To</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0071e3] dark:text-[#2997ff]" />
                    <span className="text-[13px] text-[#6e6e73] dark:text-[#86868b] mt-2 block">
                      Loading approvals queue...
                    </span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#86868b]">
                    No approval requests found for this filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => navigate(`/approvals/${row.id}`)}
                    className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-5 font-mono font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                      {row.quotationNumber}
                    </td>

                    <td className="py-4 px-5 font-medium text-[#1d1d1f] dark:text-white whitespace-nowrap">
                      {row.customer}
                    </td>

                    <td className="py-4 px-4 font-mono font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                      {formatCurrency(row.dealValue)}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`text-[13px] font-mono px-3.5 py-1 rounded-full font-semibold border whitespace-nowrap inline-block ${
                          row.blendedRisk === 'HIGH' || row.blendedRisk === 'CRITICAL'
                            ? 'bg-[#ff453a]/10 dark:bg-[#ff453a]/15 text-[#c9342c] dark:text-[#ff453a] border-[#ff453a]/30'
                            : row.blendedRisk === 'MEDIUM'
                            ? 'bg-[#ff9f0a]/10 dark:bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a] border-[#ff9f0a]/30'
                            : 'bg-[#34c759]/10 dark:bg-[#30d158]/15 text-[#1b7a36] dark:text-[#30d158] border-[#34c759]/30'
                        }`}
                      >
                        {row.blendedRisk}
                      </span>
                    </td>

                    <td className="py-4 px-5 font-medium text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">
                      {row.stage}
                    </td>

                    <td className="py-4 px-5 text-[#6e6e73] dark:text-[#86868b] font-mono whitespace-nowrap">
                      {row.assignedTo}
                    </td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <ArrowRight className="w-4 h-4 text-[#86868b] dark:text-apple-muted" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Wireframe Exact Callout */}
        <div className="p-4 sm:p-5 bg-black/[0.02] dark:bg-white/[0.03] border-t border-black/[0.08] dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] text-[#6e6e73] dark:text-[#86868b]">
          <span>Click any row to open its full approval detail, risk breakdown, and audit trail.</span>

          <Button
            onClick={() => setActiveFilter(activeFilter === 'pending' ? 'all' : 'pending')}
            variant="outline"
            size="sm"
            icon={Filter}
          >
            {activeFilter === 'pending' ? 'Show All' : 'Filter: Pending Only'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ApprovalsQueuePage;
