export default function Today() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-bold mb-2">Today's Rankings</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        Rolling 24-hour leaderboard. These are the products being claimed right now.
      </p>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-4 mb-8">
        <p className="text-sm">
          <strong>Rolling 24h window</strong> • 0 listings • Updated in real-time
        </p>
      </div>

      <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400 mb-4">Nothing in the last 24 hours yet.</p>
        <p className="text-sm text-slate-500 dark:text-slate-500">Be the first to claim a rank and appear here!</p>
      </div>

      <section className="mt-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">How Today's Rankings Work</h2>
        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
          <li className="flex gap-3">
            <span className="flex-shrink-0">•</span>
            <span>Every payment you make in the <strong>last 24 hours</strong> counts toward your today's rank.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0">•</span>
            <span>Payments older than 24 hours drop off automatically. Your rank recalculates every few minutes.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0">•</span>
            <span>This is a great way to drive a quick traffic spike or test a marketing campaign.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0">•</span>
            <span>Every 24 hours, a snapshot of today's top 10 is frozen and archived as a historical page.</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
