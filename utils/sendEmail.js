const nodemailer = require('nodemailer');

const sendEmail = async (to, productName, fileUrl) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"AIFCM Store" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `Your AIFCM Purchase - ${productName}`,
    html: `
      <h2>Thank you for your purchase!</h2>
      <p>You’ve successfully purchased <strong>${productName}</strong>.</p>
      <p>Click below to download your product:</p>
      <p><a href="${fileUrl}" target="_blank" style="background: #28a745; padding: 10px 15px; color: white; text-decoration: none; border-radius: 5px;">Download Product</a></p>
      <p>If you have any issues, just reply to this email!</p>
    `
  });

  console.log(`📧 Email sent to ${to}`);
};

module.exports = sendEmail;
