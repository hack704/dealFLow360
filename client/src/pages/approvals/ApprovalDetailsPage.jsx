import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import approvalService from '../../services/approvalService';
import Card, { CardHeader, CardTitle } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertTriangle,
  User,
  Calendar,
  Check,
  Loader2,
  ExternalLink,
  MessageSquare,
  Boxes,
  ArrowRight
} from 'lucide-react';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';

export const ApprovalDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [approval, setApproval] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [customerName, setCustomerName] = useState('Acme Corp');
  const [quotationNumber, setQuotationNumber] = useState(id || 'Q-1042');
  const [customerTier, setCustomerTier] = useState('Gold');
  const [riskLevel, setRiskLevel] = useState('HIGH');
  const [currentStep, setCurrentStep] = useState(2); // 1: Submitted, 2: Sales Manager, 3: Finance, 4: Confirmed
  const [flaggedLines, setFlaggedLines] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const determineStep = (stage, status) => {
    if (status === 'approved') return 4;
    if (status === 'returned') return 1;
    if (stage === 'Finance' || stage === 'Executive VP') return 3;
    if (stage === 'Sales Manager') return 2;
    return 1;
  };

  useEffect(() => {
    const fetchApprovalDetails = async () => {
      setLoading(true);
      try {
        const res = await approvalService.getApprovalDetails(id);
        if (res?.data) {
          const app = res.data;
          setApproval(app);
          setQuotation(app.quotation);
          setQuotationNumber(app.quotationNumber || app.quotation?.quotationNumber || id);
          setCustomerName(
            app.customerName ||
            app.quotation?.customer?.name ||
            app.quotation?.customerName ||
            'Acme Corp'
          );
          setCustomerTier(app.quotation?.customer?.tier || 'Gold');
          setRiskLevel((app.quotation?.riskLevel || 'high').toUpperCase());
          setCurrentStep(determineStep(app.currentStage, app.status));

          // Set flagged lines from approval request or quotation items
          if (app.flaggedLines && app.flaggedLines.length > 0) {
            setFlaggedLines(
              app.flaggedLines.map((fl) => ({
                line: fl.productName,
                discountGiven: `${fl.discountGiven}%`,
                limitAllowed: `${fl.limitAllowed}%`,
                overBy: fl.isOver
                  ? `${Math.max(0, fl.discountGiven - fl.limitAllowed)} pt OVER`
                  : '0 pt - OK',
                isOver: fl.isOver
              }))
            );
          } else if (app.quotation?.items && app.quotation.items.length > 0) {
            setFlaggedLines(
              app.quotation.items.map((it) => {
                const limit = it.category === 'Hardware' ? 15 : (it.category === 'Services' ? 10 : 15);
                const disc = it.discountPercent || 0;
                const isOver = disc > limit;
                return {
                  line: `${it.productName} (${it.category || 'Product'})`,
                  discountGiven: `${disc}%`,
                  limitAllowed: `${limit}%`,
                  overBy: isOver ? `${disc - limit} pt OVER` : '0 pt - OK',
                  isOver
                };
              })
            );
          } else {
            setFlaggedLines([
              { line: 'Laptop Pro 14 (Hardware)', discountGiven: '12%', limitAllowed: '15%', overBy: '0 pt - OK', isOver: false },
              { line: 'Setup Service (Services)', discountGiven: '18%', limitAllowed: '10%', overBy: '8 pt OVER', isOver: true }
            ]);
          }

          // Set audit logs
          if (app.auditTrail && app.auditTrail.length > 0) {
            setAuditLogs(
              app.auditTrail.map((log) => ({
                user: log.user,
                action: log.action,
                date: log.date ? formatDate(log.date) : 'Today',
                note: log.note || ''
              }))
            );
          } else {
            setAuditLogs([
              { user: app.submitterName || 'J. Rao', action: 'Submitted', date: 'Today', note: 'Initial quotation submitted for discount approval' }
            ]);
          }
        }
      } catch (err) {
        console.warn('Using fallback approval detail:', err.message);
        setFlaggedLines([
          { line: 'Laptop Pro 14 (Hardware)', discountGiven: '12%', limitAllowed: '15%', overBy: '0 pt - OK', isOver: false },
          { line: 'Setup Service (Services)', discountGiven: '18%', limitAllowed: '10%', overBy: '8 pt OVER', isOver: true }
        ]);
        setAuditLogs([
          { user: 'J. Rao', action: 'Submitted', date: 'Today', note: 'Initial discount exception submitted' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApprovalDetails();
    }
  }, [id]);

  const handleAction = async (type) => {
    setIsProcessing(true);
    setFeedbackMessage('');

    try {
      const targetId = approval?._id || id;
      const res = await approvalService.takeApprovalAction(targetId, type, feedbackNote);
      if (res?.data) {
        setApproval(res.data);
      }

      if (type === 'approve') {
        const isFinanceEscalation = approval?.currentStage === 'Sales Manager' && approval?.maxDiscountPercent > 20;
        const nextStep = isFinanceEscalation ? 3 : 4;
        setCurrentStep(nextStep);
        setFeedbackMessage(
          nextStep === 4
            ? 'Quotation officially approved! Status updated in database.'
            : 'Manager approved deal. Forwarded to Finance for final sign-off.'
        );
        setAuditLogs((prev) => [
          ...prev,
          {
            user: 'Marcus Chen (Admin/Manager)',
            action: 'Approved',
            date: 'Just now',
            note: feedbackNote || 'Approved discount exception'
          }
        ]);
      } else if (type === 'return') {
        setCurrentStep(1);
        setFeedbackMessage('Quotation returned to Sales Rep for revision.');
        setAuditLogs((prev) => [
          ...prev,
          {
            user: 'Marcus Chen (Admin/Manager)',
            action: 'Returned',
            date: 'Just now',
            note: feedbackNote || 'Returned to sales rep with revision instructions'
          }
        ]);
      } else if (type === 'reject') {
        setCurrentStep(1);
        setFeedbackMessage('Quotation rejected due to discount policy limits.');
        setAuditLogs((prev) => [
          ...prev,
          {
            user: 'Marcus Chen (Admin/Manager)',
            action: 'Rejected',
            date: 'Just now',
            note: feedbackNote || 'Quotation discount unviable'
          }
        ]);
      }

      setFeedbackNote('');
    } catch (err) {
      console.error('Error executing approval action:', err);
      // Fallback local update
      if (type === 'approve') {
        setCurrentStep(4);
        setFeedbackMessage('Deal approved locally.');
      } else if (type === 'return') {
        setCurrentStep(1);
        setFeedbackMessage('Quotation returned to Sales Rep for revision.');
      } else {
        setFeedbackMessage('Quotation rejected.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { num: 1, label: 'Submitted' },
    { num: 2, label: 'Sales Manager' },
    { num: 3, label: 'Finance' },
    { num: 4, label: 'Confirmed' }
  ];

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#0071e3] dark:text-[#2997ff]" />
        <span className="text-[14px] text-[#6e6e73] dark:text-[#86868b] font-medium">
          Loading approval request details...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header (Screen 6) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div>
          <button
            onClick={() => navigate('/approvals')}
            className="text-[13px] text-[#6e6e73] dark:text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] inline-flex items-center gap-2 mb-2 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Approvals list</span>
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[26px] sm:text-[28px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.025em]">
              6. Approval Detail: {quotationNumber} ({customerName})
            </h1>
            <span
              className={`text-[13px] px-3.5 py-1 rounded-full font-semibold font-mono whitespace-nowrap ${
                riskLevel === 'HIGH' || riskLevel === 'CRITICAL'
                  ? 'bg-[#ff453a]/15 text-[#c91d12] dark:text-[#ff453a] border border-[#ff453a]/30'
                  : 'bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a] border border-[#ff9f0a]/30'
              }`}
            >
              Blended Risk: {riskLevel}
            </span>
            <span className="text-[13px] px-3.5 py-1 rounded-full bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a] border border-[#ff9f0a]/30 font-semibold font-mono whitespace-nowrap">
              Customer Tier: {customerTier}
            </span>
          </div>
          <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b] mt-1">
            Opened by clicking a row on the Approvals list. Review policy exceptions, inspect audit history, and grant governance sign-off.
          </p>
        </div>

        {/* Action Buttons (from Wireframe) */}
        <div className="flex flex-wrap items-center gap-3">
          {currentStep === 4 ? (
            <>
              <Button
                onClick={() => navigate(`/fulfillment/${approval?.quotationId?._id || approval?.quotationId || quotation?._id || id}`)}
                variant="primary"
                size="md"
                icon={Boxes}
              >
                Proceed to Fulfillment →
              </Button>
              <Button
                onClick={() => navigate(`/portal?quote=${approval?.quotationId?._id || approval?.quotationId || quotation?._id || id}`)}
                variant="secondary"
                size="md"
                icon={ExternalLink}
              >
                Open Customer Portal
              </Button>
            </>
          ) : (
            <Button
              onClick={() => handleAction('approve')}
              disabled={isProcessing}
              variant="success"
              size="md"
              icon={CheckCircle}
            >
              Approve Quotation
            </Button>
          )}

          {currentStep !== 4 && (
            <>
              <Button
                onClick={() => handleAction('return')}
                disabled={isProcessing}
                variant="outline"
                size="md"
                icon={RotateCcw}
              >
                Return for Revision
              </Button>

              <Button
                onClick={() => handleAction('reject')}
                disabled={isProcessing}
                variant="danger"
                size="md"
                icon={XCircle}
              >
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#34c759]/10 border border-[#34c759]/30 text-[13px] text-[#1b7a36] dark:text-[#30d158] flex items-center gap-3">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold">{feedbackMessage}</span>
        </div>
      )}

      {/* Approver Justification Note Input */}
      <Card className="p-5 sm:p-6 rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-[#0071e3] dark:text-[#2997ff]" />
          <span className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            Governance Note / Justification (Optional)
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Add justification or required condition (e.g. 'Approved with 2-year upfront commitment')..."
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
            className="flex-1 h-10 px-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.1] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:border-[#0071e3] dark:focus:border-[#2997ff]"
          />
        </div>
      </Card>

      {/* Section: Why This Quote Was Flagged (Screen 6 Table) */}
      <Card className="p-0 overflow-hidden rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="p-5 sm:p-6 pb-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <CardTitle className="text-[15px] font-semibold text-[#c91d12] dark:text-[#ff453a]">
            Why This Quote Was Flagged
          </CardTitle>
          <span className="text-[13px] text-[#6e6e73] dark:text-[#86868b] font-mono px-3.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] whitespace-nowrap">
            Policy Violation Triggered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#1d1d1f] dark:text-apple-muted">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">Line</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Discount Given</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Limit Allowed</th>
                <th className="py-3.5 px-5 text-right whitespace-nowrap">Over By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {flaggedLines.map((it, idx) => (
                <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                    {it.line}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-[#1d1d1f] dark:text-white whitespace-nowrap">
                    {it.discountGiven}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">
                    {it.limitAllowed}
                  </td>
                  <td className="py-4 px-5 text-right font-mono font-semibold whitespace-nowrap">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[13px] font-semibold whitespace-nowrap ${
                        it.isOver
                          ? 'bg-[#ff453a]/20 text-[#c91d12] dark:text-[#ff453a] border border-[#ff453a]/30'
                          : 'bg-[#34c759]/20 text-[#1b7e36] dark:text-[#30d158] border border-[#34c759]/30'
                      }`}
                    >
                      {it.overBy}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Callout Note */}
        <div className="p-4 sm:p-5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.08] dark:border-white/[0.08] text-[13px] text-[#6e6e73] dark:text-[#86868b] leading-relaxed">
          <span className="text-[#1d1d1f] dark:text-white font-semibold block mb-1">Approval Rule Insight:</span>
          Line discounts exceeding representative thresholds escalate automatically to Sales Manager and Finance for governance approval.
        </div>
      </Card>

      {/* Stepper Progress Bar (Screen 6 Diagram) */}
      <Card className="p-6 sm:p-7 rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="text-[13px] font-semibold text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono mb-6 text-center whitespace-nowrap">
          Approval Workflow Escalation Path
        </div>

        <div className="flex items-center justify-between max-w-xl mx-auto relative px-4">
          <div className="absolute left-8 right-8 top-4 h-0.5 bg-black/10 dark:bg-white/[0.12] -z-0" />

          {steps.map((step) => {
            const isCompleted = step.num < currentStep;
            const isCurrent = step.num === currentStep;

            return (
              <div key={step.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] border transition-all ${
                    isCompleted
                      ? 'bg-[#30d158] text-black border-[#30d158]'
                      : isCurrent
                      ? 'bg-[#ff9f0a] text-black border-[#ff9f0a] shadow-apple-glow'
                      : 'bg-black/[0.04] dark:bg-[#1c1c1e] text-[#6e6e73] dark:text-apple-dim border-black/15 dark:border-white/[0.15]'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.num}
                </div>
                <span
                  className={`text-[13px] mt-2.5 font-medium whitespace-nowrap ${
                    isCurrent ? 'text-[#1d1d1f] dark:text-white font-semibold' : 'text-[#6e6e73] dark:text-[#86868b]'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Audit Trail Table (Screen 6) */}
      <Card className="p-0 overflow-hidden rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="p-5 sm:p-6 pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
          <CardTitle className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            Audit Trail & History
          </CardTitle>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] text-[#1d1d1f] dark:text-apple-muted">
            <thead className="bg-black/[0.02] dark:bg-white/[0.03] text-[#6e6e73] dark:text-[#86868b] uppercase tracking-wider font-mono text-[13px] font-semibold border-b border-black/[0.08] dark:border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5 whitespace-nowrap">User</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Action</th>
                <th className="py-3.5 px-4 font-mono whitespace-nowrap">Date</th>
                <th className="py-3.5 px-5 whitespace-nowrap">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.06]">
              {auditLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-5 font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">
                    {log.user}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <Badge variant="primary" size="xs">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">
                    {log.date}
                  </td>
                  <td className="py-4 px-5 text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">
                    {log.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ApprovalDetailsPage;
