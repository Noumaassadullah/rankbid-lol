'use client';

import { ReactNode } from 'react';
import PlatformIcon from '@/components/PlatformIcon';

interface PremiumListingCardProps {
  listing: {
    id: string;
    title: string;
    url: string;
    totalVotes: number;
    dayVotes?: number;
    category: string;
    platform: string;
    isPremium: boolean;
    premiumPosition?: number | null;
    founderName?: string | null;
    founderEmail?: string | null;
    founderPhone?: string | null;
    founderWebsite?: string | null;
    founderTwitter?: string | null;
    founderLinkedin?: string | null;
    founderInstagram?: string | null;
    founderFacebook?: string | null;
    founderTiktok?: string | null;
    founderYoutube?: string | null;
    founderGithub?: string | null;
  };
  position: number;
  onVote: (listingId: string) => void;
  hasVoted: boolean;
}

interface SocialLink {
  icon: string;
  label: string;
  url?: string;
}

const Icons = {
  Heart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20H7m6-4h.01M9 20h6" />
    </svg>
  ),
  Twitter: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7s1.1 1 2-3c-.4-.2-.8-.4-1.2-.6z" />
    </svg>
  ),
  Star: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
};

export default function PremiumListingCard({
  listing,
  position,
  onVote,
  hasVoted,
}: PremiumListingCardProps) {
  const getSocialLinks = (): SocialLink[] => {
    const links: SocialLink[] = [];
    const position = listing.premiumPosition || 1;

    // Plan #1: First 4 socials
    // Plan #2: Only 1 social (first one available)
    // Plan #3: No socials

    if (position === 3) {
      return []; // Plan #3: No social accounts
    }

    if (listing.founderWebsite) links.push({ icon: 'globe', label: 'Website', url: listing.founderWebsite });
    if (listing.founderTwitter) links.push({ icon: 'twitter', label: 'Twitter', url: `https://twitter.com/${listing.founderTwitter.replace('@', '')}` });
    if (listing.founderLinkedin) links.push({ icon: 'linkedin', label: 'LinkedIn', url: listing.founderLinkedin });
    if (listing.founderInstagram) links.push({ icon: 'instagram', label: 'Instagram', url: `https://instagram.com/${listing.founderInstagram.replace('@', '')}` });
    if (listing.founderFacebook) links.push({ icon: 'facebook', label: 'Facebook', url: listing.founderFacebook });
    if (listing.founderTiktok) links.push({ icon: 'tiktok', label: 'TikTok', url: `https://tiktok.com/@${listing.founderTiktok.replace('@', '')}` });
    if (listing.founderYoutube) links.push({ icon: 'youtube', label: 'YouTube', url: listing.founderYoutube });
    if (listing.founderGithub) links.push({ icon: 'github', label: 'GitHub', url: `https://github.com/${listing.founderGithub.replace('@', '')}` });

    // Plan #1: Only show first 4 socials
    if (position === 1 && links.length > 4) {
      return links.slice(0, 4);
    }

    // Plan #2: Only show first 1 social
    if (position === 2 && links.length > 1) {
      return [links[0]];
    }

    return links;
  };

  const socialLinks = getSocialLinks();

  return (
    <a
      href={listing.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gradient-to-br from-[#FFB28F] to-[#D97706] shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-xl transition-all duration-200 group relative overflow-hidden"
    >
      {/* Premium Badge */}
      <div className="absolute top-3 right-3 bg-[#18181B] text-[#FFB28F] px-3 py-1 border-2 border-[#FFB28F] font-black text-xs flex items-center gap-1">
        <Icons.Star />
        PREMIUM #{listing.premiumPosition}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        {/* Left: Listing Info */}
        <div className="md:col-span-2">
          <div className="flex items-start justify-between gap-2 md:gap-4 mb-3 md:mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                <div className="w-8 md:w-10 h-8 md:h-10 bg-[#18181B] text-[#FFB28F] font-black rounded-lg flex items-center justify-center text-sm md:text-base flex-shrink-0">{`#${position}`}</div>
                <div className="min-w-0">
                  <p className="text-sm md:text-lg font-black text-[#1F2937] group-hover:underline truncate">{listing.title}</p>
                  <p className="text-xs text-[#1F2937]/70 font-semibold truncate">{listing.category}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vote Count - Only show for Plan #1 */}
          {listing.premiumPosition === 1 && (
            <div className="mb-3 md:mb-4 bg-white bg-opacity-80 inline-block px-2 md:px-4 py-1 md:py-2 border-2 border-gray-300 rounded">
              <p className="text-lg md:text-2xl font-black text-[#1F2937]">{listing.totalVotes}</p>
              <p className="text-xs text-[#1F2937]/60 font-semibold">Total Votes</p>
            </div>
          )}
        </div>

        {/* Right: Founder Info & Vote Button */}
        <div className="flex flex-col gap-2 md:gap-4">
          {/* Vote Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              onVote(listing.id);
            }}
            disabled={hasVoted}
            className={`w-full py-2 md:py-3 px-3 md:px-4 font-black text-xs md:text-sm border-2 md:border-3 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 ${
              hasVoted
                ? 'bg-gray-300 text-gray-600 border-gray-300 cursor-not-allowed'
                : 'bg-white text-[orange-600] border-[orange-600] hover:bg-[orange-600] hover:text-white'
            }`}
          >
            <Icons.Heart />
            {hasVoted ? 'Voted' : 'Vote'}
          </button>

          {/* Founder Info */}
          <div className="bg-white bg-opacity-90 p-3 md:p-4 border border-gray-300 rounded">
            <p className="font-black text-[#1F2937] text-xs md:text-sm mb-2 md:mb-3">Founder</p>
            <p className="font-bold text-[#1F2937] text-xs md:text-sm mb-1 md:mb-2 truncate">{listing.founderName}</p>

            <div className="space-y-1 md:space-y-2 mb-2 md:mb-3 text-xs">
              {listing.founderEmail && (
                <a href={`mailto:${listing.founderEmail}`} className="flex items-center gap-2 text-[#1F2937] hover:text-[orange-600] transition-colors">
                  <Icons.Mail />
                  <span className="truncate">{listing.founderEmail}</span>
                </a>
              )}
              {listing.founderPhone && (
                <a href={`tel:${listing.founderPhone}`} className="flex items-center gap-2 text-[#1F2937] hover:text-[orange-600] transition-colors">
                  <Icons.Phone />
                  <span>{listing.founderPhone}</span>
                </a>
              )}
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-1 md:gap-2 pt-1 md:pt-2 border-t-2 border-gray-300/20">
                {socialLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.label}
                    className="p-1 md:p-1.5 bg-[#18181B] text-[#FFB28F] border border-[#FFB28F] rounded hover:bg-orange-100 hover:text-[#1F2937] transition-colors"
                  >
                    {link.icon === 'globe' && <Icons.Globe />}
                    {link.icon === 'twitter' && <Icons.Twitter />}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
