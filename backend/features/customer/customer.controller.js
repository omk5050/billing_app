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

    const {
      customerName,
      customerEmail,
      phone,
      invoiceDate,
      dueDate,
      items,
      paymentMethod,
      status,
      amount
    } = req.body;


    /* ------------------------------
       AUTO CREATE CUSTOMER
    --------------------------------*/

    let customer = await Customer.findOne({
      email: customerEmail,
      createdBy: req.user._id
    });

    if (!customer) {

      customer = await Customer.create({
        name: customerName,
        email: customerEmail,
        phone: phone,
        createdBy: req.user._id
      });

    }


    /* ------------------------------
       CREATE INVOICE
    --------------------------------*/

    const invoice = await Invoice.create({

      customerName,
      customerEmail,
      phone,

      invoiceDate,
      dueDate,

      items,

      paymentMethod,
      status: status || "pending",

      amount,

      createdBy: req.user._id

    });


    res.status(201).json(invoice);

  } catch (error) {
    next(error);
  }

};