import { useState } from "react";
import type {
  QRCodeType,
  QRStyleConfig,
  VCardData,
  BioLinkData,
  WiFiData,
  WhatsAppData,
  User,
} from "../types";
import { QRCodeCanvas } from "../components/QRCodeCanvas";
import { getPublicQRUrl, qrService } from "../services/api";
import {
  Globe,
  UserCheck,
  Link2,
  Wifi,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

interface CreateQRPageProps {
  user: User | null;
  onOpenAuth: () => void;
  onCreatedSuccess: () => void;
}

export const CreateQRPage: React.FC<CreateQRPageProps> = ({
  user,
  onOpenAuth,
  onCreatedSuccess,
}) => {
  const [qrType, setQrType] = useState<QRCodeType>("url");
  const [title, setTitle] = useState("");

  // Content States
  const [url, setUrl] = useState("https://");
  const [vCard, setVCard] = useState<VCardData>({
    firstName: "Alex",
    lastName: "Morgan",
    jobTitle: "Creative Director",
    company: "Nexus Innovations",
    phone: "+1 (555) 234-5678",
    email: "alex.m@example.com",
    website: "https://nexus.example.com",
    address: "San Francisco, CA",
    avatarUrl: "",
    bio: "Passionate about building next-gen web products.",
  });
  const [bioLink, setBioLink] = useState<BioLinkData>({
    name: "Sarah Connor",
    bio: "Digital Creator & Product Strategist",
    links: [
      { id: "1", title: "Portfolio Website", url: "https://sarah.example.com" },
      { id: "2", title: "YouTube Channel", url: "https://youtube.com" },
    ],
    socials: [],
  });
  const [wifi, setWifi] = useState<WiFiData>({
    ssid: "Home_5G_Network",
    password: "supersecretpass",
    encryption: "WPA",
  });
  const [whatsapp, setWhatsapp] = useState<WhatsAppData>({
    phone: "6281234567890",
    message: "Hello! I scanned your QR code and would like to get in touch.",
  });

  // Style State
  const [styleConfig, setStyleConfig] = useState<QRStyleConfig>({
    fgColor: "#0f172a",
    bgColor: "#ffffff",
    gradient: false,
    gradientColorStop: "#6366f1",
    eyeColor: "#0f172a",
    eyeShape: "square",
    dotStyle: "square",
    frameStyle: "bottom-bar",
    frameText: "SCAN ME",
    frameColor: "#6366f1",
    logoSize: 40,
  });

  const [saving, setSaving] = useState(false);

  const escapeWifiValue = (value: string) =>
    value.replace(/([\\\\;,:"])/g, "\\\\$1");

  // Compute normalized target URL for redirect
  const getComputedTargetUrl = () => {
    switch (qrType) {
      case "url": {
        let trimmed = url.trim();
        if (!trimmed) return "https://qrfy.com";
        if (!/^https?:\/\//i.test(trimmed)) {
          trimmed = "https://" + trimmed;
        }
        return trimmed;
      }
      case "whatsapp": {
        const cleanPhone = whatsapp.phone.replace(/[^0-9]/g, "");
        const encodedMsg = encodeURIComponent(whatsapp.message || "");
        return `https://wa.me/${cleanPhone}${encodedMsg ? `?text=${encodedMsg}` : ""}`;
      }
      case "wifi": {
        const ssid = escapeWifiValue(wifi.ssid.trim());
        const password = escapeWifiValue(wifi.password || "");
        return `WIFI:T:${wifi.encryption};S:${ssid};${wifi.encryption !== "nopass" ? `P:${password};` : ""};`;
      }
      case "vcard": {
        let web = (vCard.website || "").trim();
        if (web && !/^https?:\/\//i.test(web)) {
          web = "https://" + web;
        }
        return web || "https://qrfy.com";
      }
      case "biolink": {
        let link = (bioLink.links[0]?.url || "").trim();
        if (link && !/^https?:\/\//i.test(link)) {
          link = "https://" + link;
        }
        return link || "https://qrfy.com";
      }
      default:
        return "https://qrfy.com";
    }
  };

  const getCustomDataPayload = () => {
    switch (qrType) {
      case "url":
        return { target_url: getComputedTargetUrl() };
      case "vcard":
        return vCard;
      case "biolink":
        return bioLink;
      case "wifi":
        return wifi;
      case "whatsapp":
        return whatsapp;
      default:
        return {};
    }
  };

  const handleSaveQR = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setSaving(true);
    try {
      const qrTitle = title.trim() || `${qrType.toUpperCase()} QR Code`;
      const computedTarget = getComputedTargetUrl();
      const customData = getCustomDataPayload();

      await qrService.create({
        title: qrTitle,
        type: qrType,
        target_url: computedTarget,
        custom_data: customData,
        style_config: styleConfig,
      });

      alert("QR Code berhasil dibuat!");
      onCreatedSuccess();
    } catch (err: any) {
      alert(err.response?.data?.error || "Gagal membuat QR code");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="create-shell"
      style={{ maxWidth: "1280px", margin: "2rem auto", padding: "0 1.5rem" }}
    >
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          Buat <span className="text-gradient">QR Code Dinamis</span>
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "1.05rem" }}>
          Sesuaikan bingkai, warna, dan konten. Ubah tujuan kapan saja tanpa
          mencetak ulang.
        </p>
      </div>

      <div
        className="create-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "2.5rem",
          alignItems: "start",
        }}
      >
        {/* Left Form Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Step 1: Select QR Type */}
          <div className="glass-panel" style={{ padding: "1.75rem" }}>
            <h3
              style={{
                fontSize: "1.2rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span className="badge badge-brand">Langkah 1</span> Pilih Jenis
              QR Code
            </h3>

            <div
              className="qr-type-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "1rem",
              }}
            >
              {[
                {
                  type: "url",
                  label: "URL Website",
                  icon: Globe,
                  desc: "Tautan ke URL apa pun",
                },
                {
                  type: "vcard",
                  label: "vCard Plus",
                  icon: UserCheck,
                  desc: "Kartu nama digital",
                },
                {
                  type: "biolink",
                  label: "Bio Link",
                  icon: Link2,
                  desc: "Profil dengan banyak tautan",
                },
                {
                  type: "wifi",
                  label: "Akses Wi-Fi",
                  icon: Wifi,
                  desc: "Sambungan instan",
                },
                {
                  type: "whatsapp",
                  label: "WhatsApp",
                  icon: MessageSquare,
                  desc: "Tautan chat langsung",
                },
              ].map((item) => {
                const IconComponent = item.icon;
                const isSelected = qrType === item.type;
                return (
                  <div
                    key={item.type}
                    onClick={() => setQrType(item.type as QRCodeType)}
                    className="glass-card"
                    style={{
                      cursor: "pointer",
                      border: isSelected
                        ? "2px solid #6366f1"
                        : "1px solid rgba(255,255,255,0.1)",
                      backgroundColor: isSelected
                        ? "rgba(99, 102, 241, 0.15)"
                        : "rgba(15, 23, 42, 0.6)",
                      padding: "1.25rem 1rem",
                      textAlign: "center",
                    }}
                  >
                    <IconComponent
                      size={28}
                      color={isSelected ? "#818cf8" : "#94a3b8"}
                      style={{ margin: "0 auto 0.75rem" }}
                    />
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: isSelected ? "#fff" : "#cbd5e1",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#94a3b8",
                        marginTop: "0.2rem",
                      }}
                    >
                      {item.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Content Details Form */}
          <div className="glass-panel" style={{ padding: "1.75rem" }}>
            <h3
              style={{
                fontSize: "1.2rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span className="badge badge-brand">Langkah 2</span> Masukkan
              Detail Konten
            </h3>

            <div className="form-group">
              <label className="form-label">
                Judul QR Code / Nama Kampanye
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="mis. Kampanye Musim Panas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* URL Form */}
            {qrType === "url" && (
              <div className="form-group">
                <label className="form-label">URL Website Tujuan</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="mis. google.com atau https://websiteanda.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            )}

            {/* vCard Form */}
            {qrType === "vcard" && (
              <div
                className="content-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">
                    Foto Profil (URL, opsional)
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://... (mis. Gravatar, Cloudinary, atau URL avatar)"
                    value={vCard.avatarUrl || ""}
                    onChange={(e) =>
                      setVCard({ ...vCard, avatarUrl: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nama Depan</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Mis. Alex"
                    value={vCard.firstName}
                    onChange={(e) =>
                      setVCard({ ...vCard, firstName: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nama Belakang</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Mis. Morgan"
                    value={vCard.lastName}
                    onChange={(e) =>
                      setVCard({ ...vCard, lastName: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jabatan</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Mis. Creative Director"
                    value={vCard.jobTitle}
                    onChange={(e) =>
                      setVCard({ ...vCard, jobTitle: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nama Perusahaan</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Mis. Nexus Innovations"
                    value={vCard.company}
                    onChange={(e) =>
                      setVCard({ ...vCard, company: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nomor Telepon</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="mis. +1 (555) 234-5678"
                    value={vCard.phone}
                    onChange={(e) =>
                      setVCard({ ...vCard, phone: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Alamat Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="mis. nama@perusahaan.com"
                    value={vCard.email}
                    onChange={(e) =>
                      setVCard({ ...vCard, email: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://websiteanda.com"
                    value={vCard.website || ""}
                    onChange={(e) =>
                      setVCard({ ...vCard, website: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Alamat</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Kota, Negara, atau alamat lengkap"
                    value={vCard.address || ""}
                    onChange={(e) =>
                      setVCard({ ...vCard, address: e.target.value })
                    }
                  />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Bio Singkat</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Tulis deskripsi singkat tentang Anda..."
                    value={vCard.bio || ""}
                    onChange={(e) =>
                      setVCard({ ...vCard, bio: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {/* Bio Link Form */}
            {qrType === "biolink" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Nama Profil</label>
                  <input
                    type="text"
                    className="form-input"
                    value={bioLink.name}
                    onChange={(e) =>
                      setBioLink({ ...bioLink, name: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Deskripsi Bio</label>
                  <input
                    type="text"
                    className="form-input"
                    value={bioLink.bio}
                    onChange={(e) =>
                      setBioLink({ ...bioLink, bio: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Foto Profil (URL, opsional)</label>
                  <input type="url" className="form-input" placeholder="https://..." value={bioLink.avatarUrl || ""} onChange={(e) => setBioLink({ ...bioLink, avatarUrl: e.target.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <label className="form-label">Tautan</label>
                  {bioLink.links.map((link, index) => (
                    <div key={link.id} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr auto", gap: "0.5rem" }}>
                      <input className="form-input" placeholder="Judul" value={link.title} onChange={(e) => {
                        const links = [...bioLink.links]; links[index] = { ...link, title: e.target.value }; setBioLink({ ...bioLink, links });
                      }} />
                      <input className="form-input" placeholder="https://..." value={link.url} onChange={(e) => {
                        const links = [...bioLink.links]; links[index] = { ...link, url: e.target.value }; setBioLink({ ...bioLink, links });
                      }} />
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => setBioLink({ ...bioLink, links: bioLink.links.filter((_, itemIndex) => itemIndex !== index) })}>Hapus</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ alignSelf: "start" }}
                    onClick={() =>
                      setBioLink({
                        ...bioLink,
                        links: [
                          ...bioLink.links,
                          { id: crypto.randomUUID(), title: "", url: "" },
                        ],
                      })
                    }
                  >
                    + Tambah tautan
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <label className="form-label">
                    Sosial Media (opsional)
                  </label>
                  {(bioLink.socials || []).map((social, index) => (
                    <div
                      key={index}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1.5fr auto",
                        gap: "0.5rem",
                      }}
                    >
                      <input
                        className="form-input"
                        placeholder="Platform (mis. Instagram)"
                        value={social.platform}
                        onChange={(e) => {
                          const socials = [...(bioLink.socials || [])];
                          socials[index] = {
                            ...social,
                            platform: e.target.value,
                          };
                          setBioLink({ ...bioLink, socials });
                        }}
                      />
                      <input
                        className="form-input"
                        placeholder="https://..."
                        value={social.url}
                        onChange={(e) => {
                          const socials = [...(bioLink.socials || [])];
                          socials[index] = { ...social, url: e.target.value };
                          setBioLink({ ...bioLink, socials });
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          setBioLink({
                            ...bioLink,
                            socials: (bioLink.socials || []).filter(
                              (_, itemIndex) => itemIndex !== index
                            ),
                          })
                        }
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ alignSelf: "start" }}
                    onClick={() =>
                      setBioLink({
                        ...bioLink,
                        socials: [
                          ...(bioLink.socials || []),
                          { platform: "", url: "" },
                        ],
                      })
                    }
                  >
                    + Tambah sosmed
                  </button>
                </div>
              </div>
            )}

            {/* Wi-Fi Form */}
            {qrType === "wifi" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Nama Jaringan (SSID)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={wifi.ssid}
                    onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kata Sandi</label>
                  <input
                    type="text"
                    className="form-input"
                    value={wifi.password}
                    onChange={(e) =>
                      setWifi({ ...wifi, password: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Keamanan</label>
                  <select className="form-input" value={wifi.encryption} onChange={(e) => setWifi({ ...wifi, encryption: e.target.value as WiFiData["encryption"] })}>
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">Tanpa kata sandi</option>
                  </select>
                </div>
              </div>
            )}

            {/* WhatsApp Form */}
            {qrType === "whatsapp" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div className="form-group">
                  <label className="form-label">
                    Nomor Telepon (dengan Kode Negara)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="mis. 6281234567890"
                    value={whatsapp.phone}
                    onChange={(e) =>
                      setWhatsapp({ ...whatsapp, phone: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pesan Otomatis</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={whatsapp.message}
                    onChange={(e) =>
                      setWhatsapp({ ...whatsapp, message: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

          </div>

          {/* Step 3: Customize Frame & Design */}
          <div className="glass-panel" style={{ padding: "1.75rem" }}>
            <h3
              style={{
                fontSize: "1.2rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span className="badge badge-brand">Langkah 3</span> Sesuaikan
              Tampilan & Bingkai
            </h3>

            <div
              className="style-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
              }}
            >
              <div className="form-group">
                <label className="form-label">Gaya Bingkai</label>
                <select
                  className="form-input"
                  value={styleConfig.frameStyle}
                  onChange={(e) =>
                    setStyleConfig({
                      ...styleConfig,
                      frameStyle: e.target.value as any,
                    })
                  }
                >
                  <option value="bottom-bar">Lencana di Bawah</option>
                  <option value="top-bar">Lencana di Atas</option>
                  <option value="box">Bingkai Kotak Penuh</option>
                  <option value="none">Tanpa Bingkai</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Teks Bingkai</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. SCAN ME"
                  value={styleConfig.frameText}
                  onChange={(e) =>
                    setStyleConfig({
                      ...styleConfig,
                      frameText: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Warna Bingkai</label>
                <input
                  type="color"
                  className="form-input"
                  style={{ height: "42px", padding: "4px", cursor: "pointer" }}
                  value={styleConfig.frameColor}
                  onChange={(e) =>
                    setStyleConfig({
                      ...styleConfig,
                      frameColor: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Warna Titik QR</label>
                <input
                  type="color"
                  className="form-input"
                  style={{ height: "42px", padding: "4px", cursor: "pointer" }}
                  value={styleConfig.fgColor}
                  onChange={(e) =>
                    setStyleConfig({ ...styleConfig, fgColor: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Preview Panel */}
        <div
          className="create-preview"
          style={{ position: "sticky", top: "100px" }}
        >
          <div
            className="glass-panel"
            style={{ padding: "2rem", textAlign: "center" }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                marginBottom: "1.5rem",
                color: "#94a3b8",
              }}
            >
              Pratinjau Langsung
            </h3>

            <div style={{ marginBottom: "1.5rem" }}>
              <QRCodeCanvas
                value={
                  ["url", "wifi", "whatsapp"].includes(qrType)
                    ? getComputedTargetUrl()
                    : getPublicQRUrl("preview")
                }
                styleConfig={styleConfig}
                size={220}
                showDownload={true}
              />
              {["vcard", "biolink"].includes(qrType) && (
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#94a3b8",
                    marginTop: "0.8rem",
                    lineHeight: 1.5,
                    backgroundColor: "rgba(255,255,255,0.03)",
                    padding: "0.75rem",
                    borderRadius: "10px",
                    textAlign: "left"
                  }}
                >
                  💡 <b>Pratinjau Langsung</b>: QR pratinjau ini dapat langsung Anda scan via kamera HP untuk menguji halaman {qrType === "vcard" ? "vCard Plus" : "Bio Link"}. Tautan unik final akan diterbitkan saat disimpan.
                </div>
              )}
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: "100%" }}
              onClick={handleSaveQR}
              disabled={saving}
            >
              {saving ? "Menyimpan..." : "Simpan & Terbitkan QR Code"}{" "}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
