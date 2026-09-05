import api from './api';

export const productService = {
  getProducts: async (category = '') => {
    const params = category ? { category } : {};
    const res = await api.get('/products', { params });
    return res.data;
  },

  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  }
};

export default productService;
