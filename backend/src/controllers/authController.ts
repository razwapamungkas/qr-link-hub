import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';
import { JWT_SECRET, AuthRequest } from '../middleware/auth.js';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    const db = await getDb();
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = 'usr_' + Math.random().toString(36).substring(2, 11);

    await db.run(
      'INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)',
      [userId, email.toLowerCase(), passwordHash, name]
    );

    const token = jwt.sign({ id: userId, email: email.toLowerCase(), name }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, email: email.toLowerCase(), name }
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
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!user) {
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

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
