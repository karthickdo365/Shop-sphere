import Twilio from 'twilio';

let client = null;

const getClient = () => {
  if (client) return client;
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }
  client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  return client;
};

const isConfigured = () => !!getClient();

/**
 * Send an SMS message via Twilio.
 * If not configured, logs to console.
 */
export const sendSms = async (to, body) => {
  const c = getClient();
  if (!c) {
    console.log('\n========================================');
    console.log('[sms] Twilio not configured — SMS preview:');
    console.log('To:', to);
    console.log('Body:', body);
    console.log('========================================\n');
    return { preview: true };
  }
  try {
    const msg = await c.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log('[sms] SMS sent:', msg.sid);
    return { sid: msg.sid };
  } catch (err) {
    console.error('[sms] Failed to send SMS:', err.message);
    throw err;
  }
};

/**
 * Send a WhatsApp message via Twilio.
 * Recipient must be in format: whatsapp:+<number>
 * If not configured, logs to console.
 */
export const sendWhatsApp = async (to, body) => {
  const c = getClient();
  const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
  const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  if (!c) {
    console.log('\n========================================');
    console.log('[whatsapp] Twilio not configured — WhatsApp preview:');
    console.log('To:', toFormatted);
    console.log('Body:', body);
    console.log('========================================\n');
    return { preview: true };
  }
  try {
    const msg = await c.messages.create({
      body,
      from,
      to: toFormatted,
    });
    console.log('[whatsapp] WhatsApp sent:', msg.sid);
    return { sid: msg.sid };
  } catch (err) {
    console.error('[whatsapp] Failed to send WhatsApp:', err.message);
    throw err;
  }
};

export const sendOtpSms = async (to, code, purpose = 'REGISTER') => {
  const body = `ShopSphere: Your verification code is ${code}. Valid for ${process.env.OTP_TTL_MINUTES || 10} minutes. Do not share this code with anyone.`;
  return sendSms(to, body);
};

export const sendOtpWhatsApp = async (to, code, purpose = 'REGISTER') => {
  const body = `*ShopSphere*\n\nYour verification code is: *${code}*\n\nThis code is valid for ${process.env.OTP_TTL_MINUTES || 10} minutes. Do not share this code with anyone.`;
  return sendWhatsApp(to, body);
};

export default { isConfigured, sendSms, sendWhatsApp, sendOtpSms, sendOtpWhatsApp };
