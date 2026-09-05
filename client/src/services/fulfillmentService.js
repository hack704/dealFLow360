import api from './api';

export const fulfillmentService = {
  getFulfillmentList: async () => {
    const res = await api.get('/fulfillment');
    return res.data;
  },

  getFulfillmentDetail: async (id) => {
    const res = await api.get(`/fulfillment/${id}`);
    return res.data;
  },

  confirmSplit: async (id, splits) => {
    const res = await api.post(`/fulfillment/${id}/confirm-split`, { splits });
    return res.data;
  }
};

export default fulfillmentService;
