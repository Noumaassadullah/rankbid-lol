'use client';

import Header from '@/components/Header';
import { useState, useEffect, useCallback } from 'react';

interface Listing {
  id: string;
  url: string;
  title: string;
  description: string;
  category: string;
  platform: string;
  totalPaid: number;
  dayPaid: number;
  clickCount: number;
  createdAt: string;
  imageUrl?: string;
}

const CATEGORIES = [
  { value: 'Technology', label: 'Technology' },
  { value: 'ECommerce', label: 'E-Commerce' },
  { value: 'DigitalMarketing', label: 'Digital Marketing' },
  { value: 'Education', label: 'Education' },
  { value: 'Health', label: 'Health' },
  { value: 'Fashion', label: 'Fashion' },
  { value: 'Food', label: 'Food' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Business', label: 'Business' },
  { value: 'Other', label: 'Other' }
];

const PLATFORMS = [
  { id: 'website', label: 'Website', icon: '🌐' },
  { id: 'twitter', label: 'Twitter/X', icon: '𝕏' },
  { id: 'facebook', label: 'Facebook', icon: 'f' },
  { id: 'instagram', label: 'Instagram', icon: '📷' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' }
];

const getCategoryLabel = (categoryValue: string): string => {
  const category = CATEGORIES.find(cat => cat.value === categoryValue);
  return category ? category.label : categoryValue;
};

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeLeaderboard, setActiveLeaderboard] = useState<'alltime' | 'today'>('alltime');

  const [formData, setFormData] = useState({
    url: '',
    handle: '',
    description: '',
    category: '',
    platform: 'website',
    bidType: 'alltime' as 'alltime' | 'daily',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [currentBid, setCurrentBid] = useState(20);
  const [freeSpotAvailable, setFreeSpotAvailable] = useState(false);
  const [spotsRemaining, setSpotsRemaining] = useState(0);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataImage, setMetadataImage] = useState<string | null>(null);
  const [detectedPlatform, setDetectedPlatform] = useState('website');
  const [detectedCategory, setDetectedCategory] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<'PKR' | 'USD' | 'GBP' | 'INR'>('PKR');

  const PKR_RATE = 280; // 1 USD = 280 PKR
  const CURRENCY_RATES: { [key: string]: number } = {
    PKR: 1,
    USD: 280,
    GBP: 352,
    INR: 3.36,
  };

  const formatPrice = (amountInCents: number, currency: string = selectedCurrency): string => {
    const amountInPKR = (amountInCents / 100) * PKR_RATE;
    const rate = CURRENCY_RATES[currency] || CURRENCY_RATES.PKR;
    const converted = amountInPKR / rate;

    const symbols: { [key: string]: string } = {
      PKR: '₨',
      USD: '$',
      GBP: '£',
      INR: '₹',
    };

    const symbol = symbols[currency] || '₨';
    return `${symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  useEffect(() => {
    fetchListings();
    checkFreeSpots();
  }, [activeLeaderboard]);

  // Auto-detect platform and category from URL
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (formData.url && formData.url.startsWith('http')) {
        setMetadataLoading(true);
        try {
          const res = await fetch(`/api/metadata?url=${encodeURIComponent(formData.url)}`);
          if (res.ok) {
            const data = await res.json();
            setDetectedPlatform(data.platform);
            setDetectedCategory(data.category);
            setMetadataImage(data.image);
            // Auto-update platform based on detected URL
            // For LinkedIn, Twitter, Facebook, Instagram, TikTok - set to 'website' since they handle full URLs
            // This ensures the URL is used as-is, not reconstructed
            const detectedUrl = formData.url;
            const isFullUrl = detectedUrl.startsWith('http');
            if (isFullUrl) {
              setFormData(prev => ({
                ...prev,
                category: prev.category || data.category,
                platform: 'website' // Use 'website' platform for full URLs to preserve them as-is
              }));
            } else {
              // Handle is just a username, use detected platform
              setFormData(prev => ({ ...prev, category: prev.category || data.category, platform: data.platform }));
            }
          }
        } catch (error) {
          console.error('Error fetching metadata:', error);
        } finally {
          setMetadataLoading(false);
        }
      }
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [formData.url]);

  const checkFreeSpots = useCallback(async () => {
    try {
      const res = await fetch('/api/listings/submit?limit=100');
      const data = await res.json();
      const listingCount = data.listings?.length || 0;
      const remaining = Math.max(0, 10 - listingCount);
      setSpotsRemaining(remaining);
      setFreeSpotAvailable(remaining > 0);
    } catch (error) {
      console.error('Error checking free spots:', error);
    }
  }, []);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const sort = activeLeaderboard === 'today' ? 'dayPaid' : 'totalPaid';
      const res = await fetch(`/api/listings/submit?sort=${sort}&limit=100`);

      if (!res.ok) {
        setListings([]);
        return;
      }

      const text = await res.text();
      if (!text) {
        setListings([]);
        return;
      }

      const data = JSON.parse(text);
      setListings(data.listings || []);
    } catch (error) {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [activeLeaderboard]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (!formData.category) {
        setFormError('Please select a category');
        setFormLoading(false);
        return;
      }

      if (!formData.url && !formData.handle) {
        setFormError('Please enter a URL or handle');
        setFormLoading(false);
        return;
      }

      // Prepare data for submission
      const submitData = {
        url: formData.platform === 'website' ? formData.url : undefined,
        handle: formData.platform !== 'website' ? (formData.url || formData.handle) : undefined,
        description: formData.description,
        category: formData.category,
        platform: formData.platform,
      };

      // First check if this would be a free user listing
      const checkRes = await fetch('/api/listings/submit?limit=100');
      const checkData = await checkRes.json();
      const listingCount = checkData.listings?.length || 0;
      const isFreeUser = listingCount < 10;

      // If free user, create listing immediately
      if (isFreeUser) {
        const res = await fetch('/api/listings/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setFormError('');
        setFormData({ url: '', handle: '', description: '', category: '', platform: 'website', bidType: 'alltime' });
        setMetadataImage(null);
        setDetectedPlatform('website');
        setDetectedCategory('');
        setFormLoading(false);
        alert('🎉 Congratulations! You are in the first 10 users!\n\nYour listing is now live and ranked #1 for FREE!');
        fetchListings();
        return;
      }

      // For paid users: skip listing creation and go directly to payment
      // Convert selected currency to PKR, then to USD cents for payment system
      const rate = CURRENCY_RATES[selectedCurrency] || CURRENCY_RATES.PKR;
      const amountInPKR = currentBid * rate;
      const amountInCents = Math.round((amountInPKR / PKR_RATE) * 100);

      const checkoutRes = await fetch('/api/payment/jazzcash-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData: { ...submitData, bidType: formData.bidType },
          amount: amountInCents,
          bidType: formData.bidType,
        }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkoutData.error);

      window.location.href = checkoutData.url;
    } catch (error: any) {
      setFormError(error.message || 'Something went wrong');
      setFormLoading(false);
    }
  };

  const topListings = activeLeaderboard === 'today'
    ? listings.slice(0, 10).sort((a, b) => b.dayPaid - a.dayPaid)
    : listings.slice(0, 10).sort((a, b) => b.totalPaid - a.totalPaid);

  const minBidForFirst = topListings.length > 0
    ? Math.ceil(((activeLeaderboard === 'today' ? topListings[0].dayPaid : topListings[0].totalPaid) / 100) / PKR_RATE) + 1
    : 20;

  const calculateRank = (bid: number) => {
    // Convert PKR bid to cents for comparison
    const bidInCents = Math.round((bid / PKR_RATE) * 100);
    const higherBids = topListings.filter(l => {
      const amount = activeLeaderboard === 'today' ? l.dayPaid : l.totalPaid;
      return amount > bidInCents;
    }).length;
    return higherBids + 1;
  };

  const currentRank = calculateRank(currentBid);

  return (
    <>
      <Header />
      <div className="bg-white">

        {/* HERO */}
        <section className="bg-white pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-5xl mx-auto px-6">
            {/* Main Content */}
            <div className="mb-20">
              <p className="text-lg font-semibold text-gray-500 mb-6 uppercase tracking-wider">The Transparent Leaderboard</p>

              <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 leading-tight">
                Rank Your<br />Product
              </h1>

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed max-w-xl font-medium">
                  Pure pay-to-rank competition. No algorithms. No politics. Just merit.
                </p>

                <div className="flex gap-3 flex-col sm:flex-row">
                  <button
                    onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors"
                  >
                    Start Ranking
                  </button>
                  <button
                    onClick={() => document.querySelector('#leaderboard')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-8 py-3 bg-white text-gray-900 font-bold border-2 border-gray-300 rounded-xl hover:border-orange-500 hover:text-orange-600 transition-colors"
                  >
                    View Leaderboard
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* FORM SECTION */}
        <section className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-6">
            {/* Free Spots Banner */}
            {freeSpotAvailable && (
              <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
                <p className="text-center text-lg font-bold text-green-700">
                  🎁 {spotsRemaining} Free Spot{spotsRemaining !== 1 ? 's' : ''} Left - First 10 Users Get FREE Listing!
                </p>
              </div>
            )}
            {/* Ranking Tabs */}
            <div className="flex justify-center mb-12">
              <div className="flex gap-3 bg-gray-100 p-1.5 rounded-full">
                <button
                  onClick={() => setActiveLeaderboard('alltime')}
                  className={`px-6 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${
                    activeLeaderboard === 'alltime'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>🏆</span> All-time
                </button>
                <button
                  onClick={() => setActiveLeaderboard('today')}
                  className={`px-6 py-2 rounded-full font-semibold text-sm transition-all ${
                    activeLeaderboard === 'today'
                      ? 'bg-white text-orange-500'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="w-2 h-2 bg-orange-500 rounded-full inline-block mr-2"></span>
                  Today
                </button>
              </div>
            </div>

            {/* Bid Type Selector */}
            <div className="flex justify-center gap-2 mb-8">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, bidType: 'alltime' }))}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${
                  formData.bidType === 'alltime'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>🏆</span> All-time Ranking
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, bidType: 'daily' }))}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${
                  formData.bidType === 'daily'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="w-2 h-2 bg-blue-600 rounded-full inline-block"></span> Today Only
              </button>
            </div>

            {/* Bid Type Info */}
            <div className="text-center mb-8 p-4 bg-gray-50 rounded-lg max-w-2xl mx-auto">
              <p className="text-sm text-gray-600">
                {formData.bidType === 'alltime'
                  ? "💰 All-time bid: Your payment adds to your permanent ranking and stays counted forever"
                  : "⏰ Today-only bid: Your payment counts only for today's rankings, resets at UTC midnight"}
              </p>
            </div>

            {/* Currency Selector */}
            <div className="flex justify-center gap-2 mb-8">
              {(['PKR', 'USD', 'GBP', 'INR'] as const).map(currency => (
                <button
                  key={currency}
                  type="button"
                  onClick={() => setSelectedCurrency(currency)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                    selectedCurrency === currency
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {currency}
                </button>
              ))}
            </div>

            {/* Main Heading with Price */}
            <div className="text-center mb-12">
              <h2 className="text-5xl md:text-6xl font-black text-gray-900">
                Claim #1 {formData.bidType === 'daily' ? 'Today' : ''} for <span className="text-orange-500">{formatPrice(currentBid * 100)}</span>
              </h2>
              {topListings.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Top listing: {formatPrice(activeLeaderboard === 'today' ? topListings[0].dayPaid : topListings[0].totalPaid)} • Bid more to rank #1
                </p>
              )}
            </div>

            {/* Platform Selection */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {PLATFORMS.map(platform => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, platform: platform.id }))}
                  className={`px-4 py-2 rounded-full font-semibold transition-all ${
                    formData.platform === platform.id
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {platform.icon} {platform.label}
                </button>
              ))}
            </div>

            {/* Detected Platform Info */}
            {detectedPlatform && detectedCategory && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg flex items-center gap-4 max-w-2xl mx-auto">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Detected:</span> {detectedPlatform === 'website' ? '🌐' : ''}{detectedPlatform === 'linkedin' ? '🔗' : ''}{detectedPlatform === 'twitter' ? '𝕏' : ''}{detectedPlatform === 'facebook' ? 'f' : ''} {detectedPlatform.charAt(0).toUpperCase() + detectedPlatform.slice(1)} • {getCategoryLabel(detectedCategory)}
                  </p>
                </div>
              </div>
            )}

            {/* Compact Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-12">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium w-full">
                  {formError}
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
                {/* URL Input */}
                <input
                  type="text"
                  name="url"
                  placeholder={formData.platform === 'website' ? 'Your product URL' : 'Your @handle or page link'}
                  value={formData.url}
                  onChange={handleInputChange}
                  className="flex-1 px-6 py-4 border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />

                {/* Category Select */}
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="flex-1 px-6 py-4 border border-gray-300 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={formLoading || metadataLoading}
                  className="px-8 py-4 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 whitespace-nowrap shadow-md hover:shadow-lg"
                >
                  {formLoading ? 'Processing...' : metadataLoading ? 'Loading...' : 'Claim rank'}
                </button>
              </div>

              {/* Hidden Description Field */}
              <textarea
                name="description"
                placeholder="Brief description"
                value={formData.description}
                onChange={handleInputChange}
                rows={1}
                className="hidden"
              />
            </form>

            {/* Bid Adjuster - Separate from form */}
            <div className="flex justify-center items-center gap-6 pt-8 flex-col">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setCurrentBid(Math.max(20, currentBid - 1))}
                  className="text-orange-500 text-3xl font-bold hover:text-orange-600 transition-colors p-2 cursor-pointer"
                >
                  −
                </button>
                <p className="text-3xl md:text-4xl font-black text-orange-500 min-w-fit">
                  {formatPrice(currentBid * 100)}
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentBid(currentBid + 1)}
                  className="text-orange-500 text-3xl font-bold hover:text-orange-600 transition-colors p-2 cursor-pointer"
                >
                  +
                </button>
              </div>
              {currentBid < minBidForFirst && topListings.length > 0 && (
                <p className="text-sm text-orange-600 font-semibold">
                  Bid at least {formatPrice(minBidForFirst * 100)} to rank #1
                </p>
              )}
            </div>
          </div>
        </section>

        {/* LEADERBOARD */}
        <section id="leaderboard" className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Top Rankings</h2>

            <div className="flex gap-4 justify-center mb-8 border-b border-gray-200 pb-4">
              <button
                onClick={() => setActiveLeaderboard('alltime')}
                className={`px-6 py-2 font-semibold transition-colors ${activeLeaderboard === 'alltime' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                All Time
              </button>
              <button
                onClick={() => setActiveLeaderboard('today')}
                className={`px-6 py-2 font-semibold transition-colors ${activeLeaderboard === 'today' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Today
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-600">Loading rankings...</div>
            ) : topListings.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-lg font-semibold text-gray-900 mb-4">No listings yet</p>
                <button
                  onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Be First to List
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {topListings.map((listing, idx) => {
                  const amount = activeLeaderboard === 'today' ? listing.dayPaid : listing.totalPaid;
                  const amountInPKR = (amount / 100) * PKR_RATE;
                  // To rank at this position, you need to bid ₨1 more than current amount (in PKR)
                  const bidToRank = Math.ceil(amount / 100) + 1;

                  // Extract clean name from URL/title
                  const extractCleanName = (url: string): string => {
                    try {
                      // If it's a full URL, extract domain
                      if (url.startsWith('http')) {
                        const urlObj = new URL(url);
                        const hostname = urlObj.hostname;
                        // Remove www. and get first part
                        const parts = hostname.replace('www.', '').split('.');
                        const name = parts[0];
                        return name.charAt(0).toUpperCase() + name.slice(1);
                      }
                      // Otherwise use the title as-is (first word if it has spaces)
                      return url.split(' ')[0];
                    } catch {
                      return url.split(' ')[0];
                    }
                  };

                  const displayName = extractCleanName(listing.title);

                  return (
                    <a
                      key={listing.id}
                      href={listing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative group"
                    >
                      <div className="bg-white rounded-lg p-3 flex items-center justify-between hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer border border-gray-100 hover:border-orange-300">
                        {/* Left Section - Icon, Title, Description */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Rank Number */}
                          <div className="text-lg font-black text-orange-500 flex-shrink-0 w-6">#{idx + 1}</div>

                          {/* Icon */}
                          <div className="flex-shrink-0">
                            {listing.imageUrl ? (
                              <img
                                src={listing.imageUrl}
                                alt={displayName}
                                className="w-12 h-12 rounded-lg object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement?.classList.add('hidden');
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-base">
                                {displayName.charAt(0)}
                              </div>
                            )}
                          </div>

                          {/* Title & Description */}
                          <div className="flex-1 min-w-0 py-0.5">
                            <h3 className="font-bold text-gray-900 text-sm group-hover:text-orange-600 transition-colors line-clamp-1">
                              {displayName}
                            </h3>
                            <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                              {listing.description || getCategoryLabel(listing.category)}
                            </p>
                          </div>
                        </div>

                        {/* Right Section - Price */}
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="text-lg font-black text-orange-600">
                            {formatPrice(amount)}
                          </p>
                        </div>
                      </div>

                      {/* Hover Tooltip - Amount to Rank */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Pay {formatPrice(Math.ceil(bidToRank * (CURRENCY_RATES[selectedCurrency] / PKR_RATE)) * 100)} to rank here
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-3 border-transparent border-t-gray-900"></div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: '1', title: 'Submit', desc: 'Add your product URL or social media handle' },
                { num: '2', title: 'Bid', desc: 'Place your bid to claim your rank' },
                { num: '3', title: 'Dominate', desc: 'Get discovered by real makers' }
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                    <span className="text-lg font-bold text-orange-600">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>


      </div>
    </>
  );
}
