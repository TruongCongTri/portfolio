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

'use server';

import { Resend } from 'resend';

export type ContactMessage = {
  name: string;
  email: string;
  message: string;
};

export type ContactResponse = {
  success: boolean;
  error?: string;
};

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactMessage(data: ContactMessage): Promise<ContactResponse> {
  const { name, email, message } = data;

  if (!name || !email || !message) {
    return { success: false, error: 'All fields are required.' };
  }

  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL;
  if (!receiverEmail) {
    console.error('Missing CONTACT_RECEIVER_EMAIL environment variable');
    return { success: false, error: 'Server configuration error.' };
  }

  try {
    // 1. Send the inquiry to you (with Reply-To set to the sender)
    await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>', // Replace with your domain once verified
      to: receiverEmail,
      replyTo: email,
      subject: `New Message from ${name} via Portfolio`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #111;">
          <h2>New Portfolio Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    // 2. Send an automated confirmation copy to the sender's inbox
    await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: email,
      subject: `Message received: Thank you for reaching out`,
      text: `Hi ${name},\n\nThank you for reaching out! Here is a copy of your message:\n\n"${message}"\n\nI will get back to you shortly.`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #111;">
          <p>Hi ${name},</p>
          <p>Thank you for getting in touch. Here is a copy of what you sent:</p>
          <blockquote style="margin: 16px 0; padding-left: 12px; border-left: 3px solid #ccc; color: #555; white-space: pre-wrap;">
            ${message}
          </blockquote>
          <p>I will get back to you shortly!</p>
        </div>
      `,
    });

    return { success: true };
  } catch (err) {
    console.error('Failed to send contact email:', err);
    return { success: false, error: 'Failed to deliver message. Please try again later.' };
  }
}

// /** Generates a pre-filled direct Gmail compose URL */
// export function getGmailComposeUrl({ name, message }: { name: string; message: string }) {
//   const receiver = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'your_email@gmail.com';
//   const subject = encodeURIComponent(`Portfolio Inquiry - ${name || 'Contact'}`);
//   const body = encodeURIComponent(message || '');
//   return `https://mail.google.com/mail/?view=cm&fs=1&to=${receiver}&su=${subject}&body=${body}`;
// }