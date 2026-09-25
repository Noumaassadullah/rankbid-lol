'use client';

import { getPlatformIcon } from '@/lib/platformIcons';

interface PlatformIconProps {
  platform: string;
  size?: number;
  className?: string;
}

export default function PlatformIcon({ platform, size = 24, className = '' }: PlatformIconProps) {
  const platformLower = (platform || '').toLowerCase();
  const iconPath = getPlatformIcon(platformLower);
  const sizeClass = `w-${size} h-${size}`;

  return (
    <img
      src={iconPath}
      alt={platform}
      className={`object-contain transition-transform hover:scale-110 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
}
