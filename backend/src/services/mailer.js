import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn("[mailer] SMTP env vars not set");
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

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  return transporter;
};
/**
 * Send an email. If SMTP is not configured, the message is logged instead.
 * @param {string} to
 * @param {string} subject
 * @param {string} html
 */
export const sendEmail = async (to, subject, html) => {
  const t = getTransporter();
  const from = process.env.SMTP_FROM || 'ShopSphere <noreply@shopsphere.com>';

  if (!t) {
    console.log('\n========================================');
    console.log('[mailer] SMTP not configured — email preview:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML:', html);
    console.log('========================================\n');
    return { preview: true };
  }
  transporter.verify(function (error, success) {
  if (error) {
    console.log("SMTP VERIFY ERROR");
    console.log(error);
  } else {
    console.log("SMTP Server is ready");
  }
});

  try {
    const info = await t.sendMail({ from, to, subject, html });
    console.log('[mailer] Email sent:', info.messageId);
    return { messageId: info.messageId };
  } catch (err) {
  console.error("EMAIL ERROR");
  console.error(err);

  console.error("code:", err.code);
  console.error("response:", err.response);
  console.error("responseCode:", err.responseCode);
  console.error("command:", err.command);

  throw err;
}
};

export const sendPasswordResetEmail = async (to, resetUrl, userName) => {
  const html = `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #2e2e2e;">
      <div style="background: #f43336; padding: 16px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700;">Shop<span style="opacity:0.9">Sphere</span></h1>
      </div>
      <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <h2 style="font-size: 18px; margin: 0 0 16px;">Reset your password</h2>
        <p style="margin: 0 0 12px;">Hi ${userName || 'there'},</p>
        <p style="margin: 0 0 16px;">We received a request to reset your ShopSphere account password. Click the button below to set a new password:</p>
        <p style="margin: 0 0 16px; text-align: center;">
          <a href="${resetUrl}" style="background: #f43336; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Reset Password</a>
        </p>
        <p style="margin: 0 0 8px; font-size: 13px; color: #6b6b6b;">Or copy this link into your browser:</p>
        <p style="margin: 0 0 16px; font-size: 13px; color: #f43336; word-break: break-all;">${resetUrl}</p>
        <p style="margin: 0 0 8px; font-size: 13px; color: #6b6b6b;">This link expires in 1 hour.</p>
        <p style="margin: 0 0 8px; font-size: 13px; color: #6b6b6b;">If you didn't request a password reset, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
        <p style="margin: 0; font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} ShopSphere. All rights reserved.</p>
      </div>
    </div>
  `;
  return sendEmail(to, 'ShopSphere - Reset your password', html);
};

export const sendOtpEmail = async (to, code, userName, purpose = 'REGISTER') => {
  const purposeText = purpose === 'REGISTER' ? 'verify your email and activate your account'
    : purpose === 'LOGIN' ? 'log in to your account'
    : 'complete your request';
  const html = `
    <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #2e2e2e;">
      <div style="background: #f43336; padding: 16px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700;">Shop<span style="opacity:0.9">Sphere</span></h1>
      </div>
      <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <h2 style="font-size: 18px; margin: 0 0 16px;">Your verification code</h2>
        <p style="margin: 0 0 12px;">Hi ${userName || 'there'},</p>
        <p style="margin: 0 0 20px;">Use the code below to ${purposeText}.</p>
        <div style="text-align: center; margin: 24px 0;">
          <div style="display: inline-block; font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; background: #f7f7f7; padding: 16px 32px; border-radius: 8px; border: 2px dashed #f43336; color: #f43336;">${code}</div>
        </div>
        <p style="margin: 0 0 8px; font-size: 13px; color: #6b6b6b;">This code expires in ${process.env.OTP_TTL_MINUTES || 10} minutes.</p>
        <p style="margin: 0 0 8px; font-size: 13px; color: #6b6b6b;">If you didn't request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
        <p style="margin: 0; font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} ShopSphere. All rights reserved.</p>
      </div>
    </div>
  `;
  return sendEmail(to, `ShopSphere - Your OTP: ${code}`, html);
};
export const sendVerificationEmail = async (to, verifyUrl, userName) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">

      <h2>Welcome to ShopSphere</h2>

     <p>Hi ${userName || "there"},</p>

      <p>Click the button below to verify your email address.</p>

      <a href="${verifyUrl}"
      style="
      background:#f43336;
      color:#fff;
      padding:12px 24px;
      text-decoration:none;
      border-radius:6px;
      display:inline-block;">
      Verify Email
      </a>

      <p>This link expires in 1 hour.</p>

    </div>
  `;

  return sendEmail(
    to,
    "Verify your ShopSphere account",
    html
  );
};