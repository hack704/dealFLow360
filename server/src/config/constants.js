// System-wide constants for DealFlow360

const ROLES = {
  SALES_REP: 'sales_rep',
  SALES_MANAGER: 'sales_manager',
  FINANCE: 'finance',
  CUSTOMER: 'customer',
  ADMIN: 'admin'
};

const QUOTATION_STATUSES = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SENT_TO_CUSTOMER: 'sent_to_customer',
  NEGOTIATION: 'negotiation',
  ACCEPTED: 'accepted',
  CONFIRMED: 'confirmed',
  EXPIRED: 'expired'
};

const DEAL_STAGES = {
  QUALIFICATION: 'qualification',
  PROPOSAL_DEVELOPMENT: 'proposal_development',
  INTERNAL_APPROVAL: 'internal_approval',
  NEGOTIATION: 'negotiation',
  CLOSED_WON: 'closed_won',
  CLOSED_LOST: 'closed_lost'
};

const PRICING_TYPES = {
  ONE_TIME: 'one_time',
  RECURRING_MONTHLY: 'recurring_monthly',
  RECURRING_ANNUAL: 'recurring_annual',
  USAGE_BASED: 'usage_based'
};

const RISK_LEVELS = {
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  CRITICAL: 'critical'
};

const APPROVAL_THRESHOLDS = {
  MAX_REP_DISCOUNT_PERCENT: 15,
  MAX_MANAGER_DISCOUNT_PERCENT: 25,
  MIN_ACCEPTABLE_MARGIN_PERCENT: 20
};

module.exports = {
  ROLES,
  QUOTATION_STATUSES,
  DEAL_STAGES,
  PRICING_TYPES,
  RISK_LEVELS,
  APPROVAL_THRESHOLDS
};
