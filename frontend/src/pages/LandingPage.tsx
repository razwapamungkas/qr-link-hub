import {
  ArrowRight,
  Contact,
  Globe,
  Link2,
  MessageSquare,
  QrCode,
  ScanLine,
  Settings2,
  Sparkles,
  Wifi,
  Clock3,
} from "lucide-react";

interface LandingPageProps {
  onStartCreate: () => void;
}

const qrTypes = [
  { label: "Website", icon: Globe, tone: "blue" },
  { label: "vCard", icon: Contact, tone: "peach" },
  { label: "Bio Link", icon: Link2, tone: "pink" },
  { label: "Wi-Fi", icon: Wifi, tone: "violet" },
  { label: "WhatsApp", icon: MessageSquare, tone: "mint" },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStartCreate }) => {
  return (
    <div className="minimal-landing">
      <section className="minimal-hero">
        <div className="minimal-hero-copy">
          <span className="minimal-kicker">
            <Sparkles size={14} /> Alat QR sederhana untuk berbagai tautan
          </span>
          <h1>
            Pindai dan Buat <span>QR Code</span>
          </h1>
          <p>
            Buat QR code untuk website, kontak, jaringan Wi-Fi, bio link, atau
            WhatsApp hanya dalam beberapa langkah.
          </p>
          <button className="btn btn-primary btn-lg" onClick={onStartCreate}>
            <QrCode size={19} /> Buat QR Code <ArrowRight size={17} />
          </button>
        </div>

        <div
          className="minimal-device-scene"
          aria-label="QR code creator preview"
        >
          <div className="minimal-device minimal-device-small">
            <div className="device-status">
              <span>9:41</span>
              <span>••• ▰</span>
            </div>
            <div className="device-brand">
              Mr<span>QR</span>
            </div>
            <ScanLine className="device-scan-icon" size={25} />
            <h3>Pindai QR Code</h3>
            <p>Posisikan QR code di dalam bingkai</p>
            <div className="scan-frame">
              <QrCode size={76} />
            </div>
            <div className="device-nav">
              <span>
                <QrCode size={13} /> Buat
              </span>
              <span>
                <ScanLine size={13} /> Pindai
              </span>
              <span>
                <Clock3 size={13} /> Terbaru
              </span>
            </div>
          </div>

          <div className="minimal-device minimal-device-main">
            <div className="device-status">
              <span>9:41</span>
              <span>••• ▰</span>
            </div>
            <div className="device-brand">
              Mr<span>QR</span>
            </div>
            <div className="device-qr-watermark">
              <QrCode size={132} />
            </div>
            <h2>
              Pilih
              <br />
              <span>Tujuan!</span>
            </h2>
            <div className="destination-list">
              {qrTypes.map(({ label, icon: Icon, tone }) => (
                <button
                  key={label}
                  className={`destination-item ${tone}`}
                  onClick={onStartCreate}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
            <div className="device-nav">
              <span>
                <QrCode size={13} /> Buat QR
              </span>
              <span>
                <ScanLine size={13} /> Pindai QR
              </span>
              <span>
                <Settings2 size={13} /> Pengaturan
              </span>
            </div>
          </div>

          <div className="minimal-device minimal-device-result">
            <div className="device-status">
              <span>9:41</span>
              <span>••• ▰</span>
            </div>
            <div className="result-back">‹</div>
            <div className="result-card">
              <div className="result-qr">
                <QrCode size={96} />
              </div>
              <h3>QR code Anda siap!</h3>
              <p>QR code unik Anda siap untuk dipindai.</p>
              <div className="result-actions">
                <span>
                  ♧<small>Bagikan</small>
                </span>
                <span>
                  ▣<small>Simpan</small>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
