const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const sendViaBrevo = async ({ to, subject, html }) => {
  if (!process.env.BREVO_API_KEY || !process.env.SMTP_USER) {
    console.warn("[mailer] BREVO_API_KEY or SMTP_USER is missing.");
    return null;
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "ShopSphere", email: process.env.SMTP_USER },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.message || "Brevo API error");
    err.details = data;
    throw err;
  }

  return data;
};

// ===============================
// Send Email
// ===============================
export const sendEmail = async (to, subject, html) => {
  console.log("===== BREVO CONFIG =====");
  console.log({
    sender: process.env.SMTP_USER,
    hasApiKey: !!process.env.BREVO_API_KEY,
  });

  try {
    console.log("Trying to send email...");

    const info = await sendViaBrevo({ to, subject, html });

    if (!info) {
      console.log("=================================");
      console.log("BREVO NOT CONFIGURED");
      console.log("TO:", to);
      console.log("SUBJECT:", subject);
      console.log("=================================");
      return;
    }

    console.log("✅ Email Sent");
    console.log(info.messageId);

    return info;
  } catch (err) {
    console.error("========== EMAIL ERROR ==========");
    console.error(err.details || err.message);

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