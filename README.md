# pkctechs — Live Indian IPO Intelligence & Allotment Tracker 🚀

A real-time Indian Initial Public Offering (IPO) tracking and allotment verification platform built by **pkctechs** using Next.js, Node.js, Express, MongoDB, and Upstox Primary Market stream.

---

## ✨ Features

- 📈 **Live IPO Market Feed**: Real-time IPO data directly streamed from Upstox Primary Market API.
- 🏢 **Mainboard & SME Support**: Dynamic categorization, price bands, lot size calculation, and issue sizes in Crores (₹ Cr).
- 📊 **Groww & Chittorgarh Style Details**:
  - Full-screen detailing pages for each IPO.
  - Complete Lot Size & Investment tier matrix (Retail Min/Max, sNII, bNII).
  - Editorial overview with keyword insights.
  - Timetable milestone stepper (Open, Close, Allotment, Refund, Listing).
  - Category reservation percentages (QIB, NII, Retail).
- 🛡️ **Allotment Status Checker Hub**:
  - Fast status lookup by PAN Number, Application Number, or DP Client ID.
  - Direct 1-click links to major SEBI registrars (*Link Intime, KFintech, Bigshare, Maashitla, Skyline*).
- 🌐 **SEO & Google SERP Sitelinks**:
  - Schema.org JSON-LD structured data (`WebSite`, `Organization`, `SiteNavigationElement`, `FinancialProduct`, `BreadcrumbList`).
  - Google Sitelinks SearchBox support.
  - Dynamic `sitemap.xml` and `robots.txt`.
- 🎨 **Modern Minimalist Slate UI**: Clean, responsive, 100% blue-free slate-gray design system.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), Vanilla CSS Design System, Inter Font, Turbopack.
- **Backend**: Node.js, Express, Mongoose, Upstox Primary Market API, robust DNS resolvers.
- **Database**: MongoDB Atlas / Local MongoDB.

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 📄 License
© pkctechs. All rights reserved.
