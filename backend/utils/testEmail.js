// testEmail.js
require("dotenv").config();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {

  await resend.emails.send({
  from: "onboarding@resend.dev",
  to: "darklight509612@gmail.com",
  subject: "Billing System Test",
  text: "Your billing reminder system email service works."
});

  console.log("Email sent successfully");

}

testEmail();