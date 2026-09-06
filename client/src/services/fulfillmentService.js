import api from './api';

export const fulfillmentService = {
  getInventory: async () => {
    const res = await api.get('/fulfillment/inventory');
    return res.data;
  },

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
  },

  getWarehouses: async () => {
    const res = await api.get('/fulfillment/warehouses');
    return res.data;
  },

  createWarehouse: async (data) => {
    const res = await api.post('/fulfillment/warehouses', data);
    return res.data;
  },

  updateWarehouse: async (id, data) => {
    const res = await api.put(`/fulfillment/warehouses/${id}`, data);
    return res.data;
  }
};

export default fulfillmentService;
