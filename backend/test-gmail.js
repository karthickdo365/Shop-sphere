import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

console.log(process.env.SMTP_HOST);
console.log(process.env.SMTP_PORT);
console.log(process.env.SMTP_USER);
console.log(process.env.SMTP_SECURE);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

try {
  await transporter.verify();
  console.log("✅ SMTP Connected");

  const info = await transporter.sendMail({
    from: `"ShopSphere" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER,
    subject: "SMTP Test",
    text: "SMTP is working!",
  });

  console.log(info);
} catch (err) {
  console.error(err);
}