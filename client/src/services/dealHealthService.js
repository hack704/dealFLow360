import api from './api';

export const dealHealthService = {
  getDealHealthList: async () => {
    const res = await api.get('/deal-health');
    return res.data;
  },

  takeCorrectiveAction: async (id, actionType, note = '') => {
    const res = await api.post(`/deal-health/${id}/action`, { actionType, note });
    return res.data;
  }
};

export default dealHealthService;
