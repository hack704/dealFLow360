import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dealflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth expiration & auto-recovery
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Transparent re-authentication with demo credentials
        const loginRes = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'admin@dealflow360.com',
          password: 'password123'
        });
        if (loginRes.data && loginRes.data.data && loginRes.data.data.token) {
          const newToken = loginRes.data.data.token;
          localStorage.setItem('dealflow_token', newToken);
          localStorage.setItem('dealflow_user', JSON.stringify(loginRes.data.data));
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (reAuthErr) {
        console.warn('[API] Auto re-auth failed:', reAuthErr.message);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
