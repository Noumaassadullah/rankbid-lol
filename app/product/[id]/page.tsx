'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Listing {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  totalPaid: number;
  dayPaid: number;
  clickCount: number;
  createdAt: string;
  lastRaisedAt: string;
}

export default function ProductDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [allListings, setAllListings] = useState<Listing[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/listings/submit?url=${encodeURIComponent(params.id)}`);
        const data = await res.json();
        if (data.listing) {
          setProduct(data.listing);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    const fetchAllListings = async () => {
      try {
        const res = await fetch('/api/listings/submit');
        const data = await res.json();
        setAllListings(data.listings || []);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      }
    };

    fetchProduct();
    fetchAllListings();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <p className="text-2xl font-black text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <p className="text-2xl font-black text-gray-900">Product not found</p>
        <Link href="/" className="text-purple-600 font-black hover:text-purple-700">
          Back to Home
        </Link>
      </div>
    );
  }

  const rank = allListings.findIndex(l => l.id === product.id) + 1 || 999;
  const categoryListings = allListings.filter(l => l.category === product.category);
  const categoryRank = categoryListings.findIndex(l => l.id === product.id) + 1 || 999;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-8">
        <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-200">
          Leaderboard
        </Link>
        <span>•</span>
        <Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-slate-900 dark:hover:text-slate-200">
          {product.category}
        </Link>
      </div>

      {/* Product Header */}
      <div className="bg-white dark:bg-slate-800 border-4 border-purple-600 dark:border-slate-700 rounded-lg p-8 mb-8">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h1 className="text-4xl font-black mb-2 text-gray-900">{product.title}</h1>
            <p className="text-lg font-bold text-gray-600">{product.url}</p>
          </div>
          <div className="text-right">
            <div className="text-6xl font-black text-orange-600 mb-2">#{rank}</div>
            <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full font-black">
              Overall Rank
            </span>
          </div>
        </div>

        <p className="text-lg font-bold text-gray-700 mb-6">{product.description}</p>

        <div className="flex flex-wrap gap-6 mb-8">
          <div>
            <p className="text-sm font-bold text-gray-600 mb-2">All-Time Amount</p>
            <p className="text-3xl font-black text-green-600">${(product.totalPaid / 100).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-600 mb-2">Today's Amount</p>
            <p className="text-3xl font-black text-blue-600">${(product.dayPaid / 100).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-600 mb-2">Clicks</p>
            <p className="text-3xl font-black text-purple-600">{product.clickCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-600 mb-2">Listed</p>
            <p className="text-3xl font-black text-gray-900">{new Date(product.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href={`/api/click?id=${product.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:shadow-lg hover:shadow-orange-600/50 transition-all font-black"
          >
            Visit Site →
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/api/click?id=${product.id}`)}
            className="px-6 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-black"
          >
            Copy Link
          </button>
        </div>
      </div>

      {/* Ranking Info */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-purple-50 dark:bg-slate-800 border-4 border-purple-600 dark:border-slate-700 rounded-lg p-8">
          <h3 className="text-2xl font-black text-gray-900 mb-4">Category Ranking</h3>
          <p className="text-5xl font-black text-purple-600 mb-2">
            #{categoryRank} of {categoryListings.length}
          </p>
          <p className="text-lg font-bold text-gray-600 dark:text-slate-400">in {product.category}</p>
        </div>

        <div className="bg-orange-50 dark:bg-slate-800 border-4 border-orange-600 dark:border-slate-700 rounded-lg p-8">
          <h3 className="text-2xl font-black text-gray-900 mb-4">Overall Ranking</h3>
          <p className="text-5xl font-black text-orange-600 mb-2">#{rank}</p>
          <p className="text-lg font-bold text-gray-600 dark:text-slate-400">Position on leaderboard</p>
          <Link
            href="/"
            className="block mt-4 text-lg font-black text-orange-600 hover:text-orange-700"
          >
            View All Rankings →
          </Link>
        </div>
      </div>

      {/* About This Ranking */}
      <div className="bg-white dark:bg-slate-800 border-4 border-gray-200 dark:border-slate-700 rounded-lg p-8 mb-8">
        <h2 className="text-3xl font-black text-gray-900 mb-6">About This Ranking</h2>

        <div className="space-y-4 mb-8">
          <p className="text-lg font-bold text-gray-700 dark:text-slate-400">
            This listing has received <strong>${(product.totalPaid / 100).toLocaleString()}</strong> in total bids.
            <strong> {product.clickCount}</strong> visitors have clicked through from the leaderboard.
          </p>
        </div>

        <h3 className="text-xl font-black text-gray-900 mb-4">FAQ</h3>
        <div className="space-y-4">
          <details className="cursor-pointer border-b-2 border-gray-200 pb-4">
            <summary className="font-black text-gray-900 dark:text-slate-100">
              How much does {product.title} rank for?
            </summary>
            <p className="mt-3 font-bold text-gray-700 dark:text-slate-400 ml-4">
              {product.title} currently holds rank #{rank} with a total payment of ${(product.totalPaid / 100).toLocaleString()}.
            </p>
          </details>

          <details className="cursor-pointer border-b-2 border-gray-200 pb-4">
            <summary className="font-black text-gray-900 dark:text-slate-100">
              How do I outrank {product.title}?
            </summary>
            <p className="mt-3 font-bold text-gray-700 dark:text-slate-400 ml-4">
              To take their rank, you need to bid at least ${((product.totalPaid + 100) / 100).toLocaleString()}.
            </p>
          </details>

          <details className="cursor-pointer">
            <summary className="font-black text-gray-900 dark:text-slate-100">
              Can I message the owner of {product.title}?
            </summary>
            <p className="mt-3 font-bold text-gray-700 dark:text-slate-400 ml-4">
              No direct messaging is available. If you need to contact them, visit their website.
            </p>
          </details>
        </div>
      </div>

      {/* Related Products */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Also in {product.category}</h2>
        <div className="text-center py-12 text-slate-600 dark:text-slate-400">
          <p>Related products loading...</p>
        </div>
      </div>
    </div>
  );
}
