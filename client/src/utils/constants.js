// Frontend Constants for DealFlow360

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const QUOTATION_STATUSES = {
  draft: { label: 'Draft', color: 'bg-black/[0.04] dark:bg-white/[0.08] text-[#6e6e73] dark:text-[#86868b] border-black/[0.08] dark:border-white/[0.12]' },
  pending_approval: { label: 'Pending Approval', color: 'bg-[#ff9f0a]/10 dark:bg-[#ff9f0a]/15 text-[#9e5200] dark:text-[#ff9f0a] border-[#ff9f0a]/30' },
  approved: { label: 'Approved', color: 'bg-[#34c759]/10 dark:bg-[#30d158]/15 text-[#1b7a36] dark:text-[#30d158] border-[#34c759]/30' },
  rejected: { label: 'Rejected', color: 'bg-[#ff453a]/10 dark:bg-[#ff453a]/15 text-[#c9342c] dark:text-[#ff453a] border-[#ff453a]/30' },
  sent_to_customer: { label: 'Sent to Customer', color: 'bg-[#0071e3]/10 dark:bg-[#2997ff]/15 text-[#0071e3] dark:text-[#2997ff] border-[#0071e3]/30' },
  accepted: { label: 'Accepted', color: 'bg-[#34c759]/10 dark:bg-[#30d158]/15 text-[#1b7a36] dark:text-[#30d158] border-[#34c759]/30' },
  expired: { label: 'Expired', color: 'bg-black/[0.06] dark:bg-white/[0.08] text-[#86868b] dark:text-[#86868b] border-black/[0.1] dark:border-white/[0.12]' }
};

export const RISK_LEVELS = {
  low: { label: 'Low Risk', badgeColor: 'text-[#1b7a36] dark:text-[#30d158] bg-[#34c759]/10 dark:bg-[#30d158]/15 border-[#34c759]/30' },
  moderate: { label: 'Moderate Risk', badgeColor: 'text-[#9e5200] dark:text-[#ff9f0a] bg-[#ff9f0a]/10 dark:bg-[#ff9f0a]/15 border-[#ff9f0a]/30' },
  high: { label: 'High Risk', badgeColor: 'text-[#c9342c] dark:text-[#ff453a] bg-[#ff453a]/10 dark:bg-[#ff453a]/15 border-[#ff453a]/30' },
  critical: { label: 'Critical Risk', badgeColor: 'text-[#c9342c] dark:text-[#ff453a] bg-[#ff453a]/15 dark:bg-[#ff453a]/25 border-[#ff453a]/40 font-bold' }
};

export const ROLES = {
  sales_rep: 'Sales Rep',
  sales_manager: 'Sales Manager',
  finance: 'Finance & Legal',
  customer: 'Customer',
  admin: 'Administrator'
};
