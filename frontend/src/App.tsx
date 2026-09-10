import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { AuthModal } from "./components/AuthModal";
import { LandingPage } from "./pages/LandingPage";
import { CreateQRPage } from "./pages/CreateQRPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PublicViewPage } from "./pages/PublicViewPage";
import { authService } from "./services/api";
import type { User } from "./types";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<
    "home" | "create" | "dashboard" | "public"
  >("home");
  const [publicShortCode, setPublicShortCode] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Check URL hash for public view route e.g. #/p/abc1234
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#/p/")) {
        const code = hash.replace("#/p/", "");
        setPublicShortCode(code);
        setActiveTab("public");
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Restore User Session from localStorage
  useEffect(() => {
    const token = localStorage.getItem("qrfy_token");
    const storedUser = localStorage.getItem("qrfy_user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }

    if (token) {
      authService
        .getMe()
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem("qrfy_user", JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem("qrfy_token");
          localStorage.removeItem("qrfy_user");
          setUser(null);
        });
    }
  }, []);

  const handleAuthSuccess = (loggedUser: User, token: string) => {
    setUser(loggedUser);
    localStorage.setItem("qrfy_token", token);
    localStorage.setItem("qrfy_user", JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    localStorage.removeItem("qrfy_token");
    localStorage.removeItem("qrfy_user");
    setUser(null);
    setActiveTab("home");
  };

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* Navigation Header */}
      {activeTab !== "public" && (
        <Navbar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Main Content Pages */}
      <main style={{ flex: 1 }}>
        {activeTab === "home" && (
          <LandingPage onStartCreate={() => setActiveTab("create")} />
        )}

        {activeTab === "create" && (
          <CreateQRPage
            user={user}
            onOpenAuth={() => setIsAuthOpen(true)}
            onCreatedSuccess={() => setActiveTab("dashboard")}
          />
        )}

        {activeTab === "dashboard" && user && (
          <DashboardPage
            user={user}
            onNavigateCreate={() => setActiveTab("create")}
          />
        )}

        {activeTab === "public" && publicShortCode && (
          <PublicViewPage shortCode={publicShortCode} />
        )}
      </main>

      {/* Footer */}
      {activeTab !== "public" && (
        <footer
          style={{
            borderTop: "1px solid #e4e1f2",
            backgroundColor: "rgba(255, 255, 255, 0.62)",
            padding: "2rem 1.5rem",
            textAlign: "center",
            color: "#72738d",
            fontSize: "0.9rem",
          }}
        >
          <p>
            © 2026 QRFY LinkHub Platform. Designed for Enterprise QR Code
            Management.
          </p>
        </footer>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;
