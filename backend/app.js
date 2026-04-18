const path = require("path");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./features/auth/auth.routes");
const invoiceRoutes = require("./features/invoices/invoice.routes");
const reportRoutes = require("./features/reports/reports.routes");
const customerRoutes = require("./features/customer/customer.routes");

const errorHandler = require("./middleware/error.middleware");
const { apiLimiter } = require("./middleware/rateLimit.middleware");
const logger = require("./middleware/logger.middleware");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

/* ─── Core middleware ──────────────────────────────────────────────── */
app.use(cors());
app.use(express.json());

/* ─── Request logger ───────────────────────────────────────────────── */
app.use(logger);

/* ─── Rate limiter ─────────────────────────────────────────────────── */
app.use("/api", apiLimiter);

/* ─── Health check ─────────────────────────────────────────────────── */
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

/* ─── Swagger docs ─────────────────────────────────────────────────── */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ─── API Routes ───────────────────────────────────────────────────── */
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api", customerRoutes);          // /api/customers

/* ─── Global error handler (must come after all API routes) ────────── */
app.use(errorHandler);

/* ─── Serve static frontend files ──────────────────────────────────── */
/*
 * On Render this single service hosts both the API (/api/*) and
 * the static HTML/CSS/JS files. The frontend directory sits one
 * level above this file (billing-app/frontend).
 */
const FRONTEND_DIR = path.join(__dirname, "../frontend");

app.use(express.static(FRONTEND_DIR));

/*
 * Catch-all: for any non-API GET request that doesn't match a static
 * file, send index.html so client-side navigation works (e.g. if the
 * user refreshes on /invoices.html the file is still served correctly).
 * Uses app.use() instead of app.get("*") for Express v5 compatibility.
 */
app.use((req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

module.exports = app;