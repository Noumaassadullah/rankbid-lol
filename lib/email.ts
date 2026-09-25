import { Resend } from 'resend';

export async function sendNewSubmissionEmail(listing: {
  id: string;
  title: string;
  description: string;
  category: string;
  platform: string;
  url: string;
  imageUrl?: string;
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email notification');
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const recipientEmail = process.env.NOTIFICATION_EMAIL || 'nouman@mindwhiz.com';

    await resend.emails.send({
      from: 'noreply@rankbid.lol',
      to: recipientEmail,
      subject: `🎉 New Submission: ${listing.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="color: #0F3460; margin-top: 0;">New Submission Added</h2>

            <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-left: 4px solid #0F3460; border-radius: 4px;">
              <p style="margin: 5px 0; font-weight: bold; color: #1F2937;">
                📌 ${listing.title}
              </p>
              <p style="margin: 8px 0; color: #4b5563; font-size: 14px;">
                ${listing.description}
              </p>
              <div style="margin-top: 10px; display: flex; gap: 10px;">
                <span style="display: inline-block; padding: 4px 12px; background-color: #e5e7eb; border-radius: 4px; font-size: 12px; font-weight: bold; color: #1F2937;">
                  📂 ${listing.category}
                </span>
                <span style="display: inline-block; padding: 4px 12px; background-color: #e5e7eb; border-radius: 4px; font-size: 12px; font-weight: bold; color: #1F2937;">
                  🔗 ${listing.platform}
                </span>
              </div>
            </div>

            <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 4px;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold;">URL</p>
              <p style="margin: 0; word-break: break-all;">
                <a href="${listing.url}" style="color: #0F3460; text-decoration: none; font-weight: bold;">
                  ${listing.url}
                </a>
              </p>
            </div>

            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <a href="https://rankbid-lol.vercel.app" style="display: inline-block; padding: 10px 20px; background-color: #0F3460; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
                View on RankBid
              </a>
            </div>

            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
              You're receiving this because you're subscribed to new submission notifications from RankBid
            </p>
          </div>
        </div>
      `,
    });

    console.log(`Email sent to ${recipientEmail} for new submission: ${listing.id}`);
  } catch (error) {
    console.error('Failed to send email notification:', error);
    // Don't throw - email failure shouldn't block submission
  }
}
