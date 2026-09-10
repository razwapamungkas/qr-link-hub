import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization header if token exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qrfy_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const qrService = {
  create: (data: { title: string; type: string; target_url: string; custom_data?: any; style_config?: any }) =>
    api.post('/qrcodes', data),
  getUserQRCodes: () => api.get('/qrcodes'),
  getById: (id: string) => api.get(`/qrcodes/${id}`),
  update: (id: string, data: { title?: string; target_url?: string; custom_data?: any; style_config?: any; is_active?: boolean }) =>
    api.put(`/qrcodes/${id}`, data),
  delete: (id: string) => api.delete(`/qrcodes/${id}`),
  getAnalytics: (id: string) => api.get(`/qrcodes/${id}/analytics`),
  getPublicQR: (shortCode: string) => api.get(`/public/qr/${shortCode}`)
};
