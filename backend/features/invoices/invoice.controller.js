const Invoice = require("./invoice.model");


/*
---------------------------------------------------
Create Invoice
POST /api/invoices
---------------------------------------------------
*/
exports.createInvoice = async (req, res, next) => {
  try {
    console.log(req.body);
    const invoice = await Invoice.create({
      ...req.body,
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

    const filter = {
      isDeleted: false
    };

    // Ownership control
    if (req.user.role !== "admin") {
      filter.createdBy = req.user._id;
    }

    // Status filtering
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Customer search
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: "i" };
      
      const orConditions = [
        { customerName: searchRegex },
        { customerEmail: searchRegex }
      ];

      // Only add _id to search if it is a valid 24-character MongoDB ID
      if (req.query.search.match(/^[0-9a-fA-F]{24}$/)) {
        orConditions.push({ _id: req.query.search });
      }

      filter.$or = orConditions;
    }

    // Date filtering (NEW)
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      
      if (req.query.endDate) {
        // Set to the very end of the day so it includes all invoices from that day
        const end = new Date(req.query.endDate);
        end.setUTCHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
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
      .lean()
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

    if (!invoice || invoice.isDeleted) {
      res.status(404);
      throw new Error("Invoice not found");
    }

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

    if (!invoice || invoice.isDeleted) {
      res.status(404);
      throw new Error("Invoice not found");
    }

    if (
      req.user.role !== "admin" &&
      invoice.createdBy.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error("Forbidden: cannot update this invoice");
    }

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
Delete Invoice (SOFT DELETE)
DELETE /api/invoices/:id
---------------------------------------------------
*/
exports.deleteInvoice = async (req, res, next) => {
  try {

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice || invoice.isDeleted) {
      res.status(404);
      throw new Error("Invoice not found");
    }

    if (
      req.user.role !== "admin" &&
      invoice.createdBy.toString() !== req.user._id.toString()
    ) {
      res.status(403);
      throw new Error("Forbidden: cannot delete this invoice");
    }

    // SOFT DELETE
    invoice.isDeleted = true;
    invoice.deletedAt = new Date();

    await invoice.save();

    res.json({
      message: "Invoice deleted successfully"
    });

  } catch (error) {
    next(error);
  }
};