import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import quotationService from '../../services/quotationService';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { CheckSquare, CheckCircle, XCircle, Clock, ShieldAlert } from 'lucide-react';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';

export const ApprovalsQueuePage = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await quotationService.getQuotations({ status: 'pending_approval' });
      if (res?.data) {
        setQuotes(res.data);
      }
    } catch (err) {
      console.error('Error fetching approval queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, newStatus) => {
    try {
      await quotationService.updateStatus(id, newStatus);
      await fetchPending();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Executive Deal Approval Queue</h2>
        <p className="text-xs text-slate-400 mt-1">
          Review commercial discount requests, margin exceptions, and deal health risk overrides.
        </p>
      </div>

      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <CardTitle>Awaiting Executive Sign-off ({quotes.length})</CardTitle>
          </div>
        </CardHeader>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono animate-pulse">
            Loading approval requests...
          </div>
        ) : quotes.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No deals currently awaiting approval. All quotations are within standard policy thresholds.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {quotes.map((q) => (
              <div key={q._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-white">{q.title}</span>
                    <Badge variant="warning" size="xs">
                      {q.approvalReason || 'Discount Exception'}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Customer: <span className="text-slate-200">{q.customer?.name}</span> • Total Value:{' '}
                    <span className="font-mono text-white font-semibold">{formatCurrency(q.grandTotal)}</span> • Margin:{' '}
                    <span className="font-mono text-emerald-400">{formatPercent(q.blendedMarginPercent)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handleAction(q._id, 'approved')}
                    variant="success"
                    size="xs"
                    icon={CheckCircle}
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleAction(q._id, 'rejected')}
                    variant="danger"
                    size="xs"
                    icon={XCircle}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => navigate(`/quotations/${q._id}`)}
                    variant="outline"
                    size="xs"
                  >
                    Inspect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ApprovalsQueuePage;
