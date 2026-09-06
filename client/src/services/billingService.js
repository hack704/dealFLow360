import api from './api';

export const billingService = {
  getInvoices: async (params = {}) => {
    const res = await api.get('/billing/invoices', { params });
    return res.data;
  },

  getInvoiceById: async (id) => {
    const res = await api.get(`/billing/invoices/${id}`);
    return res.data;
  },

  recordPayment: async (id, paymentData = {}) => {
    const res = await api.post(`/billing/invoices/${id}/pay`, paymentData);
    return res.data;
  },

  getSubscriptions: async (params = {}) => {
    const res = await api.get('/billing/subscriptions', { params });
    return res.data;
  },

  getSubscriptionById: async (id) => {
    const res = await api.get(`/billing/subscriptions/${id}`);
    return res.data;
  },

  calculateProrationPreview: async (data) => {
    const res = await api.post('/billing/proration-preview', data);
    return res.data;
  },

  updateSubscription: async (id, data) => {
    const res = await api.put(`/billing/subscriptions/${id}`, data);
    return res.data;
  },

  pauseSubscription: async (id, reason = 'Temporary seasonal suspension / hold') => {
    const res = await api.post(`/billing/subscriptions/${id}/pause`, { reason });
    return res.data;
  },

  resumeSubscription: async (id) => {
    const res = await api.post(`/billing/subscriptions/${id}/resume`);
    return res.data;
  },

  getReturnPolicyRules: async () => {
    const res = await api.get('/billing/subscriptions/return-policy');
    return res.data;
  },

  cancelSubscription: async (id, reason = 'Cancelled by administrator', refundPercent) => {
    const res = await api.post(`/billing/subscriptions/${id}/cancel`, { reason, refundPercent });
    return res.data;
  },

  deleteSubscription: async (id) => {
    const res = await api.delete(`/billing/subscriptions/${id}`);
    return res.data;
  },

  generateBilling: async (quotationId) => {
    const res = await api.post(`/billing/generate/${quotationId}`);
    return res.data;
  },

  // Recurring Plans & Attachments (Requirement A5)
  getRecurringPlans: async () => {
    const res = await api.get('/billing/plans');
    return res.data;
  },

  createRecurringPlan: async (planData) => {
    const res = await api.post('/billing/plans', planData);
    return res.data;
  },

  updateRecurringPlan: async (id, planData) => {
    const res = await api.put(`/billing/plans/${id}`, planData);
    return res.data;
  },

  deleteRecurringPlan: async (id) => {
    const res = await api.delete(`/billing/plans/${id}`);
    return res.data;
  },

  attachPlanToProducts: async (id, productIds) => {
    const res = await api.post(`/billing/plans/${id}/attach`, { productIds });
    return res.data;
  },

  saveProrationAndCancellationRules: async (rulesData) => {
    const res = await api.put('/billing/rules', rulesData);
    return res.data;
  }
};

export default billingService;
