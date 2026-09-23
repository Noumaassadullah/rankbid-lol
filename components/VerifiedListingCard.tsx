'use client';

import VerifiedBadge from './VerifiedBadge';

interface VerifiedListingCardProps {
  listing: {
    id: string;
    title: string;
    url: string;
    totalVotes: number;
    dayVotes?: number;
    category: string;
    platform: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    tier: 'verified' | 'professional';
    phone?: string | null;
    website?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    tiktok?: string | null;
    youtube?: string | null;
    github?: string | null;
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
  Linkedin: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  ),
  Instagram: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 110-2.881 1.44 1.44 0 010 2.881z" />
    </svg>
  ),
};

export default function VerifiedListingCard({
  listing,
  user,
  position,
  onVote,
  hasVoted,
}: VerifiedListingCardProps) {
  const getSocialLinks = (): SocialLink[] => {
    const links: SocialLink[] = [];

    // Professional users show all socials, Verified users show limited socials
    if (user.website) links.push({ icon: 'globe', label: 'Website', url: user.website });
    if (user.twitter) links.push({ icon: 'twitter', label: 'Twitter', url: `https://twitter.com/${user.twitter.replace('@', '')}` });
    if (user.linkedin) links.push({ icon: 'linkedin', label: 'LinkedIn', url: user.linkedin });
    if (user.instagram) links.push({ icon: 'instagram', label: 'Instagram', url: `https://instagram.com/${user.instagram.replace('@', '')}` });
    if (user.facebook) links.push({ icon: 'facebook', label: 'Facebook', url: user.facebook });
    if (user.tiktok) links.push({ icon: 'tiktok', label: 'TikTok', url: `https://tiktok.com/@${user.tiktok.replace('@', '')}` });
    if (user.youtube) links.push({ icon: 'youtube', label: 'YouTube', url: user.youtube });
    if (user.github) links.push({ icon: 'github', label: 'GitHub', url: `https://github.com/${user.github.replace('@', '')}` });

    // Professional: show all socials, Verified: show first 4
    if (user.tier === 'verified' && links.length > 4) {
      return links.slice(0, 4);
    }

    return links;
  };

  const socialLinks = getSocialLinks();
  const tierColors = {
    verified: 'from-blue-100 to-blue-200 border-blue-300',
    professional: 'from-purple-100 to-purple-200 border-purple-300',
  };

  return (
    <a
      href={listing.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block bg-gradient-to-br ${tierColors[user.tier]} shadow-sm border p-4 md:p-6 hover:shadow-xl transition-all duration-200 group relative overflow-hidden`}
    >
      {/* Tier Badge */}
      <div className="absolute top-3 right-3 bg-white text-blue-600 px-3 py-1 border-2 border-blue-500 font-black text-xs flex items-center gap-1">
        <VerifiedBadge tier={user.tier} size="sm" />
        {user.tier.toUpperCase()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        {/* Left: Listing Info */}
        <div className="md:col-span-2">
          <div className="flex items-start justify-between gap-2 md:gap-4 mb-3 md:mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                <div className="w-8 md:w-10 h-8 md:h-10 bg-white text-blue-600 font-black rounded-lg flex items-center justify-center text-sm md:text-base flex-shrink-0">
                  #{position}
                </div>
                <div className="min-w-0">
                  <p className="text-sm md:text-lg font-black text-slate-900 group-hover:underline truncate flex items-center gap-2">
                    {listing.title}
                    <VerifiedBadge tier={user.tier} size="sm" />
                  </p>
                  <p className="text-xs text-slate-700/70 font-semibold truncate">{listing.category}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vote Count */}
          <div className="mb-3 md:mb-4 bg-white bg-opacity-80 inline-block px-2 md:px-4 py-1 md:py-2 border-2 border-gray-300 rounded">
            <p className="text-lg md:text-2xl font-black text-slate-900">{listing.totalVotes}</p>
            <p className="text-xs text-slate-600/60 font-semibold">Total Votes</p>
          </div>
        </div>

        {/* Right: User Info & Vote Button */}
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
                : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white'
            }`}
          >
            <Icons.Heart />
            {hasVoted ? 'Voted' : 'Vote'}
          </button>

          {/* User Info */}
          <div className="bg-white bg-opacity-90 p-3 md:p-4 border border-gray-300 rounded">
            <p className="font-black text-slate-900 text-xs md:text-sm mb-2 md:mb-3 flex items-center gap-1">
              <VerifiedBadge tier={user.tier} size="sm" />
              {user.tier === 'verified' ? 'Verified User' : 'Professional'}
            </p>
            <p className="font-bold text-slate-900 text-xs md:text-sm mb-1 md:mb-2 truncate">{user.name || user.email}</p>

            <div className="space-y-1 md:space-y-2 mb-2 md:mb-3 text-xs">
              {user.email && (
                <a href={`mailto:${user.email}`} className="flex items-center gap-2 text-slate-900 hover:text-blue-600 transition-colors">
                  <Icons.Mail />
                  <span className="truncate">{user.email}</span>
                </a>
              )}
              {user.phone && (
                <a href={`tel:${user.phone}`} className="flex items-center gap-2 text-slate-900 hover:text-blue-600 transition-colors">
                  <Icons.Phone />
                  <span>{user.phone}</span>
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
                    className="p-1 md:p-1.5 bg-blue-600 text-white border border-blue-600 rounded hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    {link.icon === 'globe' && <Icons.Globe />}
                    {link.icon === 'twitter' && <Icons.Twitter />}
                    {link.icon === 'linkedin' && <Icons.Linkedin />}
                    {link.icon === 'instagram' && <Icons.Instagram />}
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
