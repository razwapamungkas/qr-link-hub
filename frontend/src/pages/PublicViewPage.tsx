import { useState, useEffect } from 'react';
import { qrService } from '../services/api';
import type { QRCodeData, VCardData } from '../types';
import { User, Phone, Mail, Globe, MapPin, Download, Wifi, MessageCircle, ExternalLink, ShieldAlert } from 'lucide-react';

interface PublicViewPageProps {
  shortCode: string;
}

export const PublicViewPage: React.FC<PublicViewPageProps> = ({ shortCode }) => {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const res = await qrService.getPublicQR(shortCode);
        setQrData(res.data.qrcode);
      } catch (err: any) {
        setError('QR Code not found or inactive');
      } finally {
        setLoading(false);
      }
    };
    if (shortCode) {
      fetchQR();
    }
  }, [shortCode]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6366f1', fontSize: '1.2rem', fontWeight: 600 }}>Loading profile...</div>
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '400px' }}>
          <ShieldAlert size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
          <h2>QR Code Unavailable</h2>
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>{error || 'This QR Code does not exist or has been disabled.'}</p>
        </div>
      </div>
    );
  }

  const { type, custom_data } = qrData;

  // vCard Handler: Download VCF Contact File
  const downloadVCF = () => {
    const vCard: VCardData = custom_data || {};
    const vcfText = `BEGIN:VCARD
VERSION:3.0
N:${vCard.lastName || ''};${vCard.firstName || ''};;;
FN:${vCard.firstName || ''} ${vCard.lastName || ''}
ORG:${vCard.company || ''}
TITLE:${vCard.jobTitle || ''}
TEL;TYPE=CELL:${vCard.phone || ''}
EMAIL:${vCard.email || ''}
URL:${vCard.website || ''}
ADR:;;${vCard.address || ''};;;;
END:VCARD`;

    const blob = new Blob([vcfText], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${vCard.firstName || 'contact'}_vcard.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #090d16 0%, #0f172a 100%)',
        display: 'flex',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* vCard View */}
        {type === 'vcard' && (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                margin: '0 auto 1.25rem',
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                padding: '3px',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)'
              }}
            >
              {custom_data.avatarUrl ? (
                <img
                  src={custom_data.avatarUrl}
                  alt="Avatar"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}
                >
                  <User size={40} />
                </div>
              )}
            </div>

            <h1 style={{ fontSize: '1.6rem', marginBottom: '0.2rem' }}>
              {custom_data.firstName} {custom_data.lastName}
            </h1>
            {custom_data.jobTitle && (
              <p style={{ color: '#6366f1', fontWeight: 600, fontSize: '0.95rem' }}>{custom_data.jobTitle}</p>
            )}
            {custom_data.company && (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>{custom_data.company}</p>
            )}

            {custom_data.bio && (
              <p
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  color: '#cbd5e1',
                  marginBottom: '1.5rem',
                  lineHeight: '1.5'
                }}
              >
                {custom_data.bio}
              </p>
            )}

            <button className="btn btn-primary" style={{ width: '100%', marginBottom: '1.5rem' }} onClick={downloadVCF}>
              <Download size={18} /> Save to Contacts (.vcf)
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
              {custom_data.phone && (
                <a
                  href={`tel:${custom_data.phone}`}
                  className="glass-card"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1rem' }}
                >
                  <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '8px', borderRadius: '8px', color: '#818cf8' }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Phone</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{custom_data.phone}</div>
                  </div>
                </a>
              )}

              {custom_data.email && (
                <a
                  href={`mailto:${custom_data.email}`}
                  className="glass-card"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1rem' }}
                >
                  <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '8px', borderRadius: '8px', color: '#22d3ee' }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Email</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{custom_data.email}</div>
                  </div>
                </a>
              )}

              {custom_data.website && (
                <a
                  href={custom_data.website.startsWith('http') ? custom_data.website : `https://${custom_data.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-card"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1rem' }}
                >
                  <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '8px', borderRadius: '8px', color: '#c084fc' }}>
                    <Globe size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Website</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{custom_data.website}</div>
                  </div>
                </a>
              )}

              {custom_data.address && (
                <div
                  className="glass-card"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1rem' }}
                >
                  <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '8px', color: '#fbbf24' }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Address</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{custom_data.address}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BioLink View */}
        {type === 'biolink' && (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            {custom_data.avatarUrl && (
              <img
                src={custom_data.avatarUrl}
                alt="Avatar"
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  margin: '0 auto 1rem',
                  border: '3px solid #6366f1'
                }}
              />
            )}
            <h1 style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>{custom_data.name}</h1>
            {custom_data.bio && <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{custom_data.bio}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {(custom_data.links || []).map((link: any, idx: number) => (
                <a
                  key={idx}
                  href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    padding: '0.9rem 1.25rem',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9))'
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{link.title}</span>
                  <ExternalLink size={16} />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Wi-Fi View */}
        {type === 'wifi' && (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6366f1',
                margin: '0 auto 1.25rem'
              }}
            >
              <Wifi size={36} />
            </div>

            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Wi-Fi Connection</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Scan or enter credentials below to connect to network.
            </p>

            <div className="glass-card" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Network Name (SSID)</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
                {custom_data.ssid}
              </div>

              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Password</div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: '#34d399',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  marginTop: '0.25rem'
                }}
              >
                {custom_data.password || 'No Password'}
              </div>
            </div>

            {custom_data.password && (
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => {
                  navigator.clipboard.writeText(custom_data.password);
                  alert('Password copied to clipboard!');
                }}
              >
                Copy Wi-Fi Password
              </button>
            )}
          </div>
        )}

        {/* WhatsApp View */}
        {type === 'whatsapp' && (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
                margin: '0 auto 1.25rem'
              }}
            >
              <MessageCircle size={36} />
            </div>

            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>WhatsApp Chat</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Click below to send a direct message on WhatsApp.
            </p>

            <a
              href={`https://wa.me/${custom_data.phone}?text=${encodeURIComponent(custom_data.message || '')}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
              style={{ width: '100%', background: '#10b981' }}
            >
              <MessageCircle size={18} /> Open WhatsApp Chat
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
