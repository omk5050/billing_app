const Invoice = require("../invoices/invoice.model");

/*
-----------------------------------------
Total Revenue
-----------------------------------------
GET /api/reports/total-revenue
*/
exports.getTotalRevenue = async (req, res) => {
  try {
    const result = await Invoice.aggregate([
      { $match: { status: "paid" } },
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
-----------------------------------------
Invoice Count
-----------------------------------------
GET /api/reports/invoice-count
*/
exports.getInvoiceCount = async (req, res) => {
  try {
    const count = await Invoice.countDocuments();

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
-----------------------------------------
Status Breakdown
-----------------------------------------
GET /api/reports/status-breakdown
*/
exports.getStatusBreakdown = async (req, res) => {
  try {

    const result = await Invoice.aggregate([
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
-----------------------------------------
Monthly Revenue
-----------------------------------------
GET /api/reports/monthly-revenue
*/
exports.getMonthlyRevenue = async (req, res) => {
  try {

    const result = await Invoice.aggregate([
      { $match: { status: "paid" } },
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