import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Create axios instance
const api = axios.create({
  baseURL: API_URL
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

// API methods
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout')
};

export const userAPI = {
  saveEmergencyPlan: (plan_data) => api.post('/api/user/emergency-plan', { plan_data }),
  getEmergencyPlan: () => api.get('/api/user/emergency-plan'),
  saveChecklist: (checklist_data) => api.post('/api/user/checklist', { checklist_data }),
  getChecklist: () => api.get('/api/user/checklist')
};
