import api from './api';

export const quotationService = {
  calculatePreview: async (payload) => {
    const res = await api.post('/quotations/preview', payload);
    return res.data;
  },

  createQuotation: async (payload) => {
    const res = await api.post('/quotations', payload);
    return res.data;
  },

  getQuotations: async (params = {}) => {
    const res = await api.get('/quotations', { params });
    return res.data;
  },

  getQuotationById: async (id) => {
    const res = await api.get(`/quotations/${id}`);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await api.patch(`/quotations/${id}/status`, { status });
    return res.data;
  }
};

export default quotationService;
