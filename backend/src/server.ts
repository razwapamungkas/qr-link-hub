import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { register, login, me } from './controllers/authController.js';
import {
  createQRCode,
  getUserQRCodes,
  getQRCodeById,
  updateQRCode,
  deleteQRCode,
  getQRAnalytics
} from './controllers/qrController.js';
import { handleRedirect, getPublicQRInfo } from './controllers/redirectController.js';
import { authenticateToken } from './middleware/auth.js';
import { getDb } from './db.js';

import os from 'os';

export function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'QRFY Link Hub Backend',
    localIp: getLocalIpAddress(),
    timestamp: new Date().toISOString()
  });
});

// Auth Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', authenticateToken, me);

// QR Code Protected Routes
app.post('/api/qrcodes', authenticateToken, createQRCode);
app.get('/api/qrcodes', authenticateToken, getUserQRCodes);
app.get('/api/qrcodes/:id', authenticateToken, getQRCodeById);
app.put('/api/qrcodes/:id', authenticateToken, updateQRCode);
app.delete('/api/qrcodes/:id', authenticateToken, deleteQRCode);
app.get('/api/qrcodes/:id/analytics', authenticateToken, getQRAnalytics);

// Public Routes & Redirect Handler
app.get('/api/public/qr/:shortCode', getPublicQRInfo);
app.get('/r/:shortCode', handleRedirect);

// Initialize DB and start server
getDb().then(() => {
  console.log('Database initialized successfully.');
  app.listen(PORT, () => {
    console.log(`QRFY Hub Backend running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
});
