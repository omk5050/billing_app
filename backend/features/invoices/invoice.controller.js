const Invoice = require("./invoice.model");

/*
---------------------------------------------------
Create Invoice
---------------------------------------------------
*/
exports.createInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.create({
      customerName: req.body.customerName,
      amount: req.body.amount,
      createdBy: req.user._id
    });

    res.status(201).json(invoice);

  } catch (error) {
    res.status(500).json({
      message: "Error creating invoice"
    });
  }
};


/*
---------------------------------------------------
Get Invoices (Pagination + Filtering)
---------------------------------------------------
*/
exports.getInvoices = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const filter = {};

    // Ownership control
    if (req.user.role !== "admin") {
      filter.createdBy = req.user._id;
    }

    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Customer name search
    if (req.query.customerName) {
      filter.customerName = {
        $regex: req.query.customerName,
        $options: "i"
      };
    }

    /*
    -----------------------------------------
    Sorting Logic
    -----------------------------------------
    */

    let sort = { createdAt: -1 };

    if (req.query.sort) {
      const sortField = req.query.sort;

      if (sortField.startsWith("-")) {
        sort = { [sortField.substring(1)]: -1 };
      } else {
        sort = { [sortField]: 1 };
      }
    }

    const total = await Invoice.countDocuments(filter);

    const invoices = await Invoice.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort);

    res.json({
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      data: invoices
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching invoices"
    });
  }
};


/*
---------------------------------------------------
Update Invoice
---------------------------------------------------
*/
exports.updateInvoice = async (req, res) => {
  try {

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found"
      });
    }

    if (
      req.user.role !== "admin" &&
      invoice.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Forbidden: cannot update this invoice"
      });
    }

    invoice.customerName =
      req.body.customerName || invoice.customerName;

    invoice.amount =
      req.body.amount || invoice.amount;

    if (req.body.status) {

      const allowedTransitions = {
        pending: ["paid", "cancelled", "overdue"],
        overdue: ["paid"],
        paid: [],
        cancelled: []
      };

      const currentStatus = invoice.status;
      const newStatus = req.body.status;

      if (!allowedTransitions[currentStatus].includes(newStatus)) {
        return res.status(400).json({
          message: `Invalid status transition: ${currentStatus} → ${newStatus}`
        });
      }

      invoice.status = newStatus;
    }

    const updatedInvoice = await invoice.save();

    res.json(updatedInvoice);

  } catch (error) {
    res.status(500).json({
      message: "Error updating invoice"
    });
  }
};


/*
---------------------------------------------------
Delete Invoice
---------------------------------------------------
*/
exports.deleteInvoice = async (req, res) => {
  try {

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found"
      });
    }

    if (
      req.user.role !== "admin" &&
      invoice.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Forbidden: cannot delete this invoice"
      });
    }

    await invoice.deleteOne();

    res.json({
      message: "Invoice deleted"
    });

  } catch (error) {
    res.status(500).json({
      message: "Error deleting invoice"
    });
  }
};