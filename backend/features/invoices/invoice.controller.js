const Invoice = require("./invoice.model");

/*
---------------------------------------------------
Create Invoice
POST /api/invoices
---------------------------------------------------
*/
exports.createInvoice = async (req, res, next) => {
  try {

    const invoice = await Invoice.create({
      customerName: req.body.customerName,
      amount: req.body.amount,
      createdBy: req.user._id
    });

    res.status(201).json(invoice);

  } catch (error) {
    next(error);
  }
};



/*
---------------------------------------------------
Get All Invoices
GET /api/invoices
Pagination + Filtering + Sorting
---------------------------------------------------
*/
exports.getInvoices = async (req, res, next) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const filter = {};

    // Ownership control
    if (req.user.role !== "admin") {
      filter.createdBy = req.user._id;
    }

    // Status filtering
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Customer search
    if (req.query.customerName) {
      filter.customerName = {
        $regex: req.query.customerName,
        $options: "i"
      };
    }

    /*
    -----------------------------------------
    Sorting
    -----------------------------------------
    */

    let sort = { createdAt: -1 };

    if (req.query.sort) {

      const field = req.query.sort;

      if (field.startsWith("-")) {
        sort = { [field.substring(1)]: -1 };
      } else {
        sort = { [field]: 1 };
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
    next(error);
  }
};



/*
---------------------------------------------------
Get Single Invoice
GET /api/invoices/:id
---------------------------------------------------
*/
exports.getInvoiceById = async (req, res, next) => {
  try {

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      res.status(404);
      throw new Error("Invoice not found");
    }

    // Ownership control
    if (
      req.user.role !== "admin" &&
      invoice.createdBy.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error("Forbidden: cannot access this invoice");
    }

    res.json(invoice);

  } catch (error) {
    next(error);
  }
};



/*
---------------------------------------------------
Update Invoice
PUT /api/invoices/:id
---------------------------------------------------
*/
exports.updateInvoice = async (req, res, next) => {
  try {

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      res.status(404);
      throw new Error("Invoice not found");
    }

    // Ownership check
    if (
      req.user.role !== "admin" &&
      invoice.createdBy.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error("Forbidden: cannot update this invoice");
    }

    // Update fields
    invoice.customerName =
      req.body.customerName || invoice.customerName;

    invoice.amount =
      req.body.amount || invoice.amount;


    /*
    -----------------------------------------
    Status Transition Validation
    -----------------------------------------
    */

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
        res.status(400);
        throw new Error(
          `Invalid status transition: ${currentStatus} → ${newStatus}`
        );
      }

      invoice.status = newStatus;

    }

    const updatedInvoice = await invoice.save();

    res.json(updatedInvoice);

  } catch (error) {
    next(error);
  }
};



/*
---------------------------------------------------
Delete Invoice
DELETE /api/invoices/:id
---------------------------------------------------
*/
exports.deleteInvoice = async (req, res, next) => {
  try {

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      res.status(404);
      throw new Error("Invoice not found");
    }

    // Ownership check
    if (
      req.user.role !== "admin" &&
      invoice.createdBy.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error("Forbidden: cannot delete this invoice");
    }

    await invoice.deleteOne();

    res.json({
      message: "Invoice deleted"
    });

  } catch (error) {
    next(error);
  }
};