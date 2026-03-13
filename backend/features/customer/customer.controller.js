const Customer = require("./customer.model");
const Invoice = require("../invoices/invoice.model");

exports.getCustomers = async (req, res, next) => {

  try {

    const customers = await Customer.find({
      createdBy: req.user._id,
      isDeleted: false
    });

    const result = await Promise.all(

      customers.map(async (c) => {

        const invoices = await Invoice.find({
          customerEmail: c.email
        });

        const totalInvoices = invoices.length;

        const totalAmount = invoices.reduce(
          (sum, i) => sum + i.amount,
          0
        );

        return {
          _id: c._id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          totalInvoices,
          totalAmount
        };

      })
    );

    res.json(result);

  } catch (err) {
    next(err);
  }
};



exports.createCustomer = async (req, res, next) => {

  try {

    const customer = await Customer.create({

      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,

      createdBy: req.user._id

    });

    res.status(201).json(customer);

  } catch (err) {
    next(err);
  }

};