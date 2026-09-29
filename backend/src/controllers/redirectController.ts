import { Request, Response } from 'express';
import { getDb } from '../db.js';

function parseUserAgent(ua: string | undefined): { device_type: string; os: string; browser: string } {
  if (!ua) return { device_type: 'Desktop', os: 'Unknown', browser: 'Unknown' };

  let device_type = 'Desktop';
  if (/mobile/i.test(ua)) device_type = 'Mobile';
  else if (/tablet|ipad/i.test(ua)) device_type = 'Tablet';

  let os = 'Unknown OS';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = 'Unknown Browser';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/firefox/i.test(ua)) browser = 'Firefox';

  return { device_type, os, browser };
}

export function safeJsonParse(data: any, fallback = {}): any {
  if (typeof data === 'object' && data !== null) return data;
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (typeof parsed === 'string') return safeJsonParse(parsed, fallback);
      return parsed || fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export async function handleRedirect(req: Request, res: Response): Promise<void> {
  try {
    const { shortCode } = req.params;

    const hostHeader = req.headers.host || 'localhost:3001';
    const hostname = hostHeader.split(':')[0];
    const frontendPort = process.env.FRONTEND_PORT || '5173';
    const frontendBase = process.env.FRONTEND_URL || `http://${hostname}:${frontendPort}`;

    // Support live preview scanning during creation
    if (shortCode === 'preview') {
      const typeQuery = (req.query.type as string) || 'vcard';
      res.redirect(302, `${frontendBase}/#/p/preview?type=${typeQuery}`);
      return;
    }

    const db = await getDb();
    const qr = await db.get('SELECT * FROM qrcodes WHERE short_code = ?', [shortCode]);

    if (!qr) {
      res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>QR Code Not Found</title><style>body{font-family:sans-serif;display:flex;height:100vh;align-items:center;justify-content:center;background:#0f172a;color:#fff;}</style></head>
        <body>
          <div style="text-align:center">
            <h1 style="font-size:3rem;margin-bottom:0.5rem">404</h1>
            <p style="color:#94a3b8">QR Code not found or has been removed.</p>
          </div>
        </body>
        </html>
      `);
      return;
    }

    if (!qr.is_active) {
      res.status(410).send(`
        <!DOCTYPE html>
        <html>
        <head><title>QR Code Inactive</title><style>body{font-family:sans-serif;display:flex;height:100vh;align-items:center;justify-content:center;background:#0f172a;color:#fff;}</style></head>
        <body>
          <div style="text-align:center">
            <h1 style="color:#ef4444;font-size:2.5rem;margin-bottom:0.5rem">QR Code Paused</h1>
            <p style="color:#94a3b8">This QR Code is currently inactive or disabled by its owner.</p>
          </div>
        </body>
        </html>
      `);
      return;
    }

    // Log scan analytics
    const userAgentStr = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const { device_type, os, browser } = parseUserAgent(userAgentStr);
    const scanId = 'scn_' + Math.random().toString(36).substring(2, 11);

    await db.run(
      'INSERT INTO scans (id, qrcode_id, user_agent, ip_address, device_type, os, browser) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [scanId, qr.id, userAgentStr, ipAddress, device_type, os, browser]
    );

    await db.run('UPDATE qrcodes SET scan_count = scan_count + 1 WHERE id = ?', [qr.id]);

    // Check format request: if JSON requested (e.g. from frontend API), return object
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      res.json({
        qrcode: {
          ...qr,
          custom_data: safeJsonParse(qr.custom_data),
          style_config: safeJsonParse(qr.style_config)
        }
      });
      return;
    }

    // Direct redirect for URL and WhatsApp types
    if (qr.type === 'url' || qr.type === 'whatsapp') {
      let redirectUrl = qr.target_url;
      if (qr.type === 'url') {
        if (!/^https?:\/\//i.test(redirectUrl)) {
          redirectUrl = 'https://' + redirectUrl;
        }
      }
      res.redirect(302, redirectUrl);
      return;
    }

    // For landing page types (vcard, biolink, wifi), redirect to Frontend Public View route
    res.redirect(302, `${frontendBase}/#/p/${shortCode}`);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Internal Server Error');
  }
}

export async function getPublicQRInfo(req: Request, res: Response): Promise<void> {
  try {
    const { shortCode } = req.params;
    const typeQuery = (req.query.type as string) || '';

    if (shortCode === 'preview') {
      const isBio = typeQuery === 'biolink';
      res.json({
        qrcode: {
          id: 'preview',
          title: isBio ? 'Pratinjau Bio Link' : 'Pratinjau vCard Plus',
          type: isBio ? 'biolink' : 'vcard',
          short_code: 'preview',
          target_url: 'https://qrfy.com',
          is_active: 1,
          custom_data: isBio ? {
            name: 'Sarah Connor',
            bio: 'Digital Creator & Product Strategist',
            avatarUrl: '',
            links: [
              { id: '1', title: 'Website Portfolio', url: 'https://sarah.example.com' },
              { id: '2', title: 'Kanal YouTube', url: 'https://youtube.com' }
            ],
            socials: [
              { platform: 'Instagram', url: 'https://instagram.com' }
            ]
          } : {
            firstName: 'Alex',
            lastName: 'Morgan',
            jobTitle: 'Creative Director',
            company: 'Nexus Innovations',
            phone: '+1 (555) 234-5678',
            email: 'alex.m@example.com',
            website: 'https://nexus.example.com',
            address: 'San Francisco, CA',
            avatarUrl: '',
            bio: 'Pratinjau Kartu Nama Digital vCard Plus.'
          },
          style_config: {}
        }
      });
      return;
    }

    const db = await getDb();
    const qr = await db.get('SELECT * FROM qrcodes WHERE short_code = ?', [shortCode]);

    if (!qr) {
      res.status(404).json({ error: 'QR Code not found' });
      return;
    }

    if (!qr.is_active) {
      res.status(410).json({ error: 'QR Code is inactive' });
      return;
    }

    res.json({
      qrcode: {
        id: qr.id,
        title: qr.title,
        type: qr.type,
        short_code: qr.short_code,
        target_url: qr.target_url,
        is_active: qr.is_active,
        custom_data: safeJsonParse(qr.custom_data),
        style_config: safeJsonParse(qr.style_config)
      }
    });
  } catch (error) {
    console.error('Public QR info error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
