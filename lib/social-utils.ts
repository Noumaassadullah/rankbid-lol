export function isSocialMediaUrl(url: string): boolean {
  const socialDomains = ['facebook.com', 'instagram.com', 'tiktok.com', 'twitter.com', 'x.com', 'linkedin.com', 'youtube.com'];
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return socialDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

export function extractSocialHandle(url: string, platform: string): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = urlObj.hostname.replace('www.', '');
    const pathname = urlObj.pathname.replace(/\/$/, '');

    if (platform === 'facebook') {
      if (hostname.includes('facebook.com')) {
        const parts = pathname.split('/').filter(p => p);
        if (parts.length > 0) {
          return parts[0];
        }
      }
    } else if (platform === 'instagram') {
      if (hostname.includes('instagram.com')) {
        const parts = pathname.split('/').filter(p => p);
        if (parts.length > 0) {
          return parts[0];
        }
      }
    } else if (platform === 'tiktok') {
      if (hostname.includes('tiktok.com')) {
        const parts = pathname.split('/').filter(p => p);
        if (parts.length > 0) {
          return parts[0].replace('@', '');
        }
      }
    } else if (platform === 'twitter' || platform === 'x') {
      if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
        const parts = pathname.split('/').filter(p => p);
        if (parts.length > 0) {
          return parts[0].replace('@', '');
        }
      }
    }
  } catch (error) {
    console.error('Error extracting social handle:', error);
  }

  return null;
}

export function formatSocialMediaUrl(platform: string, input: string): string {
  if (!input) return '';

  const normalized = input.trim();

  if (normalized.startsWith('http')) {
    return normalized;
  }

  const handle = normalized.replace('@', '').replace(/\/$/, '');

  const baseUrls: Record<string, string> = {
    facebook: `https://facebook.com/${handle}`,
    instagram: `https://www.instagram.com/${handle}/`,
    tiktok: `https://www.tiktok.com/@${handle}`,
    twitter: `https://twitter.com/${handle}`,
    x: `https://x.com/${handle}`,
  };

  return baseUrls[platform] || `https://example.com/${handle}`;
}
