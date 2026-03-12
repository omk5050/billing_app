exports.getCustomers = async (req, res) => {
  try {

    const customers = await Invoice.aggregate([
      {
        $match: {
          createdBy: req.user._id,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            name: "$customerName",
            email: "$customerEmail"
          },
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id.name",
          email: "$_id.email",
          totalInvoices: 1,
          totalAmount: 1
        }
      }
    ])

    res.json(customers)

  } catch (error) {
    res.status(500).json({ message: "Failed to load customers" })
  }
}