export type QRCodeType = 'url' | 'vcard' | 'biolink' | 'wifi' | 'whatsapp' | 'text';

export interface QRStyleConfig {
  fgColor: string;
  bgColor: string;
  gradient: boolean;
  gradientColorStop: string;
  eyeColor: string;
  eyeShape: 'square' | 'circle' | 'rounded';
  dotStyle: 'square' | 'rounded' | 'dots';
  frameStyle: 'none' | 'bottom-bar' | 'top-bar' | 'box';
  frameText: string;
  frameColor: string;
  logoUrl?: string;
  logoSize?: number;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  jobTitle?: string;
  company?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface BioLinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

export interface BioLinkData {
  name: string;
  bio?: string;
  avatarUrl?: string;
  links: BioLinkItem[];
  socials?: { platform: string; url: string }[];
}

export interface WiFiData {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export interface WhatsAppData {
  phone: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface QRCodeData {
  id: string;
  user_id: string;
  title: string;
  type: QRCodeType;
  short_code: string;
  target_url: string;
  custom_data: any;
  style_config: QRStyleConfig;
  is_active: number;
  scan_count: number;
  created_at: string;
  updated_at: string;
}

export interface ScanAnalytics {
  total_scans: number;
  recent_scans: Array<{
    scanned_at: string;
    device_type: string;
    os: string;
    browser: string;
    ip_address: string;
  }>;
  device_breakdown: Array<{ device_type: string; count: number }>;
  os_breakdown: Array<{ os: string; count: number }>;
  browser_breakdown: Array<{ browser: string; count: number }>;
}
