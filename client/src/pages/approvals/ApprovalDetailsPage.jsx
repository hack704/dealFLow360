import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Check
} from 'lucide-react';

export const ApprovalDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(2); // 1: Submitted, 2: Sales Manager, 3: Finance, 4: Confirmed
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Wireframe Screen 6 Flagged Lines
  const flaggedLines = [
    { line: 'Laptop (Hardware)', discountGiven: '12%', limitAllowed: '15%', overBy: '0 pt - OK', isOver: false },
    { line: 'Setup Service (Services)', discountGiven: '18%', limitAllowed: '10%', overBy: '8 pt OVER', isOver: true }
  ];

  // Wireframe Screen 6 Audit Trail
  const [auditLogs, setAuditLogs] = useState([
    { user: 'J. Rao', action: 'Submitted', date: 'Aug 20', note: 'Initial 12% discount' },
    { user: 'M. Shah', action: 'Returned', date: 'Aug 21', note: 'Requested justification' },
    { user: 'J. Rao', action: 'Resubmitted', date: 'Aug 22', note: 'Added margin note' }
  ]);

  const handleAction = (type) => {
    if (type === 'approve') {
      setCurrentStep(3);
      setFeedbackMessage('Manager approved deal. Forwarded to Finance for final sign-off.');
      setAuditLogs([
        ...auditLogs,
        { user: 'M. Shah', action: 'Approved', date: 'Today', note: 'Strategic account exception approved' }
      ]);
    } else if (type === 'return') {
      setCurrentStep(1);
      setFeedbackMessage('Quotation returned to Sales Rep for revision.');
      setAuditLogs([
        ...auditLogs,
        { user: 'M. Shah', action: 'Returned', date: 'Today', note: 'Please renegotiate services line discount' }
      ]);
    } else if (type === 'reject') {
      setFeedbackMessage('Quotation rejected due to severe margin erosion.');
      setAuditLogs([
        ...auditLogs,
        { user: 'M. Shah', action: 'Rejected', date: 'Today', note: 'Discount depth unviable' }
      ]);
    }
  };

  const steps = [
    { num: 1, label: 'Submitted' },
    { num: 2, label: 'Sales Manager' },
    { num: 3, label: 'Finance' },
    { num: 4, label: 'Confirmed' }
  ];

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
              6. Approval Detail: {id || 'Q-1042'} (Acme Corp)
            </h1>
            <span className="text-[13px] px-3.5 py-1 rounded-full bg-[#ff453a]/15 text-[#c91d12] dark:text-[#ff453a] border border-[#ff453a]/30 font-semibold font-mono whitespace-nowrap">
              Blended Risk: HIGH
            </span>
            <span className="text-[13px] px-3.5 py-1 rounded-full bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a] border border-[#ff9f0a]/30 font-semibold font-mono whitespace-nowrap">
              Customer Tier: Gold
            </span>
          </div>
          <p className="text-[13px] sm:text-[14px] text-[#6e6e73] dark:text-[#86868b] mt-1">
            Opened by clicking a row on the Approvals list
          </p>
        </div>

        {/* Action Buttons (from Wireframe) */}
        <div className="flex items-center space-x-3">
          <Button onClick={() => handleAction('approve')} variant="success" size="md" icon={CheckCircle}>
            Approve
          </Button>

          <Button onClick={() => handleAction('return')} variant="outline" size="md" icon={RotateCcw}>
            Return for Revision
          </Button>

          <Button onClick={() => handleAction('reject')} variant="danger" size="md" icon={XCircle}>
            Reject
          </Button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.12] text-[13px] text-[#1d1d1f] dark:text-white flex items-center gap-3">
          <AlertTriangle className="w-4.5 h-4.5 text-[#ff9f0a] shrink-0" />
          <span className="font-medium">{feedbackMessage}</span>
        </div>
      )}

      {/* Section: Why This Quote Was Flagged (Screen 6 Table) */}
      <Card className="p-0 overflow-hidden rounded-[22px] bg-white/80 dark:bg-[#161618]/80 border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl shadow-sm dark:shadow-apple-card">
        <div className="p-5 sm:p-6 pb-4 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <CardTitle className="text-[15px] font-semibold text-[#c91d12] dark:text-[#ff453a]">Why This Quote Was Flagged</CardTitle>
          <span className="text-[13px] text-[#6e6e73] dark:text-[#86868b] font-mono px-3.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] whitespace-nowrap">Policy Violation Triggered</span>
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
                  <td className="py-4 px-5 font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">{it.line}</td>
                  <td className="py-4 px-4 text-right font-mono text-[#1d1d1f] dark:text-white whitespace-nowrap">{it.discountGiven}</td>
                  <td className="py-4 px-4 text-right font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">{it.limitAllowed}</td>
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

        {/* Callout Note (from Wireframe) */}
        <div className="p-4 sm:p-5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.08] dark:border-white/[0.08] text-[13px] text-[#6e6e73] dark:text-[#86868b] leading-relaxed">
          <span className="text-[#1d1d1f] dark:text-white font-semibold block mb-1">Approval Rule Insight:</span>
          Worst single line (8pt over) plus overall pattern across the order sets the blended score. One bad line is enough to require approval.
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
          <CardTitle className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Audit Trail & History</CardTitle>
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
                  <td className="py-4 px-5 font-semibold text-[#1d1d1f] dark:text-white whitespace-nowrap">{log.user}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <Badge variant="primary" size="xs">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 font-mono text-[#6e6e73] dark:text-[#86868b] whitespace-nowrap">{log.date}</td>
                  <td className="py-4 px-5 text-[#1d1d1f] dark:text-[#f5f5f7] whitespace-nowrap">{log.note}</td>
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
