const { Resend } = require("resend");

/*
 * Lazy-initialise the Resend client so that importing this module
 * does NOT crash when RESEND_API_KEY hasn't been loaded yet (e.g.
 * during tests or when the env file path is wrong).
 */
let _resend = null;
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set in environment variables");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

module.exports = async function sendEmail(to, subject, text) {
  const resend = getResend();
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: to,
    subject: subject,
    text: text
  });
};