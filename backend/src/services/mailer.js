import nodemailer from "nodemailer";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    console.warn("[mailer] SMTP environment variables are missing.");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  });

  return transporter;
};

// ===============================
// Send Email
// ===============================
export const sendEmail = async (to, subject, html) => {
  const t = getTransporter();

  const from = `"ShopSphere" <${process.env.SMTP_USER}>`;

  if (!t) {
    console.log("=================================");
    console.log("SMTP NOT CONFIGURED");
    console.log("TO:", to);
    console.log("SUBJECT:", subject);
    console.log("=================================");
    return;
  }

  try {
    await t.verify();
    console.log("✅ SMTP Server Connected");

    const info = await t.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log("✅ Email Sent");
    console.log(info.messageId);

    return info;
  } catch (err) {
    console.error("========== EMAIL ERROR ==========");
    console.error(err);

    console.log("code:", err.code);
    console.log("response:", err.response);
    console.log("responseCode:", err.responseCode);
    console.log("command:", err.command);

    throw err;
  }
};

// ===============================
// Password Reset Email
// ===============================
export const sendPasswordResetEmail = async (
  to,
  resetUrl,
  userName
) => {
  const html = `
  <div style="font-family:Arial;padding:30px">
      <h2>Reset Password</h2>

      <p>Hello ${userName},</p>

      <p>Click the button below to reset your password.</p>

      <a href="${resetUrl}"
      style="
      background:#f43336;
      color:white;
      padding:12px 24px;
      text-decoration:none;
      border-radius:6px;
      display:inline-block;">
      Reset Password
      </a>

      <p>If the button doesn't work:</p>

      <p>${resetUrl}</p>

      <p>This link expires in 1 hour.</p>
  </div>
  `;

  return sendEmail(
    to,
    "ShopSphere - Reset Password",
    html
  );
};

// ===============================
// Verification Email
// ===============================
export const sendVerificationEmail = async (
  to,
  verifyUrl,
  userName
) => {
  const html = `
  <div style="font-family:Arial;padding:30px">

      <h2>Welcome to ShopSphere</h2>

      <p>Hello ${userName},</p>

      <p>Please verify your email address.</p>

      <a href="${verifyUrl}"
      style="
      background:#f43336;
      color:white;
      padding:12px 24px;
      text-decoration:none;
      border-radius:6px;
      display:inline-block;">
      Verify Email
      </a>

      <p>If the button doesn't work:</p>

      <p>${verifyUrl}</p>

      <p>This link expires in 1 hour.</p>

  </div>
  `;

  return sendEmail(
    to,
    "Verify your ShopSphere account",
    html
  );
};

// ===============================
// OTP Email
// ===============================
export const sendOtpEmail = async (
  to,
  code,
  userName
) => {
  const html = `
  <div style="font-family:Arial;padding:30px">

      <h2>Your OTP</h2>

      <p>Hello ${userName},</p>

      <h1 style="color:#f43336">${code}</h1>

      <p>This OTP expires in 10 minutes.</p>

  </div>
  `;

  return sendEmail(
    to,
    "Your ShopSphere OTP",
    html
  );
};