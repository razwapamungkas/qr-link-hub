import { useState, useEffect } from "react";
import { qrService } from "../services/api";
import type { QRCodeData, ScanAnalytics, QRStyleConfig, User } from "../types";
import { QRCodeCanvas } from "../components/QRCodeCanvas";
import {
  BarChart3,
  Globe,
  Edit3,
  Trash2,
  ExternalLink,
  Power,
  Search,
  Plus,
  X,
  Smartphone,
  Monitor,
} from "lucide-react";

const defaultStyleConfig: QRStyleConfig = {
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
};

interface DashboardPageProps {
  user: User | null;
  onNavigateCreate: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user: _user,
  onNavigateCreate,
}) => {
  const [qrcodes, setQrcodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Editing Target URL Modal State
  const [editingQR, setEditingQR] = useState<QRCodeData | null>(null);
  const [newTargetUrl, setNewTargetUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");

  // Analytics Modal State
  const [analyticsQR, setAnalyticsQR] = useState<QRCodeData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<ScanAnalytics | null>(
    null,
  );
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchQRCodes = async () => {
    setLoading(true);
    try {
      const res = await qrService.getUserQRCodes();
      setQrcodes(res.data.qrcodes);
    } catch (err) {
      console.error("Failed to load QR codes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const handleToggleActive = async (qr: QRCodeData) => {
    try {
      await qrService.update(qr.id, { is_active: !qr.is_active });
      fetchQRCodes();
    } catch (err) {
      alert("Failed to toggle QR code status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this QR code?"))
      return;
    try {
      await qrService.delete(id);
      fetchQRCodes();
    } catch (err) {
      alert("Failed to delete QR code");
    }
  };

  const handleOpenEdit = (qr: QRCodeData) => {
    setEditingQR(qr);
    setNewTitle(qr.title);
    setNewTargetUrl(qr.target_url);
  };

  const handleSaveEdit = async () => {
    if (!editingQR) return;
    try {
      let normalizedTarget = newTargetUrl.trim();
      if (
        editingQR.type === "url" &&
        normalizedTarget &&
        !/^https?:\/\//i.test(normalizedTarget)
      ) {
        normalizedTarget = "https://" + normalizedTarget;
      }

      await qrService.update(editingQR.id, {
        title: newTitle.trim(),
        target_url: normalizedTarget,
      });
      setEditingQR(null);
      fetchQRCodes();
    } catch (err) {
      alert("Failed to update QR code");
    }
  };

  const handleOpenAnalytics = async (qr: QRCodeData) => {
    setAnalyticsQR(qr);
    setAnalyticsLoading(true);
    try {
      const res = await qrService.getAnalytics(qr.id);
      setAnalyticsData(res.data.analytics);
    } catch (err) {
      alert("Failed to fetch analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const filteredQRCodes = qrcodes.filter(
    (qr) =>
      qr.title.toLowerCase().includes(search.toLowerCase()) ||
      qr.short_code.toLowerCase().includes(search.toLowerCase()),
  );

  const totalScans = qrcodes.reduce((acc, curr) => acc + curr.scan_count, 0);
  const activeCount = qrcodes.filter((qr) => qr.is_active).length;

  return (
    <div
      style={{ maxWidth: "1280px", margin: "2rem auto", padding: "0 1.5rem" }}
    >
      {/* Header & Stats Overview */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2.2rem" }}>
            <span className="text-gradient">Dasbor QR Code</span>
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            Kelola tautan QR dinamis, ubah tujuan, dan analisis lalu lintas
            pemindaian.
          </p>
        </div>
        <button className="btn btn-primary" onClick={onNavigateCreate}>
          <Plus size={18} /> Buat QR Baru
        </button>
      </div>

      {/* Overview Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        <div className="glass-card">
          <div
            style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 600 }}
          >
            TOTAL QR CODE
          </div>
          <div
            style={{ fontSize: "2.2rem", fontWeight: 800, marginTop: "0.2rem" }}
          >
            {qrcodes.length}
          </div>
        </div>
        <div className="glass-card">
          <div
            style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 600 }}
          >
            TOTAL PEMINDAIAN
          </div>
          <div
            style={{
              fontSize: "2.2rem",
              fontWeight: 800,
              color: "#6366f1",
              marginTop: "0.2rem",
            }}
          >
            {totalScans}
          </div>
        </div>
        <div className="glass-card">
          <div
            style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 600 }}
          >
            QR AKTIF
          </div>
          <div
            style={{
              fontSize: "2.2rem",
              fontWeight: 800,
              color: "#34d399",
              marginTop: "0.2rem",
            }}
          >
            {activeCount}
          </div>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div
        className="glass-panel"
        style={{ padding: "1rem 1.25rem", marginBottom: "1.5rem" }}
      >
        <div style={{ position: "relative", maxWidth: "360px" }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              top: "11px",
              color: "#64748b",
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Cari QR code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "40px" }}
          />
        </div>
      </div>

      {/* QR Codes Grid / List */}
      {loading ? (
        <div
          style={{ textAlign: "center", padding: "4rem 0", color: "#6366f1" }}
        >
          Loading QR codes...
        </div>
      ) : filteredQRCodes.length === 0 ? (
        <div
          className="glass-panel"
          style={{ padding: "3rem", textAlign: "center" }}
        >
          <Globe size={48} color="#64748b" style={{ margin: "0 auto 1rem" }} />
          <h3>QR code tidak ditemukan</h3>
          <p style={{ color: "#94a3b8", margin: "0.5rem 0 1.5rem" }}>
            Mulai dengan membuat QR code dinamis pertama Anda.
          </p>
          <button className="btn btn-primary" onClick={onNavigateCreate}>
            <Plus size={18} /> Buat QR Code Sekarang
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredQRCodes.map((qr) => {
            const hostName = window.location.hostname || "localhost";
            const shortUrl = `http://${hostName}:5000/r/${qr.short_code}`;
            return (
              <div
                key={qr.id}
                className="glass-card"
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr auto",
                  gap: "1.5rem",
                  alignItems: "center",
                }}
              >
                {/* QR Canvas Preview Thumbnail */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <QRCodeCanvas
                    value={shortUrl}
                    styleConfig={
                      qr.style_config && Object.keys(qr.style_config).length > 0
                        ? qr.style_config
                        : defaultStyleConfig
                    }
                    size={85}
                    showDownload={false}
                  />
                </div>

                {/* QR Details */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "0.35rem",
                    }}
                  >
                    <h3 style={{ fontSize: "1.15rem" }}>{qr.title}</h3>
                    <span className="badge badge-brand">{qr.type}</span>
                    <span
                      className={`badge ${qr.is_active ? "badge-success" : "badge-warning"}`}
                    >
                      {qr.is_active ? "Active" : "Paused"}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#94a3b8",
                      marginBottom: "0.35rem",
                    }}
                  >
                    Short Link:{" "}
                    <a
                      href={shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#818cf8", fontWeight: 600 }}
                    >
                      {shortUrl} <ExternalLink size={12} />
                    </a>
                  </div>

                  <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    Target:{" "}
                    <span style={{ color: "#cbd5e1" }}>
                      {qr.target_url.length > 50
                        ? qr.target_url.substring(0, 50) + "..."
                        : qr.target_url}
                    </span>
                  </div>
                </div>

                {/* Actions & Analytics */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <div
                    style={{
                      textAlign: "right",
                      paddingRight: "1rem",
                      borderRight: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: 800,
                        color: "#6366f1",
                      }}
                    >
                      {qr.scan_count}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#94a3b8",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Pemindaian
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenAnalytics(qr)}
                      title="View Analytics"
                    >
                      <BarChart3 size={16} /> Analytics
                    </button>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenEdit(qr)}
                      title="Edit Target URL"
                    >
                      <Edit3 size={16} /> Edit
                    </button>

                    <button
                      className={`btn btn-sm ${qr.is_active ? "btn-secondary" : "btn-outline"}`}
                      onClick={() => handleToggleActive(qr)}
                      title={qr.is_active ? "Pause QR" : "Activate QR"}
                    >
                      <Power
                        size={16}
                        color={qr.is_active ? "#34d399" : "#f59e0b"}
                      />
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(qr.id)}
                      title="Delete QR"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Target URL Modal */}
      {editingQR && (
        <div className="modal-overlay" onClick={() => setEditingQR(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "500px" }}
          >
            <button
              onClick={() => setEditingQR(null)}
              style={{
                position: "absolute",
                top: "1.25rem",
                right: "1.25rem",
                background: "none",
                border: "none",
                color: "#94a3b8",
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ marginBottom: "0.5rem" }}>Edit Dynamic Target URL</h2>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "0.875rem",
                marginBottom: "1.5rem",
              }}
            >
              Update where this QR Code redirects to without changing the QR
              Code image!
            </p>

            <div className="form-group">
              <label className="form-label">QR Code Title</label>
              <input
                type="text"
                className="form-input"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Target URL</label>
              <input
                type="url"
                className="form-input"
                value={newTargetUrl}
                onChange={(e) => setNewTargetUrl(e.target.value)}
              />
            </div>

            <div
              style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}
            >
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setEditingQR(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {analyticsQR && (
        <div className="modal-overlay" onClick={() => setAnalyticsQR(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "640px" }}
          >
            <button
              onClick={() => setAnalyticsQR(null)}
              style={{
                position: "absolute",
                top: "1.25rem",
                right: "1.25rem",
                background: "none",
                border: "none",
                color: "#94a3b8",
              }}
            >
              <X size={20} />
            </button>

            <h2 style={{ marginBottom: "0.2rem" }}>
              Analitik Lalu Lintas Pemindaian
            </h2>
            <p
              style={{
                color: "#818cf8",
                fontSize: "0.9rem",
                marginBottom: "1.5rem",
              }}
            >
              {analyticsQR.title}
            </p>

            {analyticsLoading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#6366f1",
                }}
              >
                Loading analytics...
              </div>
            ) : analyticsData ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1rem",
                  }}
                >
                  <div className="glass-card" style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      TOTAL PEMINDAIAN
                    </div>
                    <div
                      style={{
                        fontSize: "1.75rem",
                        fontWeight: 800,
                        color: "#6366f1",
                      }}
                    >
                      {analyticsData.total_scans}
                    </div>
                  </div>
                  <div className="glass-card" style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      TOP DEVICE
                    </div>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        marginTop: "0.3rem",
                      }}
                    >
                      {analyticsData.device_breakdown[0]?.device_type ||
                        "Mobile"}
                    </div>
                  </div>
                  <div className="glass-card" style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      TOP BROWSER
                    </div>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        marginTop: "0.3rem",
                      }}
                    >
                      {analyticsData.browser_breakdown[0]?.browser || "Chrome"}
                    </div>
                  </div>
                </div>

                {/* Device Breakdown */}
                <div>
                  <h4
                    style={{
                      fontSize: "0.95rem",
                      marginBottom: "0.75rem",
                      color: "#cbd5e1",
                    }}
                  >
                    Device Breakdown
                  </h4>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    {(analyticsData.device_breakdown || []).map((dev, idx) => (
                      <div
                        key={idx}
                        className="glass-card"
                        style={{
                          flex: 1,
                          padding: "0.85rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        {dev.device_type === "Mobile" ? (
                          <Smartphone size={20} color="#34d399" />
                        ) : (
                          <Monitor size={20} color="#818cf8" />
                        )}
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                            {dev.device_type}
                          </div>
                          <div
                            style={{ fontSize: "0.75rem", color: "#94a3b8" }}
                          >
                            {dev.count} pemindaian
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Scans Log Table */}
                <div>
                  <h4
                    style={{
                      fontSize: "0.95rem",
                      marginBottom: "0.75rem",
                      color: "#cbd5e1",
                    }}
                  >
                    Log Pemindaian Terbaru
                  </h4>
                  <div style={{ maxHeight: "180px", overflowY: "auto" }}>
                    {analyticsData.recent_scans.length === 0 ? (
                      <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                        Belum ada riwayat pemindaian.
                      </div>
                    ) : (
                      analyticsData.recent_scans.map((scan, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "0.5rem 0.75rem",
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            fontSize: "0.825rem",
                          }}
                        >
                          <span style={{ color: "#cbd5e1" }}>
                            {new Date(scan.scanned_at).toLocaleString()}
                          </span>
                          <span style={{ color: "#94a3b8" }}>
                            {scan.device_type} ({scan.os} / {scan.browser})
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
