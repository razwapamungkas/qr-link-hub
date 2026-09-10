import { Response } from 'express';
import { getDb } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';

function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createQRCode(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, type, target_url, custom_data, style_config } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!title || !type || !target_url) {
      res.status(400).json({ error: 'Title, type, and target_url are required' });
      return;
    }

    const db = await getDb();
    
    // Ensure unique short code
    let shortCode = generateShortCode();
    let existing = await db.get('SELECT id FROM qrcodes WHERE short_code = ?', [shortCode]);
    while (existing) {
      shortCode = generateShortCode();
      existing = await db.get('SELECT id FROM qrcodes WHERE short_code = ?', [shortCode]);
    }

    const qrId = 'qr_' + Math.random().toString(36).substring(2, 11);
    const customDataStr = typeof custom_data === 'string' ? custom_data : JSON.stringify(custom_data || {});
    const styleConfigStr = typeof style_config === 'string' ? style_config : JSON.stringify(style_config || {});

    await db.run(
      `INSERT INTO qrcodes (id, user_id, title, type, short_code, target_url, custom_data, style_config, is_active, scan_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)`,
      [qrId, userId, title, type, shortCode, target_url, customDataStr, styleConfigStr]
    );

    const createdQR = await db.get('SELECT * FROM qrcodes WHERE id = ?', [qrId]);

    res.status(201).json({
      message: 'QR code created successfully',
      qrcode: {
        ...createdQR,
        custom_data: JSON.parse(createdQR.custom_data || '{}'),
        style_config: JSON.parse(createdQR.style_config || '{}')
      }
    });
  } catch (error) {
    console.error('Error creating QR code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getUserQRCodes(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const db = await getDb();
    const qrcodes = await db.all('SELECT * FROM qrcodes WHERE user_id = ? ORDER BY created_at DESC', [userId]);

    const formatted = qrcodes.map((qr) => ({
      ...qr,
      custom_data: JSON.parse(qr.custom_data || '{}'),
      style_config: JSON.parse(qr.style_config || '{}')
    }));

    res.json({ qrcodes: formatted });
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getQRCodeById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const db = await getDb();
    const qr = await db.get('SELECT * FROM qrcodes WHERE id = ? AND user_id = ?', [id, userId]);

    if (!qr) {
      res.status(404).json({ error: 'QR code not found' });
      return;
    }

    res.json({
      qrcode: {
        ...qr,
        custom_data: JSON.parse(qr.custom_data || '{}'),
        style_config: JSON.parse(qr.style_config || '{}')
      }
    });
  } catch (error) {
    console.error('Error fetching QR code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateQRCode(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { title, target_url, custom_data, style_config, is_active } = req.body;

    const db = await getDb();
    const existing = await db.get('SELECT * FROM qrcodes WHERE id = ? AND user_id = ?', [id, userId]);

    if (!existing) {
      res.status(404).json({ error: 'QR code not found or access denied' });
      return;
    }

    const updatedTitle = title !== undefined ? title : existing.title;
    const updatedTargetUrl = target_url !== undefined ? target_url : existing.target_url;
    const updatedIsActive = is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active;
    
    const customDataStr = custom_data !== undefined 
      ? (typeof custom_data === 'string' ? custom_data : JSON.stringify(custom_data)) 
      : existing.custom_data;

    const styleConfigStr = style_config !== undefined 
      ? (typeof style_config === 'string' ? style_config : JSON.stringify(style_config)) 
      : existing.style_config;

    await db.run(
      `UPDATE qrcodes 
       SET title = ?, target_url = ?, custom_data = ?, style_config = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [updatedTitle, updatedTargetUrl, customDataStr, styleConfigStr, updatedIsActive, id, userId]
    );

    const updated = await db.get('SELECT * FROM qrcodes WHERE id = ?', [id]);

    res.json({
      message: 'QR code updated successfully',
      qrcode: {
        ...updated,
        custom_data: JSON.parse(updated.custom_data || '{}'),
        style_config: JSON.parse(updated.style_config || '{}')
      }
    });
  } catch (error) {
    console.error('Error updating QR code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteQRCode(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const db = await getDb();
    const result = await db.run('DELETE FROM qrcodes WHERE id = ? AND user_id = ?', [id, userId]);

    if (result.changes === 0) {
      res.status(404).json({ error: 'QR code not found or access denied' });
      return;
    }

    res.json({ message: 'QR code deleted successfully' });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getQRAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const db = await getDb();
    const qr = await db.get('SELECT * FROM qrcodes WHERE id = ? AND user_id = ?', [id, userId]);

    if (!qr) {
      res.status(404).json({ error: 'QR code not found' });
      return;
    }

    // Scans list
    const scans = await db.all(
      'SELECT scanned_at, device_type, os, browser, ip_address FROM scans WHERE qrcode_id = ? ORDER BY scanned_at DESC LIMIT 100',
      [id]
    );

    // Device summary
    const deviceBreakdown = await db.all(
      'SELECT device_type, COUNT(*) as count FROM scans WHERE qrcode_id = ? GROUP BY device_type',
      [id]
    );

    // OS summary
    const osBreakdown = await db.all(
      'SELECT os, COUNT(*) as count FROM scans WHERE qrcode_id = ? GROUP BY os',
      [id]
    );

    // Browser summary
    const browserBreakdown = await db.all(
      'SELECT browser, COUNT(*) as count FROM scans WHERE qrcode_id = ? GROUP BY browser',
      [id]
    );

    res.json({
      qrcode: {
        id: qr.id,
        title: qr.title,
        short_code: qr.short_code,
        scan_count: qr.scan_count
      },
      analytics: {
        total_scans: qr.scan_count,
        recent_scans: scans,
        device_breakdown: deviceBreakdown,
        os_breakdown: osBreakdown,
        browser_breakdown: browserBreakdown
      }
    });
  } catch (error) {
    console.error('Error fetching QR analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
