const cron = require("node-cron");
const Invoice = require("../features/invoices/invoice.model");
const sendEmail = require("../utils/email");

/*
Invoice Reminder Job
Runs every day at 9:00 AM
*/

cron.schedule("0 9 * * *", async () => {
  try {
    console.log("Running daily invoice reminder job...");

    const today = new Date();

    // Find invoices that are pending and past their due date
    const invoices = await Invoice.find({
      status: "pending",
      dueDate: { $lte: today },
      isDeleted: false
    });

    console.log(`Found ${invoices.length} overdue invoices.`);

    for (const invoice of invoices) {
      const message = `
Hello ${invoice.customerName},

This is a friendly reminder that your payment of ₹${invoice.amount} was due on ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}.

Please complete your payment as soon as possible.

Thank you!
`;

      await sendEmail(
        invoice.customerEmail,
        "Invoice Payment Reminder - Overdue",
        message
      );
    }

    console.log("Finished sending daily reminders.");

  } catch (error) {
    console.error("Reminder job error:", error);
  }
});