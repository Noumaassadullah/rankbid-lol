'use client';

import Header from '@/components/Header';
import { useState, useEffect } from 'react';
import { use } from 'react';
import { ArrowUpRight, TrendingUp, Eye, DollarSign, Share2, Copy, Check } from 'lucide-react';

interface Listing {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  platform: string;
  totalVotes?: number;
  dayVotes?: number;
  totalPaid?: number;
  dayPaid?: number;
  clickCount: number;
  createdAt: string;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch('/api/listings/submit?limit=500');
      if (!res.ok) return;

      const data = await res.json();
      const listings = data.listings || [];
      setAllListings(listings);

      const found = listings.find((l: Listing) => l.id === id);
      setProduct(found || null);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVisitUrl = () => {
    if (!product) return '#';
    // If URL already has protocol, use it as-is
    if (product.url.startsWith('http://') || product.url.startsWith('https://')) {
      return product.url;
    }
    // For social platforms without protocol, construct the proper URL
    switch (product.platform?.toLowerCase()) {
      case 'linkedin':
        return `https://www.linkedin.com/in/${product.url}`;
      case 'twitter':
      case 'x':
        return `https://twitter.com/${product.url.replace('@', '')}`;
      case 'instagram':
        return `https://instagram.com/${product.url.replace('@', '')}`;
      case 'tiktok':
        return `https://tiktok.com/@${product.url.replace('@', '')}`;
      case 'facebook':
        return `https://facebook.com/${product.url}`;
      default:
        return product.url;
    }
  };

  const handleCopyLink = async () => {
    if (!product) return;
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/product/${product.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShareTwitter = () => {
    if (!product) return;
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/product/${product.id}`;
    const text = `Check out "${product.title}" on RankBid! It's ranked #1 in ${product.category}. Support it to climb the rankings. ${url}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleShareLinkedIn = () => {
    if (!product) return;
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/product/${product.id}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=550,height=420');
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

  const getTotalScore = (p: Listing) => (p.totalPaid || 0) + (p.totalVotes || 0);
  const getDayScore = (p: Listing) => (p.dayPaid || 0) + (p.dayVotes || 0);

  const allTimeRank = allListings.filter(l => getTotalScore(l) > getTotalScore(product)).length + 1;
  const dayRank = allListings.filter(l => getDayScore(l) > getDayScore(product)).length + 1;

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
            <div className="flex flex-col gap-6">
              <a
                href={getVisitUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors text-lg w-fit"
              >
                Visit {product.platform === 'website' ? 'Product' : 'Profile'}
                <ArrowUpRight className="w-5 h-5" />
              </a>

              {/* Share Buttons */}
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Share this product</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleShareTwitter}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
                    </svg>
                    Twitter (X)
                  </button>

                  <button
                    onClick={handleShareLinkedIn}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                    LinkedIn
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
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
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                  {product.platform === 'website' ? 'Website' : 'Profile'}
                </p>
                <a
                  href={getVisitUrl()}
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
