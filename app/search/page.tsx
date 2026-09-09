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
  totalPaid: number;
  dayPaid: number;
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Search Results</h1>
          </div>
          {query && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Results for <span className="font-semibold text-orange-600">"{query}"</span>
            </p>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Searching products...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {query ? 'No products found' : 'Start searching'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {query
                ? `No products match "${query}". Try a different search term.`
                : 'Use the search bar to find products.'}
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
            >
              Browse All Products
            </a>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Found <span className="font-semibold text-orange-600">{results.length}</span> product{results.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-4">
              {results.map((listing) => (
                <a
                  key={listing.id}
                  href={`/product/${listing.id}`}
                  className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-600 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mb-2">
                        {listing.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{listing.description}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium">
                          {listing.category}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {listing.clickCount} clicks
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-orange-600 mb-1">
                        ${(listing.totalPaid / 100).toFixed(0)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total bid</p>
                    </div>
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
