import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (to, subject, html) => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM,
      subject,
      html,
    };
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.response?.body || error.message);
    throw error;
  }
};

// Breaking news email wrapper
export const sendBreakingNewsEmail = (to, headline, link, content = "") => {
  const html = `
    <div style="font-family:sans-serif;line-height:1.5">
      <h2 style="color:#b91c1c;">Breaking News</h2>
      <h3>${headline}</h3>
      ${content ? `<p>${content}</p>` : ""}
      <p>
        <a href="${link}" target="_blank" style="color:#ef4444;font-weight:bold;text-decoration:none;">
          Read Full Article →
        </a>
      </p>
      <hr/>
      <small style="color:#6b7280;">You are receiving this email from News App.</small>
    </div>
  `;
  return sendEmail(to, "Breaking News Alert", html);
};