import { site } from './site';

export type ContactMessage = { name: string; email: string; message: string };

/**
 * Delivers a contact message. There's no mail backend yet, so this opens the visitor's email app
 * with the message pre-filled. Swap the body for a POST to your form service/API when you have one.
 */
export async function sendContactMessage({ name, email, message }: ContactMessage) {
  const subject = encodeURIComponent(`Project enquiry from ${name}`);
  const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
  window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
}
