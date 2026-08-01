import { createRequire } from "module";
const require = createRequire(import.meta.url);
const SibApiV3Sdk = require("@getbrevo/brevo");

let apiInstance = null;

const getBrevoInstance = () => {
  if (apiInstance) return apiInstance;

  if (!process.env.BREVO_API_KEY || !process.env.SMTP_USER) {
    console.warn("[mailer] BREVO_API_KEY or SMTP_USER is missing.");
    return null;
  }

  apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  apiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
  );

  return apiInstance;
};
// ===============================
// Send Email
// ===============================
export const sendEmail = async (to, subject, html) => {
  const api = getBrevoInstance();

  console.log("===== BREVO CONFIG =====");
  console.log({
    sender: process.env.SMTP_USER,
    hasApiKey: !!process.env.BREVO_API_KEY,
  });

  if (!api) {
    console.log("=================================");
    console.log("BREVO NOT CONFIGURED");
    console.log("TO:", to);
    console.log("SUBJECT:", subject);
    console.log("=================================");
    return;
  }

  const email = new SibApiV3Sdk.SendSmtpEmail();
  email.sender = { name: "ShopSphere", email: process.env.SMTP_USER };
  email.to = [{ email: to }];
  email.subject = subject;
  email.htmlContent = html;

  try {
    console.log("Trying to send email...");

    const info = await api.sendTransacEmail(email);

    console.log("✅ Email Sent");
    console.log(info.body?.messageId);

    return info;
  } catch (err) {
    console.error("========== EMAIL ERROR ==========");
    console.error(err.response?.body || err.message);

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