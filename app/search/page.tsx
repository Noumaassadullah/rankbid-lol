'use client';

import Header from '@/components/Header';
import PlatformIcon from '@/components/PlatformIcon';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

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

const Icons = {
  Tag: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
};

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(!!query);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const searchProducts = async () => {
      try {
        const res = await fetch(`/api/listings/submit?limit=100`);
        if (!res.ok) {
          setResults([]);
          return;
        }
        const data = await res.json();
        const filtered = (data.listings || []).filter((l: Listing) =>
          l.title.toLowerCase().includes(query.toLowerCase()) ||
          l.description.toLowerCase().includes(query.toLowerCase()) ||
          l.category.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered.slice(0, 50));
      } catch (error) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [query]);

  return (
    <div className="bg-white text-[#1F2937]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 pb-8 border-b border-gray-200">
          <h1 className="text-4xl font-black text-[#1F2937] mb-2">Search Results</h1>
          {query && (
            <p className="text-[#1F2937]/70 font-semibold">
              Results for "<span className="font-black">{query}</span>"
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl">⏳</div>
            <p className="text-[#1F2937]/60 font-semibold mt-2">Searching products...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 border-gray-300 border-4 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-black text-[#1F2937] mb-2">
              {query ? 'No products found' : 'Start Searching'}
            </h2>
            <p className="text-[#1F2937]/70 font-semibold mb-6">
              {query
                ? `No products match "${query}". Try a different search term.`
                : 'Use the search bar to find products.'}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="inline-block px-6 py-2 bg-[#0F3460] text-white font-bold text-xs border-[#0F3460] border-3 hover:scale-105 transition-all rounded-lg"
            >
              Browse All Products
            </button>
          </div>
        ) : (
          <div>
            <p className="text-[#1F2937]/70 font-semibold mb-6">
              Found <span className="font-black">{results.length}</span> product{results.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-3 sm:space-y-4">
              {results.map((listing, idx) => {
                let faviconUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
                try {
                  const urlObj = new URL(listing.url);
                  faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(urlObj.hostname)}&sz=32`;
                } catch {
                  // If URL parsing fails, use placeholder
                }

                const platformLabel = listing.platform || 'website';

                return (
                  <a
                    key={listing.id}
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md hover:border-[#0F3460]/30 transition-all duration-200 group cursor-pointer gap-4"
                  >
                    {/* Left Section: Position Badge and Favicon */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-9 h-9 bg-[#0F3460] text-white font-black text-xs rounded-lg flex items-center justify-center flex-shrink-0">
                        #{idx + 1}
                      </div>
                      <img src={faviconUrl} alt="favicon" className="w-6 h-6 rounded flex-shrink-0" onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>'; }} />

                      {/* Title, Category and Platform Icon - All inline */}
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <p className="text-xs font-semibold text-[#1F2937] truncate group-hover:text-[#0F3460] transition-colors">
                          {listing.title}
                        </p>

                        {/* Platform Icon */}
                        <div className="w-4 h-4 flex-shrink-0" title={platformLabel}>
                          <PlatformIcon platform={platformLabel} size={16} />
                        </div>

                        {/* Category Tag */}
                        {listing.category && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Icons.Tag />
                            <p className="text-xs text-[#1F2937]/70 font-semibold">{listing.category}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Section: Vote Count and Actions */}
                    <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                      {/* Vote Count */}
                      <p className="text-lg font-black text-[#0F3460] min-w-[1.5rem] text-right">
                        {listing.totalVotes}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 active:scale-95 flex items-center gap-1 whitespace-nowrap bg-white border border-[#0F3460] text-[#0F3460] hover:bg-[#0F3460] hover:text-white`}
                        >
                          <Icons.Heart />
                          Vote
                        </button>

                        <button
                          className="text-xs font-semibold px-3 py-1.5 bg-white border border-orange-300 text-orange-600 hover:bg-orange-600 hover:text-white transition-all duration-200 active:scale-95 rounded-lg flex items-center gap-1 whitespace-nowrap"
                        >
                          📤 Share
                        </button>

                        <button
                          className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-300 text-[#0F3460] hover:bg-[#0F3460] hover:text-white transition-all duration-200 active:scale-95 rounded-lg flex items-center gap-1 whitespace-nowrap"
                        >
                          ⭐ Premium
                        </button>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black" />}>
        <SearchContent />
      </Suspense>
    </>
  );
}
