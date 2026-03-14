const Invoice = require("../invoices/invoice.model");

/*
--------------------------------------------------
TOTAL REVENUE
GET /api/reports/total-revenue
--------------------------------------------------
*/
exports.getTotalRevenue = async (req, res) => {

  try {

    const match = {
      status: "paid",
      isDeleted: false
    };

    if (req.user.role !== "admin") {
      match.createdBy = req.user._id;
    }

    const result = await Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" }
        }
      }
    ]);

    const totalRevenue = result[0]?.totalRevenue || 0;

    res.json({ totalRevenue });

  } catch (error) {

    res.status(500).json({
      message: "Error calculating total revenue"
    });

  }

};



/*
--------------------------------------------------
INVOICE COUNT
GET /api/reports/invoice-count
--------------------------------------------------
*/
exports.getInvoiceCount = async (req, res) => {

  try {

    const filter = { isDeleted: false };

    if (req.user.role !== "admin") {
      filter.createdBy = req.user._id;
    }

    const count = await Invoice.countDocuments(filter);

    res.json({
      totalInvoices: count
    });

  } catch (error) {

    res.status(500).json({
      message: "Error fetching invoice count"
    });

  }

};



/*
--------------------------------------------------
STATUS BREAKDOWN
GET /api/reports/status-breakdown
--------------------------------------------------
*/
exports.getStatusBreakdown = async (req, res) => {

  try {

    const match = { isDeleted: false };

    if (req.user.role !== "admin") {
      match.createdBy = req.user._id;
    }

    const result = await Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(result);

  } catch (error) {

    res.status(500).json({
      message: "Error generating status report"
    });

  }

};



/*
--------------------------------------------------
MONTHLY REVENUE
GET /api/reports/monthly-revenue
--------------------------------------------------
*/
exports.getMonthlyRevenue = async (req, res) => {

  try {

    const match = {
      status: "paid",
      isDeleted: false
    };

    if (req.user.role !== "admin") {
      match.createdBy = req.user._id;
    }

    const result = await Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$amount" }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    res.json(result);

  } catch (error) {

    res.status(500).json({
      message: "Error calculating monthly revenue"
    });

  }

};



/*
--------------------------------------------------
PAYMENT METHOD BREAKDOWN
GET /api/reports/payment-methods
--------------------------------------------------
*/
exports.getPaymentMethods = async (req, res) => {

  try {

    const match = {
      status: "paid",
      isDeleted: false
    };

    if (req.user.role !== "admin") {
      match.createdBy = req.user._id;
    }

    const result = await Invoice.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$paymentMethod",
          total: { $sum: "$amount" }
        }
      }
    ]);

    res.json(result);

  } catch (error) {

    res.status(500).json({
      message: "Error calculating payment methods"
    });

  }

};