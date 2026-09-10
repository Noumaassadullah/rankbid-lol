import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-black border-t-4 border-orange-500 dark:border-orange-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded font-black text-white flex items-center justify-center text-lg">
                💎
              </div>
              <span className="text-xl font-black text-black dark:text-white">RankBid</span>
            </div>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
              Pay to rank on Pakistan's transparent leaderboard. No algorithms, no politics. Just real merit.
            </p>
          </div>

          {/* Leaderboards */}
          <div>
            <h4 className="text-sm font-black text-black dark:text-white mb-4 uppercase tracking-wide">
              Leaderboards
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm"
                >
                  🏆 All-Time
                </Link>
              </li>
              <li>
                <Link
                  href="/today"
                  className="font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm"
                >
                  🔥 Today (24h)
                </Link>
              </li>
              <li>
                <Link
                  href="/daily"
                  className="font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm"
                >
                  📅 Daily
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm"
                >
                  🎯 Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-black text-black dark:text-white mb-4 uppercase tracking-wide">
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/rules"
                  className="font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm"
                >
                  Rules & Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/claim"
                  className="font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors text-sm"
                >
                  Claim Listing
                </Link>
              </li>
            </ul>
          </div>

          {/* Payments & Support */}
          <div>
            <h4 className="text-sm font-black text-black dark:text-white mb-4 uppercase tracking-wide">
              Payments
            </h4>
            <ul className="space-y-2 font-bold text-gray-700 dark:text-gray-300 text-sm mb-6">
              <li>✓ RapidGateway</li>
              <li>✓ JazzCash</li>
              <li>✓ EasyPaisa</li>
            </ul>
            <a
              href="mailto:support@rankbid.pk"
              className="inline-block font-bold text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 transition-colors text-sm"
            >
              support@rankbid.pk →
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="font-black text-gray-900 dark:text-white text-sm">
              &copy; {currentYear} RankBid Pakistan
            </p>
            <p className="font-bold text-gray-600 dark:text-gray-400 text-xs mt-1">
              The transparent platform where merit wins.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex gap-6 text-sm">
            <a
              href="https://twitter.com"
              className="font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
            <a
              href="https://github.com"
              className="font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://discord.com"
              className="font-bold text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
