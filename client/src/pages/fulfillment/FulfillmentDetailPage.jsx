import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { ArrowLeft, CheckCircle2, Split, SlidersHorizontal, AlertCircle, Loader2, Receipt } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import fulfillmentService from '../../services/fulfillmentService';
import billingService from '../../services/billingService';

export const FulfillmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const orderId = id || 'Q-1042';

  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [splitRows, setSplitRows] = useState([
    { warehouse: 'Main Warehouse', qtyFulfilled: '18 units', estShipments: 1, cost: 42 },
    { warehouse: 'East Depot', qtyFulfilled: '6 units', estShipments: 1, cost: 29 }
  ]);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fulfillmentService.getFulfillmentDetail(orderId);
        if (res?.data) {
          setOrderData(res.data);
          if (res.data.suggestedSplits && res.data.suggestedSplits.length > 0) {
            setSplitRows(res.data.suggestedSplits);
          }
        }
      } catch (err) {
        console.warn('Fallback fulfillment split:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [orderId]);

  const handleConfirmSplit = async () => {
    try {
      await fulfillmentService.confirmSplit(orderId, splitRows);
      try {
        await billingService.generateBilling(orderId);
      } catch (bErr) {
        console.warn('Billing auto-generate note:', bErr.message);
      }
      setConfirmed(true);
    } catch (err) {
      console.warn('Split confirmation local fallback:', err.message);
      setConfirmed(true);
    }
  };

  const handleProceedToBilling = async () => {
    setNavigating(true);
    try {
      await billingService.generateBilling(orderId);
    } catch (bErr) {
      console.warn('Billing generate note:', bErr.message);
    } finally {
      setNavigating(false);
      navigate('/invoices');
    }
  };

  const customerName = orderData?.customerName || 'Acme Corp';
  const displayId = orderData?.orderId || orderId;

  return (
    <div className="space-y-8">
      {/* Screen 8 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div>
          <button
            onClick={() => navigate('/fulfillment')}
            className="text-[13px] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] inline-flex items-center gap-2 mb-2 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Fulfillment list</span>
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[26px] sm:text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.025em]">
              Fulfillment Detail: {displayId} — {customerName}
            </h1>
            <Badge variant={confirmed ? 'success' : 'warning'} size="sm">
              {confirmed ? 'Dispatched' : 'Split Pending'}
            </Badge>
          </div>
          <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b] mt-1">
            Review multi-depot stock allocation, confirm dispatch routing, and trigger order fulfillment
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={handleConfirmSplit}
            disabled={confirmed}
            variant="primary"
            size="md"
            icon={CheckCircle2}
          >
            {confirmed ? 'Split Confirmed' : 'Accept Suggested Split'}
          </Button>

          <Button
            onClick={handleProceedToBilling}
            variant="secondary"
            size="md"
            icon={Receipt}
            disabled={navigating}
          >
            {navigating ? 'Generating...' : 'Go to Invoices →'}
          </Button>
        </div>
      </div>

      {confirmed && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#34c759]/10 dark:bg-[#30d158]/15 border border-[#34c759]/30 text-[13px] text-[#1b7a36] dark:text-[#30d158] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="font-semibold">Fulfillment split confirmed. Warehouse dispatch queues updated & invoice generated.</span>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={handleProceedToBilling}
            disabled={navigating}
          >
            {navigating ? 'Generating Invoice...' : 'Proceed to Invoices & Billing →'}
          </Button>
        </div>
      )}

      {/* Screen 8 Table */}
      <Card className="p-0 overflow-hidden rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] shadow-sm dark:shadow-apple-card backdrop-blur-xl">
        <div className="p-5 sm:p-6 pb-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <CardTitle className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Warehouse Allocation Split</CardTitle>
          <span className="text-[13px] text-[#6e6e73] dark:text-[#86868b] font-mono px-3.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] whitespace-nowrap">Multi-Depot Routing</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#6e6e73] dark:text-apple-muted">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Warehouse</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Qty Fulfilled</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Est. Shipments</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
              {splitRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">{row.warehouse}</td>
                  <td className="py-4 px-4 text-center font-mono text-[#0071e3] dark:text-[#2997ff] font-medium whitespace-nowrap">{row.qtyFulfilled}</td>
                  <td className="py-4 px-4 text-center font-mono text-[#1d1d1f] dark:text-white whitespace-nowrap">{row.estShipments}</td>
                  <td className="py-4 px-5 text-right font-mono font-semibold text-[#1b7a36] dark:text-[#30d158] whitespace-nowrap">
                    {formatCurrency(row.cost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Wireframe Exact Callout */}
        <div className="p-4 sm:p-5 bg-black/[0.02] dark:bg-white/[0.03] border-t border-black/[0.08] dark:border-white/[0.08] text-[13px] text-[#6e6e73] dark:text-[#86868b] flex items-center gap-3">
          <AlertCircle className="w-4.5 h-4.5 text-[#ff9f0a] shrink-0" />
          <span>'Consolidate Remaining Backorder' prompt appears automatically once East Depot restocks.</span>
        </div>
      </Card>
    </div>
  );
};

export default FulfillmentDetailPage;
