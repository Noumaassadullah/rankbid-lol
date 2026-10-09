// Server-only checks on URLs people submit, so the site doesn't rank or link to malware,
// phishing, adult or gambling pages.

const BLOCKED_HOSTS = [
  // adult
  'pornhub.com', 'xvideos.com', 'xnxx.com', 'xhamster.com', 'onlyfans.com', 'redtube.com', 'youporn.com', 'chaturbate.com',
  // gambling
  '1xbet.com', 'bet365.com', 'stake.com', 'betway.com', 'melbet.com', 'parimatch.com',
  // link shorteners hide the real destination
  'bit.ly', 'tinyurl.com', 'goo.gl', 'is.gd', 'cutt.ly', 'rebrand.ly', 'shorturl.at', 'ow.ly', 'rb.gy', 'tiny.cc', 'v.gd',
  // chat invites
  't.me', 'telegram.me', 'discord.gg', 'wa.me', 'chat.whatsapp.com',
  // anonymous file hosts commonly used for malware
  'mega.nz', 'mediafire.com', 'anonfiles.com', 'gofile.io', 'transfer.sh',
];

const BLOCKED_PATHS = ['discord.com/invite', 'whatsapp.com/invite'];

const DOWNLOAD_EXTENSIONS = /\.(exe|msi|apk|xapk|scr|bat|cmd|com|ps1|vbs|jar|dmg|pkg|deb|rpm|zip|rar|7z|iso|img|bin|dll|hta|lnk)$/i;

const BLOCKED_CONTENT_TYPES = [
  'application/octet-stream', 'application/x-msdownload', 'application/x-msdos-program', 'application/vnd.android.package-archive',
  'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/java-archive',
  'application/x-apple-diskimage', 'application/x-iso9660-image',
];

const hostMatches = (host: string, domain: string) => host === domain || host.endsWith(`.${domain}`);

/** Returns why `raw` can't be listed, or null if it passes the static checks. */
export function staticUrlProblem(raw: string): string | null {
  if (raw.length > 2048) return 'URL is too long.';
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return 'Please enter a valid URL.';
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return 'Only http(s) links can be listed.';
  const host = url.hostname.toLowerCase();
  if (/^[\d.]+$/.test(host) || host.includes(':')) return 'Links to raw IP addresses are not allowed.';
  if (BLOCKED_HOSTS.some((d) => hostMatches(host, d))) return 'Links to this site are not allowed on RankBid.';
  const hostPath = `${host}${url.pathname}`.toLowerCase();
  if (BLOCKED_PATHS.some((p) => hostPath.startsWith(p) || hostPath.includes(`.${p}`))) return 'Invite links are not allowed on RankBid.';
  if (DOWNLOAD_EXTENSIONS.test(url.pathname)) return 'Direct download links are not allowed. Link to a web page instead.';
  return null;
}

/** True if the response looks like a file download rather than a web page. */
export function isDownloadResponse(res: Response): boolean {
  const type = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const disposition = (res.headers.get('content-disposition') || '').toLowerCase();
  return BLOCKED_CONTENT_TYPES.includes(type) || disposition.startsWith('attachment');
}

/**
 * Google Safe Browsing lookup (malware, phishing, unwanted software). Only runs when
 * GOOGLE_SAFE_BROWSING_API_KEY is set; returns true if Google flags the URL.
 */
export async function isFlaggedBySafeBrowsing(url: string): Promise<boolean> {
  const key = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        client: { clientId: 'rankbid', clientVersion: '1.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }],
        },
      }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data.matches) && data.matches.length > 0;
  } catch {
    return false;
  }
}

/** http(s) URL or null; used before rendering any user-supplied link. */
export function httpUrlOrNull(raw: unknown, maxLength = 500): string | null {
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (!value || value.length > maxLength) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}
