import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import quotationService from '../../services/quotationService';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  ArrowLeft,
  Building2,
  FileCheck2,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  ShieldAlert,
  Percent,
  Calendar
} from 'lucide-react';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';
import { QUOTATION_STATUSES } from '../../utils/constants';

export const QuotationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const res = await quotationService.getQuotationById(id);
      if (res?.data) {
        setQuotation(res.data);
      }
    } catch (err) {
      console.error('Error loading quotation details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      await quotationService.updateStatus(id, newStatus);
      setMessage(`Quotation successfully updated to: ${newStatus.replace('_', ' ')}`);
      await fetchQuote();
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 font-mono animate-pulse">
        Loading commercial agreement details...
      </div>
    );
  }

  if (!quotation) {
    return (
      <Card className="p-8 text-center text-xs text-slate-400 border-slate-800">
        Quotation record not found.
      </Card>
    );
  }

  const statusConfig = QUOTATION_STATUSES[quotation.status] || QUOTATION_STATUSES.draft;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/quotations')}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to quotations</span>
          </button>
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-white tracking-tight">{quotation.title}</h2>
            <span
              className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
            Agreement Reference: {quotation.quotationNumber}
          </span>
        </div>

        {/* Dynamic Lifecycle Actions */}
        <div className="flex items-center space-x-2">
          {quotation.status === 'pending_approval' && (
            <>
              <Button
                onClick={() => handleStatusChange('approved')}
                loading={actionLoading}
                variant="success"
                size="sm"
                icon={CheckCircle}
              >
                Approve Proposal
              </Button>
              <Button
                onClick={() => handleStatusChange('rejected')}
                loading={actionLoading}
                variant="danger"
                size="sm"
                icon={XCircle}
              >
                Reject
              </Button>
            </>
          )}

          {quotation.status === 'approved' && (
            <Button
              onClick={() => handleStatusChange('sent_to_customer')}
              loading={actionLoading}
              variant="primary"
              size="sm"
              icon={Send}
            >
              Issue to Customer
            </Button>
          )}

          {quotation.status === 'sent_to_customer' && (
            <Button
              onClick={() => handleStatusChange('accepted')}
              loading={actionLoading}
              variant="success"
              size="sm"
              icon={CheckCircle}
            >
              Mark Accepted (Closed Won)
            </Button>
          )}

          <Button onClick={() => window.print()} variant="outline" size="sm" icon={Printer}>
            Print / PDF
          </Button>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">
          {message}
        </div>
      )}

      {/* Account & Terms Banner */}
      <Card className="border-slate-800 bg-slate-900/60 p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              Customer Account
            </span>
            <div className="text-sm font-semibold text-white mt-1">
              {quotation.customer?.name || quotation.customerName}
            </div>
            <div className="text-[11px] text-slate-400">
              {quotation.customer?.industry || 'Enterprise'}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              Credit Profile & Tier
            </span>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="primary">{quotation.customer?.tier || 'Enterprise'}</Badge>
              <Badge variant="success">Rating: {quotation.customer?.creditRating || 'AAA'}</Badge>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              Payment Terms
            </span>
            <div className="text-sm font-medium text-slate-200 mt-1 font-mono">
              Net {quotation.paymentTermsDays || 30} Days
            </div>
            <div className="text-[10px] text-slate-400">Valid until {formatDate(quotation.validUntil)}</div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              Commercial Governance
            </span>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`text-xs font-mono font-bold ${
                  quotation.riskScore >= 50 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                Risk: {quotation.riskScore}/100
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-xs font-mono text-emerald-400">
                Margin: {formatPercent(quotation.blendedMarginPercent)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Items Table */}
      <Card className="border-slate-800 bg-slate-900/60 overflow-hidden">
        <CardHeader>
          <CardTitle>Agreed Commercial Schedule & Pricing</CardTitle>
          <span className="text-xs font-mono text-slate-400">Currency: USD</span>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Line Item Description</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">List Price</th>
                <th className="py-3 px-3 text-center">Quantity</th>
                <th className="py-3 px-3 text-right">Discount</th>
                <th className="py-3 px-3 text-right">Net Price</th>
                <th className="py-3 px-3 text-right">Margin %</th>
                <th className="py-3 px-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {quotation.items?.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4 font-medium text-slate-100">
                    <div>{it.productName}</div>
                    <div className="text-[10px] font-mono text-slate-400">{it.sku}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{it.category || 'Software'}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">
                    {formatCurrency(it.listPrice)}
                  </td>
                  <td className="py-3 px-3 text-center font-mono">{it.quantity}</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">
                    {formatPercent(it.discountPercent)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-200">
                    {formatCurrency(it.netUnitPrice)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">
                    {formatPercent(it.marginPercent)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                    {formatCurrency(it.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Aggregation */}
        <div className="p-5 bg-slate-950/40 border-t border-slate-800 flex justify-end">
          <div className="w-full sm:w-80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Gross Catalog Subtotal:</span>
              <span className="font-mono text-slate-200">{formatCurrency(quotation.subtotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Contractual Discounts:</span>
              <span className="font-mono">-{formatCurrency(quotation.totalDiscountAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Blended Target Margin:</span>
              <span className="font-mono text-emerald-400">
                {formatPercent(quotation.blendedMarginPercent)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-bold text-white">
              <span>Total Contract Value:</span>
              <span className="font-mono text-indigo-300">{formatCurrency(quotation.grandTotal)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuotationDetailsPage;
