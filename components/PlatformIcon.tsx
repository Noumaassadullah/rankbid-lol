'use client';

interface PlatformIconProps {
  platform: string;
  size?: number;
}

export default function PlatformIcon({ platform, size = 24 }: PlatformIconProps) {
  const platformLower = platform.toLowerCase();

  if (platformLower === 'twitter' || platformLower === 'x') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-black">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.6l-5.165-6.75-5.866 6.75h-3.31l7.73-8.835L2.25 2.25h6.735l4.67 6.168L17.77 2.25h.474zm-1.161 17.52h1.833L7.084 4.126H5.117l12.926 15.644z"/>
      </svg>
    );
  }

  if (platformLower === 'facebook') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-[#1877F2]">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    );
  }

  if (platformLower === 'instagram') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="currentColor"/>
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
      </svg>
    );
  }

  if (platformLower === 'tiktok') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.75 2.9 2.9 0 0 1 5.1-1.75V11a6.09 6.09 0 0 1-6.09 6.09 6.1 6.1 0 0 1-6.09-6.09 6.1 6.1 0 0 1 6.09-6.09v-3.45a9.54 9.54 0 0 0-9.54 9.54 9.54 9.54 0 0 0 15.13 7.51"/>
      </svg>
    );
  }

  if (platformLower === 'website') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
    </svg>
  );
}
