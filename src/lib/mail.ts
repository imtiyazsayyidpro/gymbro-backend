import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";

type SendMailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: SendMailOptions["attachments"];
};

function getGoogleMailCredentials() {
  const user = process.env.GOOGLE_MAIL_USER || process.env.SMTP_USER;
  const pass = process.env.GOOGLE_APP_PASSWORD || process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("GOOGLE_MAIL_USER and GOOGLE_APP_PASSWORD are required to send email");
  }

  return { user, pass };
}

export async function sendMail({ to, subject, html, text, attachments }: SendMailParams) {
  const { user, pass } = getGoogleMailCredentials();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
  const from = process.env.MAIL_FROM || `Gymbro <${user}>`;

  return transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
    attachments,
  });
}
