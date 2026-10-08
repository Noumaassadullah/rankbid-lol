'use client';

import Header from '@/components/Header';
import RankingRow from '@/components/RankingRow';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Listing {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  platform: string;
  totalVotes: number;
  dayVotes: number;
  clickCount: number;
}

const CATEGORIES = ['Marketing', 'SEO', 'Productivity', 'Agents', 'Crypto', 'Developer', 'Health', 'Games', 'Business', 'Ecommerce', 'Travel', 'Directories', 'AIMedia', 'Agencies', 'Social', 'Education', 'People', 'Design', 'Hiring', 'Domains', 'Security', 'Sales', 'News', 'RealEstate', 'Writing', 'Audio', 'Analytics', 'Unlimited', 'Other'];


const CATEGORY_LABELS: Record<string, string> = { AIMedia: 'AI Media', RealEstate: 'Real Estate' };
const labelFor = (category: string) => CATEGORY_LABELS[category] ?? category;

export default function CategoriesPage() {
  return (
    <Suspense fallback={<Header />}>
      <CategoriesContent />
    </Suspense>
  );
}

function CategoriesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Derived from the URL (not copied into state) so header tab clicks that only
  // change ?category= on this same page update the selection.
  const categoryParam = searchParams.get('category');
  const selectedCategory = categoryParam && CATEGORIES.includes(categoryParam) ? categoryParam : 'All';

  const handleCategoryChange = (category: string) => {
    router.push(category === 'All' ? '/categories' : `/categories?category=${encodeURIComponent(category)}`);
  };

  useEffect(() => {
    // Ignore responses for a category the user has already switched away from.
    let cancelled = false;

    const fetchListings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/listings/submit?category=${encodeURIComponent(selectedCategory)}&limit=50`);
        const data = res.ok ? await res.json() : { listings: [] };
        if (!cancelled) setListings(data.listings || []);
      } catch {
        if (!cancelled) setListings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchListings();
    return () => { cancelled = true; };
  }, [selectedCategory]);

  const categoryListings = (selectedCategory === 'All' ? listings : listings.filter(l => l.category === selectedCategory)).slice(0, 50);

  return (
    <>
      <Header />
      <div className="bg-white text-[#1F2937]">
        {/* Header + Category Selector */}
        <section className="spotlight relative overflow-hidden bg-gradient-to-br from-[#0B2545] via-[#0F3460] to-[#1a5490] text-white">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-24 -right-16 w-72 h-72 bg-[#1a5490] rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-[#059669] rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-10 md:py-12">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mb-1 sm:mb-2">Browse Categories</h1>
            <p className="text-sm sm:text-base text-white/70 font-medium mb-5 sm:mb-8">Explore products ranked by category</p>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {['All', ...CATEGORIES].map(cat => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    aria-pressed={isActive}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full border transition-all duration-150 active:scale-95 ${
                      isActive
                        ? 'bg-white text-[#0F3460] border-white shadow-lg shadow-black/20'
                        : 'bg-white/10 text-white/90 border-white/15 hover:bg-white/20 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {cat === 'All' ? 'All Categories' : labelFor(cat)}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Listings Section */}
        <section className="bg-gray-50 py-6 sm:py-10 md:py-12 min-h-[40vh]">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-[#1F2937] mb-1">{selectedCategory === 'All' ? 'All Categories' : labelFor(selectedCategory)}</h2>
              <p className="text-xs sm:text-sm text-[#1F2937]/60 font-semibold">
                {categoryListings.length} product{categoryListings.length !== 1 ? 's' : ''} ranked
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin text-4xl">⏳</div>
                <p className="text-[#1F2937]/60 font-semibold mt-2">Loading products...</p>
              </div>
            ) : categoryListings.length === 0 ? (
              <div className="text-center py-8 sm:py-12 border border-gray-200 shadow-sm bg-white rounded-lg">
                <p className="text-sm font-bold text-[#1F2937] mb-4">No products yet in {selectedCategory === 'All' ? 'any category' : labelFor(selectedCategory)}</p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#0F3460] text-white font-black text-xs sm:text-sm rounded-lg hover:bg-[#0D2A50] active:scale-95 transition-all"
                >
                  Submit a Product
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {categoryListings.map((listing, idx) => (
                  <RankingRow key={listing.id} listing={listing} rank={idx + 1} votes={listing.totalVotes || 0} votesLabel="votes" />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
