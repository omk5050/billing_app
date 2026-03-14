const cron = require("node-cron");
const Invoice = require("../features/invoices/invoice.model");
const sendEmail = require("../utils/email");

// 🚀 LIVE MODE: Runs daily at 9:00 AM, sends to REAL customers.
cron.schedule("0 9 * * *", async () => {
  try {
    const today = new Date();
    const invoices = await Invoice.find({
      status: "pending",
      dueDate: { $lte: today },
      isDeleted: false
    });

    for (const invoice of invoices) {
      const message = `
Hello ${invoice.customerName},

This is a friendly reminder that your payment of ₹${invoice.amount} was due on ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}.

Please complete your payment as soon as possible.

Thank you!
      `;

      // Sends to the actual customer!
      await sendEmail(
        invoice.customerEmail, 
        "Invoice Payment Reminder - Overdue", 
        message
      );

      // Update the status to overdue
      invoice.status = "overdue";
      await invoice.save();
      
      console.log(`Live reminder sent to: ${invoice.customerEmail}`);
    }
  } catch (error) {
    console.error("Reminder job error:", error);
  }
});