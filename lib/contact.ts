// import { site } from './site';

// export type ContactMessage = { name: string; email: string; message: string };

// /**
//  * Delivers a contact message. There's no mail backend yet, so this opens the visitor's email app
//  * with the message pre-filled. Swap the body for a POST to your form service/API when you have one.
//  */
// export async function sendContactMessage({ name, email, message }: ContactMessage) {
//   const subject = encodeURIComponent(`Project enquiry from ${name}`);
//   const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
//   window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
// }

"use server";

import { headers } from "next/headers";
import { Resend } from "resend";

export type ContactMessage = {
  name: string;
  email: string;
  message: string;
  hp?: string;
  clientTime?: number;
};

export type ContactResponse = {
  success: boolean;
  error?: string;
};

const resend = new Resend(process.env.RESEND_API_KEY);

/** Escapes characters to safely render user text in email HTML */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// In-memory rate limiting map for basic protection (or use Redis / Upstash)
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(ip: string, limit = 3, windowMs = 60 * 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
    return false;
  }

  if (record.count >= limit) {
    return true;
  }

  record.count += 1;
  return false;
}

export async function sendContactMessage(
  data: ContactMessage,
): Promise<ContactResponse> {
  const { name, email, message, hp, clientTime } = data;

  // 1. HONEYPOT TRAP: If bots filled the hidden field, silently exit
  if (hp && hp.trim().length > 0) {
    return { success: true };
  }

  // 2. TIMING CHECK: Humans take more than 2.5 seconds to fill out 3 fields
  if (clientTime !== undefined && clientTime < 2500) {
    return { success: true };
  }

  // 3. IP RATE LIMIT: Limit to max 3 messages per IP per hour
  const headerList = await headers();
  const clientIp = headerList.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

  if (isRateLimited(clientIp, 3)) {
    return {
      success: false,
      error: 'Too many messages sent. Please wait an hour before sending another.',
    };
  }

  // 4. BASIC CONTENT HEURISTICS
  const linkCount = (message.match(/https?:\/\//gi) || []).length;
  if (linkCount > 2) {
    // Drop spam messages bloated with marketing/phishing links
    return { success: true };
  }
  
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return { success: false, error: "All fields are required." };
  }

  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL;
  if (!receiverEmail) {
    console.error("Missing CONTACT_RECEIVER_EMAIL environment variable");
    return { success: false, error: "Server configuration error." };
  }

  const safeName = escapeHtml(name.trim());
  const safeEmail = escapeHtml(email.trim());
  const safeMessage = escapeHtml(message.trim());
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://portfolio.com";
  const currentYear = new Date().getFullYear();

  // 1. Email template sent to YOU (the owner)
  const ownerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Portfolio Inquiry</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5; -webkit-font-smoothing: antialiased;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; margin: 0 auto; background-color: #121214; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 48px rgba(0, 0, 0, 0.5);">
    <!-- MetaBar Header -->
    <tr>
      <td style="padding: 22px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600; color: #a1a1aa;">
              PORTFOLIO / INQUIRY
            </td>
            <td align="right" style="font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #71717a; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">
              ${currentYear}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 36px 32px 32px;">
        <h1 style="margin: 0 0 24px; font-size: 26px; font-weight: 500; letter-spacing: -0.03em; line-height: 1.25; color: #ffffff;">
          New transmission from <span style="color: #60a5fa;">${safeName}</span>
        </h1>

        <!-- Sender Detail Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #18181b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 13px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; width: 70px;">
              From
            </td>
            <td style="padding: 13px 18px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); font-size: 14px; font-weight: 500; color: #fafafa;">
              ${safeName}
            </td>
          </tr>
          <tr>
            <td style="padding: 13px 18px; font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; width: 70px;">
              Email
            </td>
            <td style="padding: 13px 18px; font-size: 14px; color: #fafafa;">
              <a href="mailto:${safeEmail}" style="color: #ffffff; text-decoration: underline; text-underline-offset: 3px;">
                ${safeEmail}
              </a>
            </td>
          </tr>
        </table>

        <!-- Message Block -->
        <div style="font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #71717a; font-weight: 600; margin-bottom: 10px;">
          Message Content
        </div>
        <div style="padding: 20px; background-color: #18181b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; font-size: 15px; line-height: 1.7; color: #d4d4d8; white-space: pre-wrap; margin-bottom: 32px;">${safeMessage}</div>

        <!-- Pill Action Button -->
        <div>
          <a href="mailto:${safeEmail}?subject=Re:%20Portfolio%20Inquiry" style="display: inline-block; padding: 12px 26px; background-color: #ffffff; color: #09090b; text-decoration: none; border-radius: 9999px; font-size: 13px; font-weight: 600; letter-spacing: -0.01em;">
            Reply to ${safeName} &nearr;
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer Rule & Note -->
    <tr>
      <td style="padding: 18px 32px; background-color: #0c0c0e; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 11px; color: #52525b; text-align: center; letter-spacing: 0.04em;">
        Dispatched automatically from your portfolio contact panel
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  // 2. Automated receipt sent to the SENDER
  const senderReceiptHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Message Received</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5; -webkit-font-smoothing: antialiased;">
  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; margin: 0 auto; background-color: #121214; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 48px rgba(0, 0, 0, 0.5);">
    <!-- MetaBar Header -->
    <tr>
      <td style="padding: 22px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600; color: #a1a1aa;">
              MESSAGE ACKNOWLEDGEMENT
            </td>
            <td align="right" style="font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #52525b; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">
              STATUS: DELIVERED
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body Content -->
    <tr>
      <td style="padding: 36px 32px 32px;">
        <h1 style="margin: 0 0 16px; font-size: 26px; font-weight: 500; letter-spacing: -0.03em; line-height: 1.25; color: #ffffff;">
          Thank you for reaching out, ${safeName}.
        </h1>
        <p style="margin: 0 0 26px; font-size: 15px; line-height: 1.7; color: #a1a1aa;">
          Your message has arrived in my inbox. I review every project brief and inquiry personally and will get back to you shortly.
        </p>

        <!-- Sent Copy Block -->
        <div style="font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #71717a; font-weight: 600; margin-bottom: 10px;">
          Copy of your submission
        </div>
        <div style="padding: 20px; background-color: #18181b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; font-size: 14px; line-height: 1.7; color: #d4d4d8; white-space: pre-wrap; margin-bottom: 32px;">${safeMessage}</div>

        <!-- Pill Link Button -->
        <div>
          <a href="${siteUrl}" style="display: inline-block; padding: 12px 26px; background-color: #ffffff; color: #09090b; text-decoration: none; border-radius: 9999px; font-size: 13px; font-weight: 600; letter-spacing: -0.01em;">
            Back to Portfolio &nearr;
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 18px 32px; background-color: #0c0c0e; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 11px; color: #52525b; text-align: center; letter-spacing: 0.04em;">
        This automated receipt confirms that your transmission was successfully received.
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    // 1. Deliver incoming inquiry to your inbox
    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: receiverEmail,
      replyTo: email.trim(),
      subject: `Inquiry from ${name.trim()} via Portfolio`,
      text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\nMessage:\n${message.trim()}`,
      html: ownerHtml,
    });

    // 2. Deliver confirmation copy to the sender's inbox
    await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: email.trim(),
      subject: `Message received: Thank you for getting in touch`,
      text: `Hi ${name.trim()},\n\nThank you for reaching out! Here is a copy of your message:\n\n"${message.trim()}"\n\nI will get back to you shortly.`,
      html: senderReceiptHtml,
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to send contact email:", err);
    return {
      success: false,
      error: "Failed to deliver message. Please try again later.",
    };
  }
}

// /** Generates a pre-filled direct Gmail compose URL */
// export function getGmailComposeUrl({ name, message }: { name: string; message: string }) {
//   const receiver = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'your_email@gmail.com';
//   const subject = encodeURIComponent(`Portfolio Inquiry - ${name || 'Contact'}`);
//   const body = encodeURIComponent(message || '');
//   return `https://mail.google.com/mail/?view=cm&fs=1&to=${receiver}&su=${subject}&body=${body}`;
// }
