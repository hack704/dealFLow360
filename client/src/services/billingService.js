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

  cancelSubscription: async (id, reason = 'Cancelled by administrator') => {
    const res = await api.post(`/billing/subscriptions/${id}/cancel`, { reason });
    return res.data;
  },

  deleteSubscription: async (id) => {
    const res = await api.delete(`/billing/subscriptions/${id}`);
    return res.data;
  },

  generateBilling: async (quotationId) => {
    const res = await api.post(`/billing/generate/${quotationId}`);
    return res.data;
  }
};

export default billingService;
