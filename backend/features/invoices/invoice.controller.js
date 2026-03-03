const Invoice = require('./invoice.model');

exports.createInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.create({
      customerName: req.body.customerName,
      amount: req.body.amount,
      createdBy: req.user._id
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: 'Error creating invoice' });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    let invoices;

    if (req.user.role === 'admin') {
      invoices = await Invoice.find().populate('createdBy', 'email');
    } else {
      invoices = await Invoice.find({ createdBy: req.user._id });
    }

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices' });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Ownership or Admin check
    if (
      req.user.role !== 'admin' &&
      invoice.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: 'Forbidden: cannot delete this invoice'
      });
    }

    await invoice.deleteOne();

    res.json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting invoice' });
  }
};