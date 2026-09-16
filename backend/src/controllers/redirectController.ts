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

export async function handleRedirect(req: Request, res: Response): Promise<void> {
  try {
    const { shortCode } = req.params;
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
          custom_data: JSON.parse(qr.custom_data || '{}'),
          style_config: JSON.parse(qr.style_config || '{}')
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
    const hostHeader = req.headers.host || 'localhost:5000';
    const hostname = hostHeader.split(':')[0];
    const frontendBase = process.env.FRONTEND_URL || `http://${hostname}:5173`;

    res.redirect(302, `${frontendBase}/#/p/${shortCode}`);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send('Internal Server Error');
  }
}

export async function getPublicQRInfo(req: Request, res: Response): Promise<void> {
  try {
    const { shortCode } = req.params;
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
        custom_data: JSON.parse(qr.custom_data || '{}'),
        style_config: JSON.parse(qr.style_config || '{}')
      }
    });
  } catch (error) {
    console.error('Public QR info error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
