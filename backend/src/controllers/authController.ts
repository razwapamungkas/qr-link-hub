import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { getJwtSecret, AuthRequest } from '../middleware/auth.js';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Nama, email, dan password wajib diisi' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const db = await getDb();
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      res.status(400).json({ error: 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = 'usr_' + Math.random().toString(36).substring(2, 11);

    await db.run(
      'INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)',
      [userId, cleanEmail, passwordHash, cleanName]
    );

    const token = jwt.sign({ id: userId, email: cleanEmail, name: cleanName }, getJwtSecret(), { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, email: cleanEmail, name: cleanName }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email dan password wajib diisi' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (!user) {
      res.status(400).json({ error: 'Email atau password salah' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(400).json({ error: 'Email atau password salah' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, getJwtSecret(), { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  res.json({ user: req.user });
}
