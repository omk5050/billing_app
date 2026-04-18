# BillFlow – Advanced Invoice Management & OCR Scanner

BillFlow is a professional, full-stack monolith application designed for seamless invoice management. It features a sophisticated OCR-based bill scanning engine that allows users to quickly convert photos of receipts into structured digital invoices.

---

## 🚀 Key Features

### 1. **AI-Powered OCR Scanning**
- **Automated Extraction:** Instantly extract Customer Name, Email, Due Date, and Grand Totals from photos or PDFs of physical bills.
- **Adaptive Processing:** Uses a dual-pass image binarization pipeline to handle low-light or blurry scans.
- **Thread-Safe Queue:** Optimized for production with a singleton Tesseract worker and FIFO task queue.
- **Review-First UX:** Extracted data is presented in an editable review panel before saving to ensure 100% financial accuracy.

### 2. **Complete Invoice Lifecycle**
- **CRUD Operations:** Create, view, update, and soft-delete invoices.
- **Advanced Filtering:** Search and filter by status (Paid, Pending, Overdue), date ranges, or customer names.
- **Professional Dashboard:** Real-time KPIs for today's sales, monthly revenue, and payment breakdown.
- **Status Workflow:** Track payments from pending to settled.

### 3. **Enterprise-Grade Architecture**
- **Monolith Deployment:** Unified Node.js/Express backend that serves the static frontend, optimized for single-link deployment on Render.
- **Secure Auth:** JWT-based authentication with refresh token rotation.
- **Data Integrity:** Strict Mongoose schemas and ownership enforcement.

---

## 🛠️ Technology Stack

- **Backend:** Node.js, Express.js, MongoDB (Atlas)
- **Frontend:** HTML5, Vanilla JavaScript, Vanilla CSS, Bootstrap 5 (Styling Only)
- **OCR:** Tesseract.js (WASM) & Sharp (Image Processing)
- **Email:** Resend (Transactional Emails)
- **Date Management:** Day.js

---

## 📦 Deployment on Render

This project is configured as a **monolith**. Follow these steps to deploy:

1.  **Build Command:** `cd backend && npm install`
2.  **Start Command:** `node backend/server.js`

### Environment Variables Required
| Variable | Description |
| :--- | :--- |
| `MONGO_URI` | MongoDB Atlas Connection String |
| `JWT_SECRET` | Secret key for access tokens |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens |
| `EMAIL_FROM` | From address for Resend emails |
| `RESEND_API_KEY` | API Key from Resend.com |

---

## 📂 Project Structure

```text
├── backend
│   ├── features        # Modular feature controllers & routes
│   │   ├── auth        # JWT Authentication
│   │   └── invoices    # CRUD & OCR Scanning logic
│   ├── middleware      # Auth & Error handlers
│   ├── models          # Mongoose schemas
│   ├── utils           # Email & helper utilities
│   ├── app.js          # Express app & static serving
│   └── server.js       # Entry point & Worker Init
├── frontend
│   ├── assets          # CSS, JS, and Icons
│   ├── index.html      # Dashboard
│   ├── invoices.html   # Invoice Management
│   └── login.html      # Auth Entry
└── package.json        # Root-level scripts for Render
```

---

## 🛡️ Security & Performance
- **Rate Limiting:** Protects endpoints from brute-force attacks.
- **Memory Safety:** OCR images are processed in RAM and explicitly nullified to prevent memory leaks.
- **Fail-Fast Boot:** The server validates the OCR worker state before accepting traffic.
