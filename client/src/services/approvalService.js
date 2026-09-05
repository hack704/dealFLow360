import api from './api';

export const approvalService = {
  getApprovalsQueue: async (params = {}) => {
    const res = await api.get('/approvals', { params });
    return res.data;
  },

  getApprovalDetails: async (id) => {
    const res = await api.get(`/approvals/${id}`);
    return res.data;
  },

  submitForApproval: async (quotationId) => {
    const res = await api.post('/approvals/submit', { quotationId });
    return res.data;
  },

  takeApprovalAction: async (id, action, note = '') => {
    const res = await api.post(`/approvals/${id}/action`, { action, note });
    return res.data;
  }
};

export default approvalService;
