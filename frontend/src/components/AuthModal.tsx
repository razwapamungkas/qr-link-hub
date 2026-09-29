import React, { useState } from "react";
import { authService } from "../services/api";
import type { User } from "../types";
import { X, Lock, Mail, User as UserIcon, ArrowRight } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password;
    const cleanName = name.trim();

    try {
      if (isLogin) {
        const res = await authService.login({ email: cleanEmail, password: cleanPassword });
        onSuccess(res.data.user, res.data.token);
        onClose();
      } else {
        const res = await authService.register({ name: cleanName, email: cleanEmail, password: cleanPassword });
        onSuccess(res.data.user, res.data.token);
        onClose();
      }
    } catch (err: any) {
      if (!err.response) {
        setError("Gagal terhubung ke server backend. Pastikan server backend sedang berjalan (http://localhost:3001).");
      } else {
        setError(
          err.response?.data?.error ||
            "Autentikasi gagal. Silakan periksa detail Anda.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "440px" }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>
          {isLogin ? "Selamat Datang Kembali" : "Buat Akun"}
        </h2>
        <p
          style={{
            color: "#94a3b8",
            fontSize: "0.9rem",
            marginBottom: "1.5rem",
          }}
        >
          {isLogin
            ? "Masuk untuk mengakses QR code dinamis dan analitik Anda."
            : "Join QRFY LinkHub to generate dynamic, trackable QR codes."}
        </p>

        {error && (
          <div
            style={{
              padding: "0.75rem 1rem",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              color: "#fca5a5",
              fontSize: "0.875rem",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: "relative" }}>
                <UserIcon
                  size={18}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "12px",
                    color: "#64748b",
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: "40px" }}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "12px",
                  color: "#64748b",
                }}
              />
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: "40px" }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "12px",
                  color: "#64748b",
                }}
              />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: "40px" }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem", padding: "0.85rem" }}
            disabled={loading}
          >
            {loading ? "Memproses..." : isLogin ? "Masuk" : "Buat Akun"}{" "}
            <ArrowRight size={18} />
          </button>
        </form>

        <div
          style={{
            marginTop: "1.5rem",
            textAlign: "center",
            fontSize: "0.9rem",
            color: "#94a3b8",
          }}
        >
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            style={{
              background: "none",
              border: "none",
              color: "#6366f1",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {isLogin ? "Daftar" : "Masuk"}
          </button>
        </div>
      </div>
    </div>
  );
};
