const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function sendEmail(to, subject, text) {

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: to,
    subject: subject,
    text: text
  });

};