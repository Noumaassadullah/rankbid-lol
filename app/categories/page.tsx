'use client';

import Link from 'next/link';

const categories = [
  { name: 'AI', label: 'ARTIFICIAL INTELLIGENCE' },
  { name: 'SaaS', label: 'SOFTWARE AS A SERVICE' },
  { name: 'Developer', label: 'DEVELOPER TOOLS' },
  { name: 'Marketing', label: 'MARKETING & GROWTH' },
  { name: 'Productivity', label: 'PRODUCTIVITY' },
  { name: 'Analytics', label: 'DATA & ANALYTICS' },
  { name: 'Design', label: 'DESIGN & CREATIVE' },
  { name: 'Crypto', label: 'CRYPTO & BLOCKCHAIN' },
];

export default function CategoriesPage() {
  return (
    <div className="bg-white dark:bg-black min-h-screen">
      <div className="bg-black dark:bg-white px-4 sm:px-6 py-20 md:py-32">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black text-white dark:text-black mb-8 leading-none">ALL CATEGORIES</h1>
          <p className="text-lg md:text-2xl font-bold text-white dark:text-black max-w-2xl">Find your niche. Dominate your category. Compete for visibility.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-black px-4 sm:px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {categories.map((cat) => (
              <Link key={cat.name} href={`/categories/${cat.name.toLowerCase()}`} className="group">
                <div className="card-neobrutalism shadow-neobrutalism h-full asymmetric-offset group-hover:asymmetric-offset-right">
                  <div className="text-sm font-black uppercase tracking-wider text-black dark:text-white mb-4 border-b-4 border-black dark:border-white pb-4">
                    CATEGORY
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-4">{cat.name}</h2>
                  <p className="text-lg font-bold text-black dark:text-white">{cat.label}</p>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mt-6">VIEW RANKINGS →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-black dark:bg-white px-4 sm:px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="border-8 border-white dark:border-black p-12 text-center">
            <h2 className="text-5xl md:text-6xl font-black text-white dark:text-black mb-4 leading-none">8 CATEGORIES</h2>
            <p className="text-lg font-bold text-white dark:text-black mb-8">Each with its own independent leaderboard.</p>
            <div className="text-3xl font-black text-white dark:text-black mb-8">50K+ ACTIVE BIDS</div>
            <Link href="/claim" className="btn-neobrutalism shadow-neobrutalism inline-block">
              START RANKING
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}