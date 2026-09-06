import api from './api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data && res.data.data) {
      localStorage.setItem('dealflow_token', res.data.data.token);
      localStorage.setItem('dealflow_user', JSON.stringify(res.data.data));
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data && res.data.data) {
      localStorage.setItem('dealflow_token', res.data.data.token);
      localStorage.setItem('dealflow_user', JSON.stringify(res.data.data));
    }
    return res.data;
  },

  loginWithMagicLink: async (email = 'procurement@acme.com', quotationNumber = 'Q-1042') => {
    const res = await api.post('/auth/magic-link', { email, quotationNumber });
    if (res.data && res.data.data) {
      localStorage.setItem('dealflow_token', res.data.data.token);
      localStorage.setItem('dealflow_user', JSON.stringify(res.data.data));
    }
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('dealflow_token');
    localStorage.removeItem('dealflow_user');
  }
};

export default authService;
