import { sendEmail } from "../services/mailer.js";

export const sendContactEmail = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const html = `
      <h2>New Contact Message</h2>

      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>

      <hr/>

      <p>${message}</p>
    `;

    await sendEmail(
      process.env.SMTP_USER,
      `Contact Form - ${subject}`,
      html
    );

    res.json({
      success: true,
      message: "Message sent successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};