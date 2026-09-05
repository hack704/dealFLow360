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
  }
};

export default billingService;
