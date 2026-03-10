const cron = require("node-cron");
const Invoice = require("../features/invoices/invoice.model");
const sendEmail = require("../utils/email");
const sendSMS = require("../utils/sms");

/*
---------------------------------------
Invoice Reminder Job
Runs every minute (for testing)
---------------------------------------
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

    console.log(`Found ${invoices.length} pending invoices`);

    for (const invoice of invoices) {

      const message = `
Invoice Reminder

Amount: ₹${invoice.amount}
Due Date: ${invoice.dueDate}

Please complete your payment.
`;

      /* EMAIL */

      await sendEmail(
        invoice.customerEmail,
        "Invoice Payment Reminder",
        message
      );

      console.log(`Email sent to ${invoice.customerEmail}`);

      /* SMS */

      await sendSMS(
        invoice.customerPhone,
        `Invoice reminder: ₹${invoice.amount} due.`
      );

      console.log(`SMS sent to ${invoice.customerPhone}`);

    }

  } catch (error) {

    console.error("Reminder job error:", error);

  }

});