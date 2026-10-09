import Link from 'next/link';
import Header from '@/components/Header';
import RankingRow from '@/components/RankingRow';
import SelectionHeading from '@/components/SelectionHeading';
import { CATEGORIES, categoryPath, getCategoryLabel } from '@/lib/categories';
import type { Listing } from '@/lib/server/listings';

// Server-rendered category hub and category pages. Every category is a real link to its
// own URL so crawlers can reach each one, and the rankings are in the initial HTML.
export default function CategoryBrowser({ selected, listings, counts, intro }: {
  selected: string | null;
  listings: Listing[];
  counts: Record<string, number>;
  intro: string;
}) {
  const label = selected ? getCategoryLabel(selected) : 'All Categories';
  const totalCount = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <>
      <Header />
      <div className="bg-white text-[#1F2937]">
        <section className="spotlight relative overflow-hidden bg-gradient-to-br from-[#0B2545] via-[#0F3460] to-[#1a5490] text-white">
          <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true">
            <div className="absolute -top-24 -right-16 w-72 h-72 bg-[#1a5490] rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-[#059669] rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-10 md:py-12">
            {selected && (
              <nav aria-label="Breadcrumb" className="text-xs text-white/60 mb-4 flex items-center gap-1.5">
                <Link href="/categories" className="hover:text-white">Categories</Link>
                <span aria-hidden="true">/</span>
                <span className="text-white/80">{label}</span>
              </nav>
            )}
            <SelectionHeading
              as="h1"
              tone="dark"
              lead={selected ? 'top' : 'browse'}
              highlight={selected ? `${label} products` : 'categories'}
              className="mb-4 sm:mb-5"
            />
            <p className="text-sm sm:text-base text-white/75 max-w-2xl mb-6 sm:mb-9">{intro}</p>

            {/* Native <details> dropdown: works without JavaScript and keeps every category a real
                link in the HTML. It opens in place (the hero clips overflow, so it can't float). */}
            <details className="group w-full sm:max-w-md">
              <summary className="list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-3 px-4 py-2.5 sm:py-3 bg-white text-[#0F3460] rounded-xl shadow-lg shadow-black/20 cursor-pointer select-none font-bold text-sm sm:text-base">
                <span className="truncate">
                  {label}
                  <span className="ml-2 font-semibold text-[#0F3460]/50 tabular-nums">
                    {selected ? counts[selected] || 0 : totalCount}
                  </span>
                </span>
                <svg className="w-4 h-4 shrink-0 transition-transform duration-150 group-open:rotate-180" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </summary>

              <nav aria-label="Categories" className="mt-2 bg-white rounded-xl shadow-lg shadow-black/20 overflow-hidden">
                <ul className="max-h-80 overflow-y-auto py-1.5">
                  {[null, ...CATEGORIES].map(cat => {
                    const isActive = selected === cat;
                    const count = cat ? counts[cat] || 0 : totalCount;
                    return (
                      <li key={cat ?? 'all'}>
                        <Link
                          href={cat ? categoryPath(cat) : '/categories'}
                          aria-current={isActive ? 'page' : undefined}
                          className={`flex items-center justify-between gap-3 px-4 py-2 text-sm font-semibold transition-colors ${
                            isActive ? 'bg-[#0F3460] text-white' : 'text-[#1F2937] hover:bg-gray-100'
                          }`}
                        >
                          <span>{cat ? getCategoryLabel(cat) : 'All Categories'}</span>
                          {count > 0 && (
                            <span className={`tabular-nums text-xs ${isActive ? 'text-white/70' : 'text-[#1F2937]/40'}`}>{count}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </details>
          </div>
        </section>

        <section className="bg-gray-50 py-6 sm:py-10 md:py-12 min-h-[40vh]">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-[#1F2937] mb-1">
                {selected ? `${label} rankings` : 'Top products across all categories'}
              </h2>
              <p className="text-xs sm:text-sm text-[#1F2937]/60 font-semibold">
                {listings.length} product{listings.length !== 1 ? 's' : ''} ranked by community votes
              </p>
            </div>

            {listings.length === 0 ? (
              <div className="text-center py-8 sm:py-12 border border-gray-200 shadow-sm bg-white rounded-lg">
                <p className="text-sm font-bold text-[#1F2937] mb-4">No products yet in {selected ? label : 'any category'}. Be the first to launch here.</p>
                <Link
                  href="/#submit"
                  className="inline-block px-4 sm:px-6 py-2 sm:py-2.5 bg-[#0F3460] text-white font-black text-xs sm:text-sm rounded-lg hover:bg-[#0D2A50] active:scale-95 transition-all"
                >
                  Submit a product for free
                </Link>
              </div>
            ) : (
              <ol className="curve-list space-y-3 sm:space-y-4">
                {listings.map((listing, idx) => (
                  <li key={listing.id}>
                    <RankingRow listing={listing} rank={idx + 1} votes={listing.totalVotes} votesLabel="votes" />
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
