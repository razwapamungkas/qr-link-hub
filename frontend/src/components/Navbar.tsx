import React from "react";
import {
  QrCode,
  PlusCircle,
  LayoutDashboard,
  LogIn,
  LogOut,
} from "lucide-react";
import type { User } from "../types";

interface NavbarProps {
  user: User | null;
  activeTab: "home" | "create" | "dashboard" | "public";
  setActiveTab: (tab: "home" | "create" | "dashboard" | "public") => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(16px)",
        backgroundColor: "rgba(250, 248, 255, 0.86)",
        borderBottom: "1px solid #e4e1f2",
        padding: "0.9rem 2rem",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab("home")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #5b57e5, #9e83e8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)",
            }}
          >
            <QrCode size={24} />
          </div>
          <div>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                fontSize: "1.4rem",
                letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #272749 0%, #5b57e5 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              QRFY<span style={{ color: "#6366f1" }}>.hub</span>
            </span>
            <span
              style={{
                display: "block",
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "#94a3b8",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginTop: "-3px",
              }}
            >
              Dynamic QR & Links
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            className={`btn ${activeTab === "home" ? "btn-secondary" : ""}`}
            onClick={() => setActiveTab("home")}
            style={{
              background:
                activeTab === "home" ? "rgba(91,87,229,0.1)" : "transparent",
              color: "#4d4c6d",
            }}
          >
            Beranda
          </button>

          {user && (
            <button
              className={`btn ${activeTab === "dashboard" ? "btn-secondary" : ""}`}
              onClick={() => setActiveTab("dashboard")}
              style={{
                background:
                  activeTab === "dashboard"
                    ? "rgba(91,87,229,0.1)"
                    : "transparent",
                color: "#4d4c6d",
              }}
            >
              <LayoutDashboard size={18} /> Dasbor
            </button>
          )}

          <button
            className="btn btn-primary"
            onClick={() => setActiveTab("create")}
          >
            <PlusCircle size={18} /> Buat QR Code
          </button>

          {/* User Auth Section */}
          {user ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginLeft: "0.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.4rem 0.85rem",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    background: "#6366f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                  {user.name}
                </span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={onLogout}
                title="Keluar"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button className="btn btn-secondary" onClick={onOpenAuth}>
              <LogIn size={18} /> Masuk
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
