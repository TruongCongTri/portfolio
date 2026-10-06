export type GmailComposeParams = {
  name?: string;
  message?: string;
  recipient?: string;
};

/**
 * Builds a direct web compose URL for Gmail with pre-filled parameters.
 */
export function getGmailComposeUrl({
  name,
  message,
  recipient,
}: GmailComposeParams = {}): string {
  const targetEmail =
    recipient ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    'your_email@gmail.com';

  const subject = encodeURIComponent(
    `Portfolio Inquiry - ${name?.trim() || 'New Message'}`,
  );
  const body = encodeURIComponent(message?.trim() || '');

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${subject}&body=${body}`;
}

/**
 * Native mailto fallback generator.
 */
export function getMailtoUrl({
  name,
  message,
  recipient,
}: GmailComposeParams = {}): string {
  const targetEmail =
    recipient ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    'your_email@gmail.com';

  const subject = encodeURIComponent(
    `Portfolio Inquiry - ${name?.trim() || 'New Message'}`,
  );
  const body = encodeURIComponent(message?.trim() || '');

  return `mailto:${targetEmail}?subject=${subject}&body=${body}`;
}