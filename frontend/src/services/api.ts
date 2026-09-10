import axios from 'axios';

// The backend development server uses port 3001. When the app is opened
// through a LAN address, use that same address so a phone can scan QR codes.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:3001/api`;

export const getPublicQRUrl = (shortCode: string) => {
  const configuredBase = import.meta.env.VITE_QR_BASE_URL?.replace(/\/$/, '');
  if (configuredBase) return `${configuredBase}/r/${shortCode}`;

  const apiUrl = new URL(API_BASE_URL);
  return `${apiUrl.protocol}//${apiUrl.host}/r/${shortCode}`;
};

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
