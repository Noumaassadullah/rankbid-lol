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
      // First try the specific product endpoint
      const res = await fetch(`/api/product/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data.product);
        setAllListings(data.allListings || []);
      } else if (res.status === 404) {
        // If not found immediately, retry after a short delay (might be replication lag)
        setTimeout(async () => {
          try {
            const retryRes = await fetch(`/api/product/${id}`);
            if (retryRes.ok) {
              const data = await retryRes.json();
              setProduct(data.product);
              setAllListings(data.allListings || []);
            }
          } catch (error) {
            console.error('Retry fetch failed:', error);
          }
        }, 1000);
      }
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
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0F3460] border-t-transparent mx-auto mb-4"></div>
            <p className="text-[#1F2937] font-black uppercase text-sm">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center border-4 border-black rounded-2xl p-8 bg-gray-50">
            <svg className="w-16 h-16 text-[#1F2937]/30 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <h1 className="text-2xl md:text-3xl font-black text-[#1F2937] mb-4 uppercase">Product Not Found</h1>
            <a href="/" className="inline-block px-6 py-3 bg-[#0F3460] text-white font-black rounded-xl hover:bg-[#0D2A50] transition-colors uppercase text-sm border-2 border-[#0F3460]">
              Back to Home
            </a>
          </div>
        </div>
      </>
    );
  }

  const getTotalScore = (p: Listing) => (p.totalVotes || 0);

  const allTimeRank = allListings.filter(l => (l.totalVotes || 0) > (product.totalVotes || 0)).length + 1;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* Product Header */}
          <div className="bg-white border-4 border-black rounded-2xl p-6 md:p-8 mb-8 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs md:text-sm font-black px-3 py-1 bg-[#0F3460] text-white rounded-lg uppercase">
                    {product.category}
                  </span>
                  <span className="text-xs md:text-sm font-black px-3 py-1 bg-gray-100 text-[#1F2937] rounded-lg uppercase capitalize">
                    {product.platform}
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-[#1F2937] mb-3 uppercase">
                  {product.title}
                </h1>
                <p className="text-base md:text-lg text-[#1F2937]/70 mb-6 leading-relaxed">
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
                className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-[#0F3460] text-white font-black rounded-xl hover:bg-[#0D2A50] active:scale-95 transition-all text-sm md:text-base uppercase w-fit border-2 border-[#0F3460] shadow-sm hover:shadow-md"
              >
                Visit {product.platform === 'website' ? 'Product' : 'Profile'}
                <ArrowUpRight className="w-5 h-5" />
              </a>

              {/* Share Buttons */}
              <div className="flex flex-col gap-3">
                <p className="text-xs md:text-sm font-black text-[#1F2937] uppercase">Share this product</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleShareTwitter}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white rounded-xl transition-all font-bold text-xs uppercase active:scale-95 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
                    </svg>
                    X
                  </button>

                  <button
                    onClick={handleShareLinkedIn}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#1F2937] text-[#1F2937] hover:bg-[#1F2937] hover:text-white rounded-xl transition-all font-bold text-xs uppercase active:scale-95 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                    LinkedIn
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-[#0F3460] text-[#0F3460] hover:bg-[#0F3460] hover:text-white rounded-xl transition-all font-bold text-xs uppercase active:scale-95 shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-white border-4 border-black rounded-2xl p-6 md:p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-black text-[#1F2937]/60 uppercase">Current Rank</p>
                  <p className="text-4xl md:text-5xl font-black text-[#0F3460] mt-3">#{allTimeRank}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-[#0F3460]/20" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white border-4 border-black rounded-2xl p-6 md:p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-black text-[#1F2937]/60 uppercase">Total Votes</p>
                  <p className="text-4xl md:text-5xl font-black text-[#0F3460] mt-3">{product.totalVotes || 0}</p>
                </div>
                <svg className="w-12 h-12 text-[#0F3460]/20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white border-4 border-black rounded-2xl p-6 md:p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-black text-[#1F2937]/60 uppercase">Category</p>
                  <p className="text-2xl md:text-3xl font-black text-[#1F2937] mt-3 uppercase">{product.category}</p>
                </div>
                <svg className="w-12 h-12 text-[#0F3460]/20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-white border-4 border-black rounded-2xl p-6 md:p-8 mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-[#1F2937] mb-6 uppercase flex items-center gap-3">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
              </svg>
              Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="pb-4 border-b-2 border-gray-200 md:border-b-0">
                <p className="text-xs font-black text-[#1F2937]/60 mb-2 uppercase">Platform</p>
                <p className="text-lg md:text-xl text-[#1F2937] font-black capitalize">{product.platform}</p>
              </div>
              <div className="pb-4 border-b-2 border-gray-200 md:border-b-0">
                <p className="text-xs font-black text-[#1F2937]/60 mb-2 uppercase">Listed</p>
                <p className="text-lg md:text-xl text-[#1F2937] font-black">
                  {new Date(product.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="pb-4 border-b-2 border-gray-200 md:border-b-0">
                <p className="text-xs font-black text-[#1F2937]/60 mb-2 uppercase">Total Votes</p>
                <p className="text-lg md:text-xl text-[#1F2937] font-black">{product.totalVotes || 0}</p>
              </div>
              <div className="pb-4 border-b-2 border-gray-200 md:border-b-0">
                <p className="text-xs font-black text-[#1F2937]/60 mb-2 uppercase">
                  {product.platform === 'website' ? 'Website URL' : 'Profile URL'}
                </p>
                <a
                  href={getVisitUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-black text-[#0F3460] hover:text-[#0D2A50] truncate inline-block"
                >
                  Visit →
                </a>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-[#0F3460] to-[#0D2A50] border-4 border-[#0F3460] rounded-2xl p-8 md:p-10 text-white shadow-lg">
            <h3 className="text-2xl md:text-3xl font-black mb-3 uppercase flex items-center gap-3">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Want to Get Ranked?
            </h3>
            <p className="text-sm md:text-base mb-6 text-white/90">Submit your product or profile and let the community vote it up the rankings.</p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-white text-[#0F3460] font-black rounded-xl hover:bg-gray-100 active:scale-95 transition-all uppercase text-sm md:text-base border-2 border-white shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Submit Your Product
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
