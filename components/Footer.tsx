import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">rankbid</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Pure pay-to-play leaderboard. List your product and bid for the top rank.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-slate-900 dark:hover:text-slate-200">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/daily" className="hover:text-slate-900 dark:hover:text-slate-200">
                  Daily
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/rules" className="hover:text-slate-900 dark:hover:text-slate-200">
                  Rules
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-slate-900 dark:hover:text-slate-200">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Payment Methods</h4>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <li>🎫 JazzCash</li>
              <li>📱 EasyPaisa</li>
              <li>💳 Stripe (Coming)</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-600 dark:text-slate-400">
          <p>&copy; {currentYear} rankbid. All rights reserved.</p>
          <p>Built for Pakistani market</p>
        </div>
      </div>
    </footer>
  );
}
