'use client';

export default function DailyPage() {
  return (
    <div className="bg-white dark:bg-black min-h-screen">
      <div className="bg-black dark:bg-white px-4 sm:px-6 py-20 md:py-32">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black text-white dark:text-black mb-8 leading-none">TODAY'S RANKINGS</h1>
          <p className="text-lg md:text-2xl font-bold text-white dark:text-black">The fierce competition happening right now. Watch the live battle.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-black px-4 sm:px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="border-8 border-black dark:border-white p-8 md:p-12 mb-12 shadow-neobrutalism">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-black dark:text-white mb-3 border-b-4 border-black dark:border-white pb-3">● LIVE</div>
                <h2 className="text-3xl md:text-4xl font-black text-black dark:text-white">Resets at Midnight UTC</h2>
              </div>
              <div className="text-right">
                <div className="text-5xl md:text-6xl font-black text-black dark:text-white">0</div>
                <p className="text-sm font-black uppercase text-black dark:text-white">Products Competing</p>
              </div>
            </div>
          </div>

          <div className="card-neobrutalism shadow-neobrutalism text-center py-24 mb-20">
            <p className="text-4xl md:text-5xl font-black text-black dark:text-white mb-6">NO LISTINGS TODAY YET</p>
            <p className="text-lg font-bold text-black dark:text-white mb-8">Be the first to claim #1 and dominate today's board.</p>
            <button className="btn-neobrutalism shadow-neobrutalism">CLAIM #1 TODAY</button>
          </div>

          <h2 className="text-5xl md:text-6xl font-black mb-12 text-black dark:text-white border-b-4 border-black dark:border-white pb-8">PREVIOUS CHAMPIONS</h2>

          <div className="space-y-6">
            {[
              { date: 'SEP 8, 2024', product: 'ChatGPT Pro', amount: 'Rs. 50,000' },
              { date: 'SEP 7, 2024', product: 'Midjourney v6', amount: 'Rs. 45,000' },
              { date: 'SEP 6, 2024', product: 'Claude API', amount: 'Rs. 42,000' },
              { date: 'SEP 5, 2024', product: 'Figma Design', amount: 'Rs. 38,000' },
            ].map((day, idx) => (
              <div key={idx} className="card-neobrutalism shadow-neobrutalism">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-black dark:text-white mb-2">{day.date}</p>
                    <p className="text-3xl md:text-4xl font-black text-black dark:text-white">#{idx + 1}: {day.product}</p>
                  </div>
                  <p className="text-2xl md:text-3xl font-black text-black dark:text-white">{day.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-black dark:bg-white px-4 sm:px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black text-white dark:text-black mb-8 leading-none">WANT TO WIN TODAY?</h2>
          <p className="text-lg font-bold text-white dark:text-black mb-8">Fresh competition every 24 hours. New leaderboard. New opportunity.</p>
          <button className="btn-neobrutalism shadow-neobrutalism">START BIDDING</button>
        </div>
      </div>
    </div>
  );
}