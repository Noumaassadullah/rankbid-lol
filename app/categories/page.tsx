'use client';

import Header from '@/components/Header';
import { useState, useEffect } from 'react';

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

export default function CategoriesPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Marketing');

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

  const categoryListings = listings.filter(l => l.category === selectedCategory).slice(0, 50);

  return (
    <>
      <Header />
      <div className="bg-white text-[#1F2937]">
        {/* Header Section */}
        <section className="bg-white py-12 border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-4xl font-black text-[#1F2937] mb-2">Browse Categories</h1>
            <p className="text-[#1F2937]/70 font-semibold">Explore products ranked by category</p>
          </div>
        </section>

        {/* Category Selector */}
        <section className="bg-gray-50 py-6 border-b-3 border-gray-300">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 font-bold text-xs border-3 transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#0F3460] text-white border-[#0F3460]'
                      : 'bg-white text-[#1F2937] border-gray-300 hover:bg-[#0F3460]/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Listings Section */}
        <section className="bg-white py-12">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-[#1F2937] mb-2">{selectedCategory}</h2>
              <p className="text-[#1F2937]/70 font-semibold">
                {categoryListings.length} product{categoryListings.length !== 1 ? 's' : ''} ranked
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin text-4xl">⏳</div>
                <p className="text-[#1F2937]/60 font-semibold mt-2">Loading products...</p>
              </div>
            ) : categoryListings.length === 0 ? (
              <div className="text-center py-12 border-gray-300 border-4 bg-gray-50">
                <p className="text-sm font-bold text-[#1F2937] mb-4">No products yet in {selectedCategory}</p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-2 bg-[#0F3460] text-white font-bold text-xs border-[#0F3460] border-3 hover:scale-105 transition-all duration-200"
                >
                  Submit a Product
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {categoryListings.map((listing, idx) => (
                  <a
                    key={listing.id}
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white border-gray-300 border-3 hover:bg-[#0F3460]/10 hover:scale-101 transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-[#0F3460] text-white font-black rounded-lg flex items-center justify-center text-sm">
                        #{idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1F2937] truncate">{listing.title}</p>
                        <p className="text-xs text-[#1F2937]/60 mt-1 truncate">{listing.description}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-2xl font-black text-[#0F3460]">♥ {listing.totalVotes}</p>
                      <p className="text-xs text-[#1F2937]/60 font-semibold">Votes</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
