'use client';

import Header from '@/components/Header';
import { useState, useEffect } from 'react';

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

const CATEGORIES = ['AI', 'SaaS', 'Developer', 'Marketing', 'Productivity', 'Design', 'Crypto', 'Health', 'Business', 'Unlimited'];

export default function CategoriesPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('AI');

  useEffect(() => {
    fetchListings();
  }, [selectedCategory]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/listings/submit?category=${selectedCategory}&limit=50`);
      if (!res.ok) {
        setListings([]);
        return;
      }
      const data = await res.json();
      setListings(data.listings || []);
    } catch (error) {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const categoryListings = listings.filter(l => l.category === selectedCategory).slice(0, 20);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Browse by Category</h1>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-3 mb-12 pb-8 border-b border-gray-200">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Category Info */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCategory} Products</h2>
            <p className="text-gray-600">
              {categoryListings.length} product{categoryListings.length !== 1 ? 's' : ''} ranked in this category
            </p>
          </div>

          {/* Listings */}
          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading products...</div>
          ) : categoryListings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-lg font-semibold text-gray-900 mb-4">No products yet in {selectedCategory}</p>
              <p className="text-gray-600 mb-6">Be the first to list a product in this category!</p>
              <a
                href="/#claim"
                className="inline-block px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
              >
                List Your Product
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {categoryListings.map((listing, idx) => (
                <a
                  key={listing.id}
                  href={listing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between hover:border-orange-300 hover:shadow-md transition-all group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold text-gray-400 w-10">#{idx + 1}</span>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{listing.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{listing.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <p className="text-2xl font-bold text-orange-600">${(listing.totalPaid / 100).toFixed(0)}</p>
                    <p className="text-sm text-gray-500">{listing.clickCount} clicks</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
