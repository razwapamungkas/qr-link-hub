import axios from 'axios';
import { useState, useEffect } from 'react';

// The backend development server uses port 3001.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:3001/api`;

let serverLocalIp: string | null = null;
const listeners = new Set<() => void>();

export const fetchServerHealth = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/health`);
    if (res.data?.localIp && res.data.localIp !== 'localhost') {
      serverLocalIp = res.data.localIp;
      listeners.forEach((fn) => fn());
    }
  } catch (e) {
    console.error('Health check error:', e);
  }
};

fetchServerHealth();

export const subscribeServerIp = (callback: () => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

export const getServerLocalIp = () => serverLocalIp;

export function useServerIp() {
  const [ip, setIp] = useState<string | null>(serverLocalIp);

  useEffect(() => {
    fetchServerHealth();
    return subscribeServerIp(() => {
      setIp(serverLocalIp);
    });
  }, []);

  return ip;
}

export const getPublicQRUrl = (shortCode: string, type?: string, customHost?: string) => {
  const configuredBase = import.meta.env.VITE_QR_BASE_URL?.replace(/\/$/, '');
  const query = type ? `?type=${type}` : '';

  if (configuredBase) {
    return `${configuredBase}/r/${shortCode}${query}`;
  }

  let host = customHost || window.location.hostname;
  if ((host === 'localhost' || host === '127.0.0.1') && serverLocalIp) {
    host = serverLocalIp;
  }

  return `${window.location.protocol}//${host}:3001/r/${shortCode}${query}`;
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
