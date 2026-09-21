'use client';

import Header from '@/components/Header';
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
    <div className="bg-white text-[#18181B]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 pb-8 border-b-4 border-[#18181B]">
          <h1 className="text-4xl font-black text-[#18181B] uppercase mb-2">Search Results</h1>
          {query && (
            <p className="text-[#18181B]/70 font-semibold">
              Results for "<span className="font-black">{query}</span>"
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl">⏳</div>
            <p className="text-[#18181B]/60 font-semibold mt-2">Searching products...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 border-[#18181B] border-4 bg-[#F5F5F5]">
            <h2 className="text-2xl font-black text-[#18181B] mb-2 uppercase">
              {query ? 'No products found' : 'Start Searching'}
            </h2>
            <p className="text-[#18181B]/70 font-semibold mb-6">
              {query
                ? `No products match "${query}". Try a different search term.`
                : 'Use the search bar to find products.'}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="inline-block px-6 py-2 bg-[#D97706] text-[#18181B] font-bold text-xs uppercase border-[#D97706] border-3 hover:scale-105 transition-all"
            >
              Browse All Products
            </button>
          </div>
        ) : (
          <div>
            <p className="text-[#18181B]/70 font-semibold mb-6">
              Found <span className="font-black">{results.length}</span> product{results.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-2">
              {results.map((listing) => (
                <a
                  key={listing.id}
                  href={listing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-white border-[#18181B] border-3 hover:bg-[#D97706]/10 hover:scale-101 transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#18181B] truncate">{listing.title}</p>
                    <p className="text-xs text-[#18181B]/60 mt-1 truncate">{listing.description}</p>
                    <div className="flex gap-3 mt-2 text-xs">
                      <span className="px-2 py-1 bg-[#F5F5F5] text-[#18181B] border-2 border-[#18181B] font-bold">
                        {listing.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-2xl font-black text-[#D97706]">♥ {listing.totalVotes}</p>
                    <p className="text-xs text-[#18181B]/60 font-semibold uppercase">Votes</p>
                  </div>
                </a>
              ))}
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
