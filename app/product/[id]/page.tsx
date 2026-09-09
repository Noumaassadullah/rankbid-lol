'use client';

import Header from '@/components/Header';
import { useState, useEffect } from 'react';
import { ArrowUpRight, TrendingUp, Eye, DollarSign } from 'lucide-react';

interface Listing {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  totalPaid: number;
  dayPaid: number;
  clickCount: number;
  createdAt: string;
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [allListings, setAllListings] = useState<Listing[]>([]);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch('/api/listings/submit?limit=500');
      if (!res.ok) return;

      const data = await res.json();
      const listings = data.listings || [];
      setAllListings(listings);

      const found = listings.find((l: Listing) => l.id === params.id);
      setProduct(found || null);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product not found</h1>
            <a href="/" className="text-orange-600 hover:text-orange-700 font-semibold">
              Back to home
            </a>
          </div>
        </div>
      </>
    );
  }

  const allTimeRank = allListings.filter(l => l.totalPaid > product.totalPaid).length + 1;
  const dayRank = allListings.filter(l => l.dayPaid > product.dayPaid).length + 1;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white dark:from-black dark:via-gray-900 dark:to-black">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Product Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-semibold px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                    {product.category}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                  {product.title}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Visit Button */}
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors text-lg"
            >
              Visit Product
              <ArrowUpRight className="w-5 h-5" />
            </a>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">All-Time Rank</p>
                  <p className="text-4xl font-bold text-orange-600 mt-2">#{allTimeRank}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-orange-200 dark:text-orange-900" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Today's Rank</p>
                  <p className="text-4xl font-bold text-orange-600 mt-2">#{dayRank}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-orange-200 dark:text-orange-900" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Bid</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">${(product.totalPaid / 100).toFixed(0)}</p>
                </div>
                <DollarSign className="w-10 h-10 text-green-200 dark:text-green-900" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Page Views</p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{product.clickCount}</p>
                </div>
                <Eye className="w-10 h-10 text-blue-200 dark:text-blue-900" />
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Product Details</h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Category</p>
                <p className="text-lg text-gray-900 dark:text-white font-semibold">{product.category}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Listed</p>
                <p className="text-lg text-gray-900 dark:text-white font-semibold">
                  {new Date(product.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Today's Bid</p>
                <p className="text-lg text-gray-900 dark:text-white font-semibold">${(product.dayPaid / 100).toFixed(0)}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">Website</p>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-orange-600 hover:text-orange-700 font-semibold truncate"
                >
                  Visit →
                </a>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-3">Interested in ranking?</h3>
            <p className="text-orange-100 mb-6">List your own product and start bidding to climb the rankings.</p>
            <a
              href="/#claim"
              className="inline-block px-6 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Bidding
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
