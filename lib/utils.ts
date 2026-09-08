import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function normalizeURL(url: string): string {
  try {
    // Handle @handles (Twitter, etc.)
    if (url.startsWith('@')) {
      return url.toLowerCase();
    }

    // Add protocol if missing
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }

    const urlObj = new URL(url);

    // Remove tracking params
    const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
    paramsToRemove.forEach((param) => urlObj.searchParams.delete(param));

    // Normalize domain
    let normalized = urlObj.toString();

    // Remove trailing slash
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  } catch {
    return url.toLowerCase();
  }
}

export async function resolveShortURL(url: string): Promise<string> {
  // Expand shortened URLs (bit.ly, tinyurl, etc.)
  const shorteners = ['bit.ly', 'tinyurl.com', 'ow.ly', 'short.link'];

  if (shorteners.some((s) => url.includes(s))) {
    try {
      const response = await fetch(url, { redirect: 'follow', method: 'HEAD' });
      return response.url;
    } catch {
      return url;
    }
  }

  return url;
}

export function extractDomain(url: string): string {
  try {
    if (url.startsWith('@')) return url;

    const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export function isValidPaymentURL(url: string): boolean {
  // Disallow adult content and sensitive chat/invite links
  const blocklist = [
    'pornhub.com',
    'xvideos.com',
    'onlyfans.com',
    't.me', // Telegram
    'telegram.me',
    'discord.gg',
    'discord.com/invite',
    'whatsapp.com/invite',
    'wa.me',
  ];

  const normalizedURL = url.toLowerCase();
  return !blocklist.some((b) => normalizedURL.includes(b));
}

export function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

export function formatCurrency(cents: number, currency = 'PKR'): string {
  const amount = cents / 100;

  if (currency === 'PKR') {
    return `Rs. ${amount.toLocaleString('ur-PK', { minimumFractionDigits: 0 })}`;
  }

  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}
