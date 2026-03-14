const cron = require("node-cron");
const Invoice = require("../features/invoices/invoice.model");
const sendEmail = require("../utils/email");

/*
SAFE TESTING MODE
Runs every minute. Sends ALL emails to the developer.
*/
cron.schedule("* * * * *", async () => {
  try {
    console.log("Running TEST reminder job...");
    const today = new Date();

    const invoices = await Invoice.find({
      status: "pending",
      dueDate: { $lte: today },
      isDeleted: false
    });

    console.log(`Found ${invoices.length} overdue invoices for testing.`);

    for (const invoice of invoices) {
      const message = `
Hello ${invoice.customerName},

This is a friendly reminder that your payment of ₹${invoice.amount} was due on ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}.

Please complete your payment as soon as possible.

Thank you!
      `;

      // 🛑 SAFE TESTING OVERRIDE: 
      // Sends to your email instead of the customer's email!
      const myTestEmail = "darklight509612@gmail.com"; 

      await sendEmail(
        myTestEmail, 
        `[TEST] Invoice Payment Reminder for ${invoice.customerName}`,
        message
      );

      // Update the status
      invoice.status = "overdue";
      await invoice.save();

      console.log(`Test email sent to you for: ${invoice.customerName}`);
    }

  } catch (error) {
    console.error("Reminder job error:", error);
  }
});