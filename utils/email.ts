import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.NEXT_EMAIL_HOST,
  port: Number(process.env.NEXT_EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.NEXT_EMAIL_USER,
    pass: process.env.NEXT_EMAIL_PASS,
  },
});

export async function sendEmail(data: {
  from: string;
  to: string;
  subject: string;
  html: string;
}) {
  const { from, to, subject, html } = data;
  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
}
