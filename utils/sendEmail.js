import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

// Set the SendGrid API key
if (!process.env.SENDGRID_API_KEY) {
  console.error(" Missing SENDGRID_API_KEY in environment variables.");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// ==========================
// Generic Send Email Function
// ==========================
export const sendEmail = async (to, subject, html) => {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_EMAIL, // must match verified sender in SendGrid
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log(` Email sent successfully to ${to}`);
  } catch (error) {
    console.error(` Failed to send email to ${to}`);
    console.error(error.response?.body || error.message);

    // Re-throw for controller to catch
    throw new Error(
      error.response?.body?.errors?.[0]?.message || error.message
    );
  }
};

// ==========================
// Send Password Reset Email
// ==========================
export const sendResetLinkEmail = async (to, resetLink) => {
  const html = `
    <div style="font-family:Arial, sans-serif; line-height:1.6;">
      <h2 style="color:#1d4ed8;">Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <p>
        <a href="${resetLink}" target="_blank" style="color:#2563eb; font-weight:bold;">
          Reset Password
        </a>
      </p>
      <p>If you didn’t request a password reset, please ignore this email.</p>
      <hr/>
      <small style="color:#6b7280;">This email was sent by News App.</small>
    </div>
  `;
  return sendEmail(to, "Reset Your Password - News App", html);
};

// ==========================
// Send Breaking News Email
// ==========================
export const sendBreakingNewsEmail = async (to, headline, link, content = "") => {
  const html = `
    <div style="font-family:Arial, sans-serif; line-height:1.6;">
      <h2 style="color:#dc2626;">📰 Breaking News Alert</h2>
      <h3>${headline}</h3>
      ${content ? `<p>${content}</p>` : ""}
      <p>
        <a href="${link}" target="_blank" style="color:#2563eb; font-weight:bold; text-decoration:none;">
          Read Full Article →
        </a>
      </p>
      <hr/>
      <small style="color:#6b7280;">You are receiving this alert from News App.</small>
    </div>
  `;
  return sendEmail(to, "Breaking News Alert", html);
};