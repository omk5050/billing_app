const cron = require("node-cron");
const Invoice = require("../features/invoices/invoice.model");
const sendEmail = require("../utils/email");

/*
Invoice Reminder Job
Runs every minute for testing
*/

cron.schedule("* * * * *", async () => {

  try {

    console.log("Running invoice reminder job");

    const today = new Date();

    const invoices = await Invoice.find({
      status: "pending",
      dueDate: { $lte: today },
      isDeleted: false
    });

    console.log(`Found ${invoices.length} invoices`);

    for (const invoice of invoices) {

      const message = `
Invoice Reminder

Customer: ${invoice.customerName}
Amount: ₹${invoice.amount}
Due Date: ${invoice.dueDate}

Please complete your payment.
`;

      await sendEmail(
        invoice.customerEmail,
        "Invoice Payment Reminder",
        message
      );

    }

  } catch (error) {

    console.error("Reminder job error:", error);

  }

});