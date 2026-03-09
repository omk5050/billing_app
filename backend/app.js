const express = require('express');
const cors = require('cors');
const authRoutes = require('./features/auth/auth.routes');
const invoiceRoutes = require('./features/invoices/invoice.routes');
const reportRoutes = require("./features/reports/reports.routes");
const errorHandler = require("./middleware/error.middleware");
const { apiLimiter } = require('./middleware/rateLimit.middleware');  
const logger = require('./middleware/logger.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use("/api/reports", reportRoutes);
app.use('/api', apiLimiter);
app.use(errorHandler);
app.use(logger);
module.exports = app;



