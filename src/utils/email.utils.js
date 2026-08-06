import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import {
  SMTP_USER,
  SMTP_PASS,
  SMTP_HOST,
  SMTP_PORT,
} from "../../config/env.config.js";
import logger from "./logger.utils.js";

export async function send_email(options) {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      // Appears in header & footer of e-mails
      name: "Mailgen",
      link: "https://mailgen.js/",
      // Optional product logo
      // logo: 'https://mailgen.js/img/logo.png'
    },
  });
  const emailBody = mailGenerator.generate(options.meilGenContent);

  // Generate the plaintext version of the e-mail (for clients that do not support HTML)
  const emailText = mailGenerator.generatePlaintext(options.meilGenContent);

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: "smtp.example.com", // sender address
      to: options.email, // list of recipients
      subject: options.subject, // subject line
      text: emailText, // plain text body
      html: emailBody, // HTML body
    });
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    // console.error("Error while sending mail:", err);
    logger.error({ error }, "Error while sending mail:");
    throw error;
  }
}

export const send_verification_otp = (userName, otp) => ({
  body: {
    name: userName,
    intro: "Welcome! Please verify your account to get started.",
    action: {
      instructions:
        "Enter this OTP to verify your account. It expires in 10 minutes:",
      button: {
        color: "#22BC66",
        text: `OTP: ${otp}`,
        link: "#",
      },
    },
    outro: "If you didn't request this, please ignore this email.",
  },
});

export const send_invitation_url = (userName, sender, url) => ({
  body: {
    name: userName,
    intro: `Hey!, ${userName}, You are invited to join Collaborate by ${sender}`,
    action: {
      instructions: "Click this button to join.",
      button: {
        color: "#22BC66",
        // text: `CLICK: ${url}`,
        text: "Accept Invitation",
        link: url,
      },
    },
    outro: "Thanks.",
  },
});
