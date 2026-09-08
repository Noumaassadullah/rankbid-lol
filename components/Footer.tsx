import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t-8 border-orange-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-purple-600 rounded-lg font-black text-white flex items-center justify-center text-xl">
                ⚡
              </div>
              <span className="text-2xl font-black text-gray-900">outbid.lol</span>
            </div>
            <p className="text-lg font-bold text-gray-700">
              Pure pay-to-rank leaderboard. No algorithms. No politics. Just merit.
            </p>
          </div>

          {/* Leaderboards */}
          <div>
            <h4 className="text-lg font-black text-gray-900 mb-6 uppercase">Leaderboards</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="font-black text-gray-700 hover:text-orange-600 transition-colors">
                  🏆 All-Time
                </Link>
              </li>
              <li>
                <Link href="/today" className="font-black text-gray-700 hover:text-orange-600 transition-colors">
                  🔥 Today (24h)
                </Link>
              </li>
              <li>
                <Link href="/daily" className="font-black text-gray-700 hover:text-orange-600 transition-colors">
                  📅 Daily (UTC)
                </Link>
              </li>
              <li>
                <Link href="/categories" className="font-black text-gray-700 hover:text-orange-600 transition-colors">
                  🎯 Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-black text-gray-900 mb-6 uppercase">Resources</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="font-black text-gray-700 hover:text-orange-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/rules" className="font-black text-gray-700 hover:text-orange-600 transition-colors">
                  Rules & Terms
                </Link>
              </li>
              <li>
                <Link href="/" className="font-black text-gray-700 hover:text-orange-600 transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment & Contact */}
          <div>
            <h4 className="text-lg font-black text-gray-900 mb-6 uppercase">Payments</h4>
            <ul className="space-y-3 font-black text-gray-700 mb-8">
              <li>✓ Stripe</li>
              <li>✓ JazzCash</li>
              <li>✓ EasyPaisa</li>
            </ul>
            <a
              href="mailto:support@outbid.lol"
              className="font-black text-orange-600 hover:text-orange-700 transition-colors"
            >
              support@outbid.lol →
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-4 border-orange-600 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="font-black text-gray-900 mb-1">
              &copy; {currentYear} outbid.lol
            </p>
            <p className="font-bold text-gray-600">
              The transparent leaderboard where merit matters.
            </p>
          </div>
          <div className="flex gap-6">
            <a href="https://twitter.com" className="font-black text-orange-600 hover:text-orange-700">
              Twitter
            </a>
            <a href="https://github.com" className="font-black text-orange-600 hover:text-orange-700">
              GitHub
            </a>
            <a href="https://discord.com" className="font-black text-orange-600 hover:text-orange-700">
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
