const express = require('express');
const cors = require('cors');

const authRoutes = require('./features/auth/auth.routes');
const invoiceRoutes = require('./features/invoices/invoice.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
module.exports = app;

