'use client';

import Link from 'next/link';

const Icons = {
  Trophy: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.6l-5.1-6.72-5.852 6.72H2.306l7.73-8.835L1.75 2.25h6.738l4.6 6.088 5.45-6.088zM5.5 19l11-15.5h.75L5.5 19z" />
    </svg>
  ),
  Github: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  ),
  Discord: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.211.375-.444.864-.607 1.25a18.27 18.27 0 0 0-5.487 0c-.163-.386-.395-.875-.607-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.975 14.975 0 0 0 1.293-2.1a.07.07 0 0 0-.038-.098a13.11 13.11 0 0 1-1.872-.892a.072.072 0 0 1-.009-.119c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.075.075 0 0 1 .079.009c.12.098.246.195.372.288a.072.072 0 0 1-.008.119c-.598.35-1.22.645-1.873.891a.07.07 0 0 0-.037.098c.36.698.772 1.356 1.293 2.1a.078.078 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.056c.5-4.506-.838-8.44-3.549-11.921a.06.06 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.93 2.155-2.157 2.155zm7.975 0c-1.183 0-2.157-.965-2.157-2.156c0-1.193.93-2.157 2.157-2.157c1.226 0 2.157.964 2.157 2.157c0 1.19-.931 2.155-2.157 2.155z" />
    </svg>
  ),
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-[#18181B] border-t-4 border-[#18181B]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b-3 border-[#18181B]">
          {/* Brand */}
          <div>
            <h3 className="text-sm font-black text-[#18181B] mb-3 uppercase tracking-wider">RankBid</h3>
            <p className="text-xs font-semibold text-[#18181B]/70 leading-relaxed">
              Community-driven product rankings. No algorithms. Pure voting.
            </p>
          </div>

          {/* Rankings */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Icons.Trophy />
              <h4 className="text-xs font-black text-[#18181B] uppercase tracking-wider">Rankings</h4>
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-xs font-bold text-[#18181B]/70 hover:text-[#FFB28F] transition-colors">
                  All Time
                </Link>
              </li>
              <li>
                <Link href="/today" className="text-xs font-bold text-[#18181B]/70 hover:text-[#FFB28F] transition-colors">
                  Today
                </Link>
              </li>
              <li>
                <Link href="/daily" className="text-xs font-bold text-[#18181B]/70 hover:text-[#FFB28F] transition-colors">
                  Daily
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-xs font-bold text-[#18181B]/70 hover:text-[#FFB28F] transition-colors">
                  Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-black text-[#18181B] mb-4 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-xs font-bold text-[#18181B]/70 hover:text-[#FFB28F] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/rules" className="text-xs font-bold text-[#18181B]/70 hover:text-[#FFB28F] transition-colors">
                  Rules & Terms
                </Link>
              </li>
              <li>
                <Link href="/claim" className="text-xs font-bold text-[#18181B]/70 hover:text-[#FFB28F] transition-colors">
                  Claim Listing
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Icons.Mail />
              <h4 className="text-xs font-black text-[#18181B] uppercase tracking-wider">Contact</h4>
            </div>
            <p className="text-xs font-semibold text-[#18181B]/70 mb-3">
              Questions? Reach out.
            </p>
            <a
              href="mailto:support@rankbid.pk"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFB28F] text-[#18181B] font-bold text-xs uppercase border-2 border-[#18181B] hover:bg-[#18181B] hover:text-[#FFB28F] transition-all"
            >
              <Icons.Mail />
              Email
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-xs font-bold text-[#18181B] uppercase tracking-wider">
              © {currentYear} RankBid Global
            </p>
            <p className="text-xs font-semibold text-[#18181B]/60 mt-1">
              The transparent platform. Merit wins.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex gap-3">
            <a
              href="https://twitter.com"
              className="w-8 h-8 bg-[#FFB28F] text-[#18181B] flex items-center justify-center border-3 border-[#18181B] hover:scale-110 transition-all"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <Icons.X />
            </a>
            <a
              href="https://github.com"
              className="w-8 h-8 bg-[#FFB28F] text-[#18181B] flex items-center justify-center border-3 border-[#18181B] hover:scale-110 transition-all"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Icons.Github />
            </a>
            <a
              href="https://discord.com"
              className="w-8 h-8 bg-[#FFB28F] text-[#18181B] flex items-center justify-center border-3 border-[#18181B] hover:scale-110 transition-all"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
            >
              <Icons.Discord />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
