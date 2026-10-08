import { Resend } from 'resend';
import { SITE_URL } from '@/lib/site';

export type SubmissionEmailListing = {
  id: string;
  title: string;
  description: string;
  category: string;
  platform: string;
  url: string;
  imageUrl?: string;
};

export type EmailResult = { sent: true; id: string; from: string; to: string } | { sent: false; error: string };

// Sender on our own domain (must be verified in Resend). If Resend rejects it, fall back to
// Resend's shared sender, which can only deliver to the Resend account owner's address.
const FROM = process.env.NOTIFICATION_FROM || 'RankBid <noreply@rankbid.click>';
const FALLBACK_FROM = 'RankBid <onboarding@resend.dev>';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const safeHref = (url: string) => (/^https?:\/\//i.test(url) ? escapeHtml(url) : '#');

function submissionHtml(listing: SubmissionEmailListing): string {
  const title = escapeHtml(listing.title);
  const description = escapeHtml(listing.description);
  const productUrl = `${SITE_URL}/product/${encodeURIComponent(listing.id)}`;
  return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="color: #0F3460; margin-top: 0;">New Submission Added</h2>

            <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #0F3460; border-radius: 4px;">
              <p style="margin: 5px 0; font-weight: bold; color: #1F2937;">
                📌 ${title}
              </p>
              <p style="margin: 8px 0; color: #4b5563; font-size: 14px;">
                ${description}
              </p>
              <div style="margin-top: 10px;">
                <span style="display: inline-block; padding: 4px 12px; background-color: #e5e7eb; border-radius: 4px; font-size: 12px; font-weight: bold; color: #1F2937;">
                  📂 ${escapeHtml(listing.category)}
                </span>
                <span style="display: inline-block; padding: 4px 12px; background-color: #e5e7eb; border-radius: 4px; font-size: 12px; font-weight: bold; color: #1F2937;">
                  🔗 ${escapeHtml(listing.platform)}
                </span>
              </div>
            </div>

            <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 4px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold;">URL</p>
              <p style="margin: 0; word-break: break-all;">
                <a href="${safeHref(listing.url)}" style="color: #0F3460; text-decoration: none; font-weight: bold;">
                  ${escapeHtml(listing.url)}
                </a>
              </p>
            </div>

            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <a href="${productUrl}" style="display: inline-block; padding: 10px 20px; background-color: #0F3460; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
                View on RankBid
              </a>
              <a href="${SITE_URL}/admin" style="display: inline-block; margin-left: 8px; padding: 10px 20px; background-color: #e5e7eb; color: #1F2937; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
                Open admin
              </a>
            </div>

            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
              You're receiving this because you're subscribed to new submission notifications from RankBid
            </p>
          </div>
        </div>
      `;
}

/** Emails the admin about a new submission. Never throws: a failed email must not block the submission. */
export async function sendNewSubmissionEmail(listing: SubmissionEmailListing): Promise<EmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email notification');
      return { sent: false, error: 'RESEND_API_KEY not configured' };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const to = process.env.NOTIFICATION_EMAIL || 'nouman@mindwhiz.com';
    const message = { to, subject: `🎉 New Submission: ${listing.title}`, html: submissionHtml(listing) };

    // Resend reports failures in `error` instead of throwing.
    let from = FROM;
    let { data, error } = await resend.emails.send({ from, ...message });
    if (error) {
      console.error(`Resend rejected sender ${from}:`, error);
      from = FALLBACK_FROM;
      ({ data, error } = await resend.emails.send({ from, ...message }));
    }
    if (error || !data) {
      console.error('Failed to send new submission email:', error);
      return { sent: false, error: error?.message || 'Unknown Resend error' };
    }

    console.log(`New submission email sent to ${to} from ${from} (resend id ${data.id}) for listing ${listing.id}`);
    return { sent: true, id: data.id, from, to };
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return { sent: false, error: error instanceof Error ? error.message : String(error) };
  }
}
