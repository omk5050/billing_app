const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = async function sendEmail(to, subject, text) {

  await transporter.sendMail({
    from: `"Billing System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  });

};
