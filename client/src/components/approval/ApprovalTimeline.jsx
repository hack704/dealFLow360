import React from 'react';
import { CheckCircle2, Clock, XCircle, RotateCcw } from 'lucide-react';

const STEP_ICONS = {
  Submitted: Clock,
  'Sales Manager': CheckCircle2,
  Finance: CheckCircle2,
  Approved: CheckCircle2,
  Returned: RotateCcw,
  Rejected: XCircle
};

const STEP_COLORS = {
  approved: 'text-[#30d158] bg-[#30d158]/15 border-[#30d158]/30',
  pending:  'text-[#ff9f0a] bg-[#ff9f0a]/15 border-[#ff9f0a]/30',
  returned: 'text-[#ff9f0a] bg-[#ff9f0a]/15 border-[#ff9f0a]/30',
  rejected: 'text-[#ff453a] bg-[#ff453a]/15 border-[#ff453a]/30',
  inactive: 'text-[#86868b] bg-white/[0.05] border-white/[0.12]'
};

export const ApprovalTimeline = ({ auditTrail = [], currentStage, status }) => {
  const stages = ['Submitted', 'Sales Manager', 'Finance', 'Approved'];

  return (
    <div className="flex flex-col gap-3">
      {/* Audit Trail */}
      {auditTrail.length > 0 && (
        <div className="flex flex-col gap-2">
          {auditTrail.map((entry, i) => {
            const Icon = STEP_ICONS[entry.action] || Clock;
            const colorKey =
              entry.action === 'Approved' ? 'approved' :
              entry.action === 'Rejected' ? 'rejected' :
              entry.action === 'Returned' ? 'returned' : 'pending';

            return (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${STEP_COLORS[colorKey]}`}>
                  <Icon size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-[#f5f5f7]">
                    <span className="text-[#86868b]">{entry.user}</span> — {entry.action}
                  </p>
                  {entry.note && (
                    <p className="text-[12px] text-[#86868b] leading-snug">{entry.note}</p>
                  )}
                  {entry.date && (
                    <p className="text-[11px] text-[#555]">
                      {new Date(entry.date).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stage Progress Bar */}
      <div className="mt-2 flex items-center gap-0">
        {stages.map((stage, i) => {
          const isActive = stage === currentStage;
          const isPast = auditTrail.some(e => e.action === stage || e.action === 'Approved');
          const isDone = status === 'approved' && stage === 'Approved';

          const stageColor =
            isDone || (isPast && !isActive) ? STEP_COLORS.approved :
            isActive ? STEP_COLORS.pending :
            STEP_COLORS.inactive;

          return (
            <React.Fragment key={stage}>
              <div className={`relative flex items-center justify-center rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${stageColor}`}>
                {stage}
              </div>
              {i < stages.length - 1 && (
                <div className="h-px flex-1 bg-white/10 mx-1" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ApprovalTimeline;
