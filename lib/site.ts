// Single source for contact details shown across the site.
export const SUPPORT_EMAIL = 'support@rankbid.com';
export const X_HANDLE = 'rankbidclick';
export const X_URL = `https://x.com/${X_HANDLE}`;

export const SITE_URL = 'https://www.rankbid.click';

/** Public share link for a listing: anyone can vote there with just a name + email. */
export function supportUrl(listingId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : SITE_URL;
  return `${origin}/support/${listingId}`;
}
