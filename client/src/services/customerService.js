import api from './api';

export const customerService = {
  getCustomers: async () => {
    const res = await api.get('/customers');
    return res.data;
  },

  getCustomerById: async (id) => {
    const res = await api.get(`/customers/${id}`);
    return res.data;
  }
};

export default customerService;
