// Frontend Constants for DealFlow360

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const QUOTATION_STATUSES = {
  draft: { label: 'Draft', color: 'bg-slate-700/60 text-slate-300 border-slate-600' },
  pending_approval: { label: 'Pending Approval', color: 'bg-amber-950/60 text-amber-300 border-amber-800' },
  approved: { label: 'Approved', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-800' },
  rejected: { label: 'Rejected', color: 'bg-rose-950/60 text-rose-300 border-rose-800' },
  sent_to_customer: { label: 'Sent to Customer', color: 'bg-blue-950/60 text-blue-300 border-blue-800' },
  accepted: { label: 'Accepted', color: 'bg-teal-950/60 text-teal-300 border-teal-800' },
  expired: { label: 'Expired', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' }
};

export const RISK_LEVELS = {
  low: { label: 'Low Risk', badgeColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60' },
  moderate: { label: 'Moderate Risk', badgeColor: 'text-amber-400 bg-amber-950/50 border-amber-800/60' },
  high: { label: 'High Risk', badgeColor: 'text-orange-400 bg-orange-950/50 border-orange-800/60' },
  critical: { label: 'Critical Risk', badgeColor: 'text-rose-400 bg-rose-950/50 border-rose-800/60' }
};

export const ROLES = {
  sales_rep: 'Sales Rep',
  sales_manager: 'Sales Manager',
  finance: 'Finance & Legal',
  customer: 'Customer',
  admin: 'Administrator'
};
