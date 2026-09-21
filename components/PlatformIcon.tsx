'use client';

import { FaTwitter, FaFacebook, FaInstagram, FaTiktok, FaGlobe } from 'react-icons/fa';

interface PlatformIconProps {
  platform: string;
  size?: number;
  className?: string;
}

export default function PlatformIcon({ platform, size = 24, className = '' }: PlatformIconProps) {
  const platformLower = (platform || '').toLowerCase();
  const baseClasses = `transition-transform hover:scale-110 ${className}`;

  const iconProps = {
    size,
    className: baseClasses
  };

  if (platformLower === 'twitter' || platformLower === 'x') {
    return <FaTwitter {...iconProps} className={`text-black ${baseClasses}`} />;
  }

  if (platformLower === 'facebook') {
    return <FaFacebook {...iconProps} className={`text-[#1877F2] ${baseClasses}`} />;
  }

  if (platformLower === 'instagram') {
    return <FaInstagram {...iconProps} className={`text-pink-500 ${baseClasses}`} />;
  }

  if (platformLower === 'tiktok') {
    return <FaTiktok {...iconProps} className={`text-black ${baseClasses}`} />;
  }

  if (platformLower === 'website') {
    return <FaGlobe {...iconProps} className={`text-[#18181B] ${baseClasses}`} />;
  }

  return <FaGlobe {...iconProps} className={`text-[#18181B] ${baseClasses}`} />;
}
