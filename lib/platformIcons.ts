export const PLATFORM_ICONS: Record<string, string> = {
  instagram: '/instagram.png',
  linkedin: '/linkedin.png',
  twitter: '/twitter.png',
  x: '/twitter.png',
  facebook: '/facebook.png',
  tiktok: '/tiktok.png',
  website: '/web.png',
};

export const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E4405F',
  linkedin: '#0A66C2',
  twitter: '#000000',
  x: '#000000',
  facebook: '#1877F2',
  tiktok: '#000000',
  website: '#0F3460',
};

export const getPlatformIcon = (platform: string): string => {
  return PLATFORM_ICONS[platform.toLowerCase()] || PLATFORM_ICONS.website;
};

export const getPlatformColor = (platform: string): string => {
  return PLATFORM_COLORS[platform.toLowerCase()] || PLATFORM_COLORS.website;
};
