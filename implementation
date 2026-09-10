# Implementation Plan: QRFY Clone (QR Code Generator & Link Hub Platform)

Build a full-stack, enterprise-grade QR code generator and link management platform inspired by QRFY.com. The application allows users to create, customize, track, and manage static and dynamic QR codes with rich landing pages (vCard, Linktree/Bio Link, WiFi, Menu, PDF viewer) and detailed scan analytics.

---

## Technical Architecture Overview

```
                          ┌────────────────────────────────────────────────────────┐
                          │                      FRONTEND                          │
                          │   Vite + React 19 + TypeScript + Lucide Icons          │
                          │   - QR Code Canvas Engine & Real-time Live Preview     │
                          │   - Landing Page Generators (vCard, BioLink, Menu)     │
                          │   - Dashboard, Analytics Charts & Export (PNG/SVG)    │
                          └──────────────────────────┬─────────────────────────────┘
                                                     │ HTTP REST API
                                                     ▼
                          ┌────────────────────────────────────────────────────────┐
                          │                       BACKEND                          │
                          │   Node.js + Express 5 + SQLite (sqlite3 / sqlite)     │
                          │   - JWT Auth & User Management                         │
                          │   - Dynamic QR Shortlink Engine (/r/:shortCode)        │
                          │   - Scan Analytics Engine (IP, User-Agent, Device)     │
                          │   - QR Data Storage & Custom Styling Metadata Storage  │
                          └────────────────────────────────────────────────────────┘
```

---

## Key Features & Capabilities

1. **User Authentication & Dashboard**
   - User Registration, Login, JWT authentication, protected API endpoints.
   - Project dashboard listing user's QR codes, status (active/paused), total scans, and quick actions.

2. **Dynamic QR Code Types**
   - **Website / URL**: Dynamic redirection to any web destination.
   - **vCard Plus / Digital Business Card**: Interactive digital card with photo, contact info, job title, company, click-to-call, email, and `.vcf` download.
   - **Bio Link / Link Tree**: Custom page with avatar, bio, links buttons, social icons, and theme customization.
   - **Wi-Fi**: Quick connect credentials for WPA/WPA2/WEP/Open networks.
   - **Text / WhatsApp / Email**: Instant messaging & pre-filled templates.

3. **Advanced Live QR Customizer & Styling Engine**
   - Custom Frame styles & Badge text (e.g. "SCAN ME", "VIEW MENU", "FOLLOW ME").
   - Color selection: Solid colors & Gradients for QR dots, background, and eye borders.
   - Pattern styles: Dots, rounded, square, smooth corners.
   - Logo Upload / Preset Logos: Center image embedding with custom scale & background padding.
   - Live Preview updates instantly as options change.

4. **Dynamic Redirection & Scan Analytics**
   - Dynamic short URLs (`/r/:shortId`) allowing destination editing *without re-printing the QR code*.
   - Scan tracking: Records timestamp, user-agent (Browser, OS, Device Type: Mobile/Desktop/Tablet), and referrer.
   - Analytics dashboard with scan counts over time, device breakdown, and top performing QR codes.

5. **Export & Download Options**
   - High-resolution SVG export for printing vector formats.
   - PNG export with customizable resolution scaling.

---

## Proposed Component Implementation Steps

---

### Phase 1: Backend Architecture (`/backend`)

#### [NEW] [server.ts](file:///c:/Users/LENOVO/OneDrive/Documents/project_bulanan/qr-link-hub/backend/src/server.ts)
- Express app setup with JSON middleware, CORS, error handler, and SQLite database initialization.

#### [NEW] [db.ts](file:///c:/Users/LENOVO/OneDrive/Documents/project_bulanan/qr-link-hub/backend/src/db.ts)
- SQLite database connection & schema migrations:
  - `users` (id, email, password_hash, name, created_at)
  - `qrcodes` (id, user_id, title, type, short_code, target_url, custom_data, style_config, scan_count, created_at, updated_at)
  - `scans` (id, qrcode_id, scanned_at, ip_address, user_agent, device_type, os, browser)

#### [NEW] [auth.ts](file:///c:/Users/LENOVO/OneDrive/Documents/project_bulanan/qr-link-hub/backend/src/middleware/auth.ts)
- JWT verification middleware for securing dashboard routes.

#### [NEW] [authController.ts](file:///c:/Users/LENOVO/OneDrive/Documents/project_bulanan/qr-link-hub/backend/src/controllers/authController.ts)
- Login, Register, Me endpoints.

#### [NEW] [qrController.ts](file:///c:/Users/LENOVO/OneDrive/Documents/project_bulanan/qr-link-hub/backend/src/controllers/qrController.ts)
- Create, List, Get, Update, Delete QR codes.
- Get Analytics per QR code.

#### [NEW] [redirectController.ts](file:///c:/Users/LENOVO/OneDrive/Documents/project_bulanan/qr-link-hub/backend/src/controllers/redirectController.ts)
- Public redirect handler `/r/:shortCode`:
  - Logs scan metadata (User Agent parsing for OS/Browser/Device).
  - Handles dynamic response: Redirects for URL, renders public Landing Page HTML for vCard, BioLink, Wi-Fi, etc.

---

### Phase 2: Frontend Architecture (`/frontend`)

#### [MODIFY] [index.css](file:///c:/Users/LENOVO/OneDrive/Documents/project_bulanan/qr-link-hub/frontend/src/index.css)
- Premium dark/light design system, modern gradients, glassmorphism card styles, button effects, custom scrollbars.

#### [NEW] [types.ts](file:///c:/Users/LENOVO/OneDrive/Documents/project_bulanan/qr-link-hub/frontend/src/types/index.ts)
- TypeScript interfaces for QR Code data, Styling configurations, vCard data, BioLink items, User auth state, Scan Analytics.

#### [NEW] [api.ts](file:///c:/Users/LENOVO/OneDrive/Documents/project_bulanan/qr-link-hub/frontend/src/services/api.ts)
- Axios API client with automatic JWT token attachment.

#### [NEW] [QRCodeCanvas.tsx](file:///c:/Users/LENOVO/OneDrive/Documents/project_bulanan/qr-link-hub/frontend/src/components/QRCodeCanvas.tsx)
- Custom QR rendering engine using HTML5 Canvas / SVG to render:
  - Outer Frame with badge text ("SCAN ME").
  - Customizable dot styles, eye shapes, gradient fill, center logo embedding.
  - Export capabilities to high-res PNG & SVG downloads.

#### [NEW] [Navbar.tsx](file:///c:/Users/LENOVO/OneDrive/Documents/project_bulanan/qr-link-hub/frontend/src/components/Navbar.tsx)
- Navigation bar with brand logo, quick "Create QR Code" button, Auth toggle, and User Menu.

#### [NEW] [LandingPage.tsx](file:///c:/Users/LENOVO/OneDrive/Documents/project_bulanan/qr-link-hub/frontend/src/pages/LandingPage.tsx)
- Homepage showcasing QRFY features, dynamic QR type selector, live demo generator, pricing cards, and FAQ.

#### [NEW] [DashboardPage.tsx](file:///c:/Users/LENOVO/OneDrive/Documents/project_bulanan/qr-link-hub/frontend/src/pages/DashboardPage.tsx)
- Dashboard displaying user QR codes with stats, search/filter, edit target URL, pause/activate toggle, scan analytics preview modal, download quick-actions.

#### [NEW] [CreateQRPage.tsx](file:///c:/Users/LENOVO/OneDrive/Documents/project_bulanan/qr-link-hub/frontend/src/pages/CreateQRPage.tsx)
- Step-by-step QR Creation Studio:
  - **Step 1: Choose Type** (URL, vCard, Bio Link, WiFi, WhatsApp, Text).
  - **Step 2: Enter Content & Metadata** (Form tailored to the selected QR type).
  - **Step 3: Customize Appearance** (Frame, Colors, Gradient, Logo, Eye styles).
  - **Step 4: Save & Download** (Generates dynamic link, saves to backend).

#### [NEW] [PublicViewPage.tsx](file:///c:/Users/LENOVO/OneDrive/Documents/project_bulanan/qr-link-hub/frontend/src/pages/PublicViewPage.tsx)
- Mobile-optimized landing page view when a dynamic QR code for vCard, Bio Link, WiFi, or WhatsApp is scanned or visited directly.

---

## Verification Plan

### Automated Build & Type Checks
1. Compile backend with TypeScript (`npx tsc --noEmit` or `npm run build` in `/backend`).
2. Build frontend with Vite (`npm run build` in `/frontend`).

### Functional Verification
1. **QR Generation & Styling**:
   - Create static & dynamic QR codes with custom colors, frame badges, and center logo.
   - Verify live canvas updates seamlessly without delay.
2. **Dynamic Redirection & Analytics**:
   - Scan / Visit dynamic link `/r/:shortId`.
   - Verify scan count updates in the Dashboard and analytics logs device/browser correctly.
   - Update target URL of an existing QR code and verify instant update without changing the QR code image.
3. **Public Landing Pages**:
   - Verify vCard page displays contact details and allows downloading `.vcf`.
   - Verify Bio Link page displays avatar, description, social buttons, and custom theme.
