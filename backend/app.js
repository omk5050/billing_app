const express = require("express");
const cors = require("cors");

const authRoutes = require("./features/auth/auth.routes");
const invoiceRoutes = require("./features/invoices/invoice.routes");
const reportRoutes = require("./features/reports/reports.routes");
const customerRoutes = require("./features/customer/customer.routes")

const errorHandler = require("./middleware/error.middleware");
const { apiLimiter } = require("./middleware/rateLimit.middleware");
const logger = require("./middleware/logger.middleware");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

/* Core middleware */
app.use(cors());
app.use(express.json());

/* Request logger */
app.use(logger);

/* Rate limiter */
app.use("/api", apiLimiter);

/* Health check */
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

/* Swagger docs */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* Routes */
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/reports", reportRoutes);

/* Global error handler */
app.use(errorHandler);

/* Customers */
app.use("/api/customer", customerRoutes)

module.exports = app;