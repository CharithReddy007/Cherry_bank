const nodemailer = require('nodemailer');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTP(email, otp) {
  console.log(`\n🔑 OTP for ${email}: ${otp}\n`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  await transporter.sendMail({
    from: `"SecureBank" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your SecureBank verification code',
    html: `<div style="font-family:serif;max-width:480px;margin:auto;padding:40px">
      <h2 style="color:#1a3a2a">SecureBank</h2>
      <p>Your one-time verification code is:</p>
      <h1 style="letter-spacing:8px;color:#1a3a2a">${otp}</h1>
      <p style="color:#666;font-size:13px">This code expires in 10 minutes. Do not share it.</p>
    </div>`
  });
}

module.exports = { generateOTP, sendOTP };
