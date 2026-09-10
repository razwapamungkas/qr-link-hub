import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let dbInstance: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getDb(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (dbInstance) return dbInstance;

  const dbPath = process.env.QR_DATABASE_PATH || path.join(process.cwd(), 'qrfy_hub.sqlite');

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await initDbSchema(dbInstance);
  return dbInstance;
}

async function initDbSchema(db: Database) {
  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON;');

  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // QR codes table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS qrcodes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      short_code TEXT UNIQUE NOT NULL,
      target_url TEXT NOT NULL,
      custom_data TEXT,
      style_config TEXT,
      is_active INTEGER DEFAULT 1,
      scan_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Scans log table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      qrcode_id TEXT NOT NULL,
      scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      user_agent TEXT,
      ip_address TEXT,
      device_type TEXT,
      os TEXT,
      browser TEXT,
      FOREIGN KEY (qrcode_id) REFERENCES qrcodes(id) ON DELETE CASCADE
    );
  `);
}
